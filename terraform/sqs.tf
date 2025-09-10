resource "aws_sqs_queue" "card_request_queue" {
  name = "${local.name_prefix}-card-request-queue"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 86400
  tags = {
    Project = local.project
    Stage   = local.stage
  }
}
