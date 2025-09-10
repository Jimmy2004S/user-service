data "aws_sqs_queue" "create-request-card-sqs" {
  name = "create-request-card-sqs" 
}

data "aws_sqs_queue" "notification-email-sqs" {
  name = "notification-email-sqs" #notification-email-sqs
}