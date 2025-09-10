resource "aws_dynamodb_table" "user_table" {
  name         = "${local.name_prefix}-user-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uuid"
  range_key    = "document"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "document"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "document-index"
    hash_key        = "document"
    projection_type = "ALL"
  }

  # Para leer por uuid sin conocer document
  global_secondary_index {
    name            = "uuid-index"
    hash_key        = "uuid"
    projection_type = "ALL"
  }

  tags = {
    Project = local.project
    Stage   = local.stage
  }
}
