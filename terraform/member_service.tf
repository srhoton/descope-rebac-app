# Member Service Lambda function and related resources

locals {
  member_service_name = "member-service"
}

# CloudWatch log group for Member Service Lambda
resource "aws_cloudwatch_log_group" "member_service" {
  name              = "/aws/lambda/${local.member_service_name}"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${local.member_service_name}-logs"
  }
}

# Security group for Member Service Lambda (reuses same outbound rules)
resource "aws_security_group" "member_service_lambda" {
  name        = "${local.member_service_name}-lambda-sg"
  description = "Security group for ${local.member_service_name} Lambda function"
  vpc_id      = var.vpc_id

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.member_service_name}-lambda-sg"
  }
}

# Member Service Lambda function
resource "aws_lambda_function" "member_service" {
  filename         = "${path.module}/../member_service/build/function.zip"
  function_name    = local.member_service_name
  role             = aws_iam_role.lambda.arn
  handler          = "io.quarkus.amazon.lambda.runtime.QuarkusStreamHandler::handleRequest"
  source_code_hash = filebase64sha256("${path.module}/../member_service/build/function.zip")
  runtime          = "java21"
  memory_size      = var.lambda_memory_size
  timeout          = var.lambda_timeout

  vpc_config {
    subnet_ids         = data.aws_subnets.private.ids
    security_group_ids = [aws_security_group.member_service_lambda.id]
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
    Name = local.member_service_name
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc,
    aws_iam_role_policy.secrets_manager,
    aws_cloudwatch_log_group.member_service
  ]
}

# Member Service Lambda alias for SnapStart
resource "aws_lambda_alias" "member_service" {
  name             = "live"
  function_name    = aws_lambda_function.member_service.function_name
  function_version = aws_lambda_function.member_service.version
}

# Target group for Member Service Lambda
resource "aws_lb_target_group" "member_service" {
  name        = "${local.member_service_name}-lambda-tg"
  target_type = "lambda"

  health_check {
    enabled             = true
    path                = var.health_check_path
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "${local.member_service_name}-lambda-tg"
  }

  lifecycle {
    ignore_changes = [health_check[0].protocol, health_check[0].port]
  }
}

# Permission for ALB to invoke Member Service Lambda alias
resource "aws_lambda_permission" "member_service_alb" {
  statement_id  = "AllowExecutionFromALB"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.member_service.function_name
  qualifier     = aws_lambda_alias.member_service.name
  principal     = "elasticloadbalancing.amazonaws.com"
  source_arn    = aws_lb_target_group.member_service.arn
}

# Attach Member Service Lambda to target group
resource "aws_lb_target_group_attachment" "member_service" {
  target_group_arn = aws_lb_target_group.member_service.arn
  target_id        = aws_lambda_alias.member_service.arn
  depends_on       = [aws_lambda_permission.member_service_alb]
}

# ALB listener rule for Member Service
# Uses priority 240 to match /tenants/*/members* before the /tenants* rule (priority 250)
resource "aws_lb_listener_rule" "member_service" {
  listener_arn = data.aws_lb_listener.https.arn
  priority     = 240

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.member_service.arn
  }

  condition {
    path_pattern {
      values = ["/tenants/*/members*"]
    }
  }

  tags = {
    Name = "${local.member_service_name}-listener-rule"
  }
}

# Outputs for Member Service
output "member_service_lambda_function_name" {
  description = "Name of the Member Service Lambda function"
  value       = aws_lambda_function.member_service.function_name
}

output "member_service_lambda_function_arn" {
  description = "ARN of the Member Service Lambda function"
  value       = aws_lambda_function.member_service.arn
}

output "member_service_lambda_alias_arn" {
  description = "ARN of the Member Service Lambda alias"
  value       = aws_lambda_alias.member_service.arn
}

output "member_service_target_group_arn" {
  description = "ARN of the Member Service target group"
  value       = aws_lb_target_group.member_service.arn
}

output "member_service_endpoint" {
  description = "Member Service endpoint URL"
  value       = "https://${data.aws_lb.selected.dns_name}/tenants/{tenantId}/members"
}
