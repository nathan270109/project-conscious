data "aws_caller_identity" "current" {}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}

locals {
  name_prefix = "project-conscious-${var.environment}"
  build_dir   = "${path.module}/../dist/project-conscious/browser"
  site_files  = fileset(local.build_dir, "**")
  common_tags = {
    Project     = "project-conscious"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
  mime_types = {
    css   = "text/css; charset=utf-8"
    html  = "text/html; charset=utf-8"
    ico   = "image/x-icon"
    jpeg  = "image/jpeg"
    jpg   = "image/jpeg"
    js    = "text/javascript; charset=utf-8"
    json  = "application/json; charset=utf-8"
    mp4   = "video/mp4"
    png   = "image/png"
    svg   = "image/svg+xml"
    webp  = "image/webp"
    woff  = "font/woff"
    woff2 = "font/woff2"
  }
}

data "archive_file" "chat_lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/app.py"
  output_path = "${path.module}/.terraform/chat-lambda.zip"
}

resource "aws_iam_role" "chat_lambda" {
  name = "${local.name_prefix}-chat-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "chat_lambda" {
  name = "${local.name_prefix}-chat-lambda"
  role = aws_iam_role.chat_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "WriteFunctionLogs"
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "${aws_cloudwatch_log_group.chat_lambda.arn}:*"
      },
      {
        Sid      = "InvokeOnlyConfiguredGemmaModel"
        Effect   = "Allow"
        Action   = "bedrock-mantle:CreateInference"
        Resource = "*"
        Condition = {
          StringEquals = { "bedrock-mantle:Model" = var.model_id }
        }
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "chat_lambda" {
  name              = "/aws/lambda/${local.name_prefix}-chat"
  retention_in_days = 14
}

resource "aws_lambda_function" "chat" {
  function_name = "${local.name_prefix}-chat"
  description   = "Answers Project Conscious analysis questions with Bedrock Gemma 4 E2B."
  role          = aws_iam_role.chat_lambda.arn
  runtime       = "python3.13"
  handler       = "app.handler"
  filename      = data.archive_file.chat_lambda.output_path

  source_code_hash = data.archive_file.chat_lambda.output_base64sha256
  memory_size      = 256
  timeout          = 45

  environment {
    variables = {
      MODEL_ID     = var.model_id
      MODEL_REGION = var.aws_region
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.chat_lambda,
    aws_iam_role_policy.chat_lambda,
  ]
}

resource "aws_apigatewayv2_api" "chat" {
  name          = "${local.name_prefix}-chat"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "chat" {
  api_id                 = aws_apigatewayv2_api.chat.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.chat.invoke_arn
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

resource "aws_apigatewayv2_route" "chat" {
  api_id    = aws_apigatewayv2_api.chat.id
  route_key = "POST /api/ai/chat"
  target    = "integrations/${aws_apigatewayv2_integration.chat.id}"
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/apigateway/${local.name_prefix}-chat"
  retention_in_days = 14
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.chat.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = var.api_throttling_burst_limit
    throttling_rate_limit  = var.api_throttling_rate_limit
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      responseLength   = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowApiGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chat.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.chat.execution_arn}/*/*"
}

resource "aws_s3_bucket" "site" {
  bucket        = "${local.name_prefix}-site-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_lifecycle_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    filter {}
    noncurrent_version_expiration { noncurrent_days = 30 }
  }

  depends_on = [aws_s3_bucket_versioning.site]
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${local.name_prefix}-site"
  description                       = "Private S3 access for Project Conscious"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Project Conscious ${var.environment}"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "project-conscious-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  origin {
    domain_name = replace(aws_apigatewayv2_api.chat.api_endpoint, "https://", "")
    origin_id   = "project-conscious-ai-api"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
      origin_read_timeout    = 30
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "project-conscious-s3"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 300
    max_ttl     = 3600
  }

  ordered_cache_behavior {
    path_pattern             = "/api/ai/*"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD"]
    target_origin_id         = "project-conscious-ai-api"
    viewer_protocol_policy   = "https-only"
    compress                 = true
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }
}

data "aws_iam_policy_document" "site" {
  statement {
    sid    = "AllowCloudFrontReadOnly"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket     = aws_s3_bucket.site.id
  policy     = data.aws_iam_policy_document.site.json
  depends_on = [aws_s3_bucket_public_access_block.site]
}

resource "aws_s3_object" "site" {
  for_each = local.site_files

  bucket        = aws_s3_bucket.site.id
  key           = each.value
  source        = "${local.build_dir}/${each.value}"
  source_hash   = filemd5("${local.build_dir}/${each.value}")
  content_type  = lookup(local.mime_types, lower(element(reverse(split(".", each.value)), 0)), "application/octet-stream")
  cache_control = each.value == "index.html" ? "no-cache, no-store, must-revalidate" : "public, max-age=86400"

  depends_on = [aws_s3_bucket_policy.site]
}
