output "site_url" {
  description = "Public CloudFront URL for the Angular application."
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "chat_api_path" {
  description = "Same-origin path used by the Angular AI client."
  value       = "/api/ai/chat"
}

output "model_id" {
  description = "Bedrock model used by Conscious AI."
  value       = var.model_id
}

output "lambda_function_name" {
  description = "Lambda function that calls Amazon Bedrock Mantle."
  value       = aws_lambda_function.chat.function_name
}
