output "user_table_name" {
  value = aws_dynamodb_table.user_table.id
}

output "avatars_bucket" {
  value = aws_s3_bucket.avatars.id
}

output "password_secret_arn" {
  value = aws_secretsmanager_secret.password_secret.arn
}

output "card_request_queue_url" {
  value       = data.aws_sqs_queue.create-request-card-sqs.url
  description = "URL de la cola SQS para solicitudes de tarjeta"
}

output "register_lambda_arn" {
  value       = aws_lambda_function.register.arn
  description = "ARN de la Lambda de registro de usuario"
}

output "login_lambda_arn" {
  value       = aws_lambda_function.login.arn
  description = "ARN de la Lambda de login de usuario"
}

output "update_lambda_arn" {
  value       = aws_lambda_function.updateProfile.arn
  description = "ARN de la Lambda de actualización de usuario"
}

output "upload_lambda_arn" {
  value       = aws_lambda_function.upload_avatar.arn
  description = "ARN de la Lambda de subida de avatar"
}

output "get_lambda_arn" {
  value       = aws_lambda_function.get_profile.arn
  description = "ARN de la Lambda de obtención de perfil de usuario"
}
