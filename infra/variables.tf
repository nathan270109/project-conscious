variable "aws_region" {
  description = "AWS region used by the application and Bedrock Mantle."
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile used for local Terraform runs."
  type        = string
  default     = "conscious"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}

variable "model_id" {
  description = "Amazon Bedrock Mantle model used by Conscious AI."
  type        = string
  default     = "google.gemma-4-e2b"

  validation {
    condition     = var.model_id == "google.gemma-4-e2b"
    error_message = "This deployment is intentionally restricted to google.gemma-4-e2b."
  }
}

variable "api_throttling_burst_limit" {
  description = "Maximum short burst accepted by the AI API."
  type        = number
  default     = 5
}

variable "api_throttling_rate_limit" {
  description = "Steady requests per second accepted by the AI API."
  type        = number
  default     = 2
}
