locals {
  # Nombre del proyecto (constante)
  project = "inferno-user-service"

  # Stage viene de la variable -var="stage=dev|stg|prod"
  stage = var.stage

  # Prefijo común para nombrar recursos
  name_prefix = "${local.project}-${local.stage}"
}

terraform {
  required_providers {
    aws     = { source = "hashicorp/aws",     version = "~> 5.50" }
    archive = { source = "hashicorp/archive", version = "~> 2.5" }
    random  = { source = "hashicorp/random",  version = "~> 3.6" }
  }
}

provider "aws" {
  region  = var.region
  profile = "inferno-dev"
}

variable "apigateway_arn" {
  description = "ARN de la API Gateway centralizada"
  type        = string
  default     = "arn:aws:execute-api:us-west-1:149078755102:m9ugzkc15h/*/*/*"
}

resource "aws_lambda_permission" "allow_apigw_register" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.register.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = var.apigateway_arn
}

resource "aws_lambda_permission" "allow_apigw_login" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.login.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = var.apigateway_arn
}

resource "aws_lambda_permission" "allow_apigw_update" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.updateProfile.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = var.apigateway_arn
}

resource "aws_lambda_permission" "allow_apigw_upload" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.upload_avatar.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = var.apigateway_arn
}

resource "aws_lambda_permission" "allow_apigw_get" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_profile.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = var.apigateway_arn
}
