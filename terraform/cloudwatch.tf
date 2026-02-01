# CloudWatch log group for Lambda function
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.service_name}"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${var.service_name}-logs"
  }
}
