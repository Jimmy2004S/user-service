resource "aws_secretsmanager_secret" "password_secret" {
  name        = "${local.name_prefix}-password-secret-v7"
  description = "JWT secret + optional pepper"

  # AWS-managed key para Secrets Manager (acepta alias directamente)
  kms_key_id  = "alias/aws/secretsmanager"

  tags = {
    Project = local.project
    Stage   = local.stage
  }
}

resource "aws_secretsmanager_secret_version" "password_secret_v" {
  secret_id     = aws_secretsmanager_secret.password_secret.id
  secret_string = jsonencode({
    JWT_SECRET = var.jwt_secret_value
    PEPPER     = null
  })
}