variable "region" {
  type        = string
  default     = "us-west-1"
  description = "AWS region"
}

variable "stage" {
  type        = string
  default     = "dev"
  description = "Environment stage (dev|stg|prod)"
}

variable "jwt_secret_value" {
  type        = string
  sensitive   = true
  default     = "distribucion2025"
}
