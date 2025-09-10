# Alias administrado por AWS para Lambda
data "aws_kms_alias" "lambda_managed_alias" {
  name = "alias/aws/lambda"
}

# Obtener la KEY (no alias) detrás del alias
data "aws_kms_key" "lambda_managed_key" {
  key_id = data.aws_kms_alias.lambda_managed_alias.target_key_id
}

locals {
  # Usaremos el ARN de la KEY (…:key/<uuid>)
  lambda_kms_key_arn = data.aws_kms_key.lambda_managed_key.arn

  # Variables de entorno compartidas
  env_vars = {
    TABLE_NAME             = aws_dynamodb_table.user_table.id
    BUCKET_NAME            = aws_s3_bucket.avatars.id
    SECRET_ID              = aws_secretsmanager_secret.password_secret.id
    JWT_EXP_HOURS          = "12"
    BCRYPT_SALT_ROUNDS     = "12"
    CARD_REQUEST_QUEUE_URL   = data.aws_sqs_queue.create-request-card-sqs.url
    NOTIFICATIONS_QUEUE_URL  = data.aws_sqs_queue.notification-email-sqs.url
  }
}

# ---------- Register ----------
data "archive_file" "register" {
  type        = "zip"
  source_file = "${path.module}/../dist/register.js"
  output_path = "${path.module}/artifacts/register.zip"
}

resource "aws_lambda_function" "register" {
  function_name    = "${local.name_prefix}-register-user"
  role             = aws_iam_role.lambda_role.arn
  handler          = "register.handler"
  runtime          = "nodejs20.x"
  timeout          = 10

  filename         = data.archive_file.register.output_path
  source_code_hash = data.archive_file.register.output_base64sha256

  environment { variables = local.env_vars }

  # Previene errores KMS: usar KEY ARN
  kms_key_arn = local.lambda_kms_key_arn

  tags = { Project = local.project, Stage = local.stage }
}

# ---------- Login ----------
data "archive_file" "login" {
  type        = "zip"
  source_file = "${path.module}/../dist/login.js"
  output_path = "${path.module}/artifacts/login.zip"
}

resource "aws_lambda_function" "login" {
  function_name    = "${local.name_prefix}-login-user"
  role             = aws_iam_role.lambda_role.arn
  handler          = "login.handler"
  runtime          = "nodejs20.x"
  timeout          = 10

  filename         = data.archive_file.login.output_path
  source_code_hash = data.archive_file.login.output_base64sha256

  environment { variables = local.env_vars }

  kms_key_arn = local.lambda_kms_key_arn

  tags = { Project = local.project, Stage = local.stage }
}

# ---------- Update Profile ----------
data "archive_file" "updateProfile" {
  type        = "zip"
  source_file = "${path.module}/../dist/updateProfile.js"
  output_path = "${path.module}/artifacts/updateProfile.zip"
}

resource "aws_lambda_function" "updateProfile" {
  function_name    = "${local.name_prefix}-update-profile"
  role             = aws_iam_role.lambda_role.arn
  handler          = "updateProfile.handler"
  runtime          = "nodejs20.x"
  timeout          = 10

  filename         = data.archive_file.updateProfile.output_path
  source_code_hash = data.archive_file.updateProfile.output_base64sha256

  environment { variables = local.env_vars }

  kms_key_arn = local.lambda_kms_key_arn

  tags = { Project = local.project, Stage = local.stage }
}

# ---------- Upload Avatar ----------
data "archive_file" "upload_avatar" {
  type        = "zip"
  source_file = "${path.module}/../dist/uploadAvatar.js"
  output_path = "${path.module}/artifacts/uploadAvatar.zip"
}

resource "aws_lambda_function" "upload_avatar" {
  function_name    = "${local.name_prefix}-upload-avatar"
  role             = aws_iam_role.lambda_role.arn
  handler          = "uploadAvatar.handler"
  runtime          = "nodejs20.x"
  timeout          = 10

  filename         = data.archive_file.upload_avatar.output_path
  source_code_hash = data.archive_file.upload_avatar.output_base64sha256

  environment { variables = local.env_vars }

  kms_key_arn = local.lambda_kms_key_arn

  tags = { Project = local.project, Stage = local.stage }
}

# ---------- Get Profile ----------
data "archive_file" "get_profile" {
  type        = "zip"
  source_file = "${path.module}/../dist/getProfile.js"
  output_path = "${path.module}/artifacts/getProfile.zip"
}

resource "aws_lambda_function" "get_profile" {
  function_name    = "${local.name_prefix}-get-profile"
  role             = aws_iam_role.lambda_role.arn
  handler          = "getProfile.handler"
  runtime          = "nodejs20.x"
  timeout          = 10

  filename         = data.archive_file.get_profile.output_path
  source_code_hash = data.archive_file.get_profile.output_base64sha256

  environment { variables = local.env_vars }

  kms_key_arn = local.lambda_kms_key_arn

  tags = { Project = local.project, Stage = local.stage }
}
