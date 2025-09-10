##############################
# IAM para Lambda
##############################

resource "aws_iam_role" "lambda_role" {
  name = "${local.name_prefix}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
  tags = {
    Project = local.project
    Stage   = local.stage
  }
}

# Logs básicos para Lambda
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB
resource "aws_iam_policy" "ddb_policy" {
  name   = "${local.name_prefix}-ddb-policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = ["dynamodb:*"],
      Resource = [
        aws_dynamodb_table.user_table.arn,
        "${aws_dynamodb_table.user_table.arn}/index/*"
      ]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ddb_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.ddb_policy.arn
}

# Secrets Manager (usar clave administrada por AWS)
resource "aws_iam_role_policy_attachment" "secrets_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
}

# S3 (bucket de avatares)
resource "aws_iam_policy" "s3_policy" {
  name   = "${local.name_prefix}-s3-policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = ["s3:PutObject","s3:GetObject","s3:DeleteObject"],
      Resource = ["${aws_s3_bucket.avatars.arn}/*"]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "s3_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.s3_policy.arn
}

# SQS (envío de mensajes)
resource "aws_iam_policy" "sqs_policy" {
  name   = "${local.name_prefix}-sqs-policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = ["sqs:SendMessage"],
      Resource = [aws_sqs_queue.card_request_queue.arn]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "sqs_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.sqs_policy.arn
}
