# Security group for Lambda function
resource "aws_security_group" "lambda" {
  name        = "${var.service_name}-lambda-sg"
  description = "Security group for ${var.service_name} Lambda function"
  vpc_id      = var.vpc_id

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.service_name}-lambda-sg"
  }
}

# Package Lambda function code
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../org_service/build/quarkus-app"
  output_path = "${path.module}/function.zip"
}

# Lambda function
resource "aws_lambda_function" "org_service" {
  filename         = data.archive_file.lambda.output_path
  function_name    = var.service_name
  role             = aws_iam_role.lambda.arn
  handler          = "io.quarkus.amazon.lambda.runtime.QuarkusStreamHandler::handleRequest"
  source_code_hash = data.archive_file.lambda.output_base64sha256
  runtime          = "java21"
  memory_size      = var.lambda_memory_size
  timeout          = var.lambda_timeout

  vpc_config {
    subnet_ids         = data.aws_subnets.private.ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DESCOPE_PROJECT_ID     = jsondecode(data.aws_secretsmanager_secret_version.descope_credentials.secret_string)["projectId"]
      DESCOPE_MANAGEMENT_KEY = jsondecode(data.aws_secretsmanager_secret_version.descope_credentials.secret_string)["managementKey"]
      QUARKUS_LAMBDA_HANDLER = "io.quarkus.amazon.lambda.runtime.QuarkusStreamHandler"
    }
  }

  snap_start {
    apply_on = "PublishedVersions"
  }

  tags = {
    Name = var.service_name
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc,
    aws_iam_role_policy.secrets_manager,
    aws_cloudwatch_log_group.lambda
  ]
}

# Get latest secret version
data "aws_secretsmanager_secret_version" "descope_credentials" {
  secret_id = data.aws_secretsmanager_secret.descope_credentials.id
}

# Lambda alias for SnapStart
resource "aws_lambda_alias" "org_service" {
  name             = "live"
  function_name    = aws_lambda_function.org_service.function_name
  function_version = aws_lambda_function.org_service.version
}

# Permission for ALB to invoke Lambda
resource "aws_lambda_permission" "alb" {
  statement_id  = "AllowExecutionFromALB"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.org_service.function_name
  principal     = "elasticloadbalancing.amazonaws.com"
  source_arn    = aws_lb_target_group.lambda.arn
}
