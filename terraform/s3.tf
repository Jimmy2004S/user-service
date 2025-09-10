# Sufijo aleatorio de 3 bytes (6 hex)
resource "random_id" "bucket_suffix" {
  byte_length = 3
}

resource "aws_s3_bucket" "avatars" {
  bucket = "${local.name_prefix}-avatars-${random_id.bucket_suffix.hex}"
  tags   = { Project = local.project, Stage = local.stage }
}

resource "aws_s3_bucket_public_access_block" "avatars_block" {
  bucket                  = aws_s3_bucket.avatars.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}
