# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Get current AWS region
data "aws_region" "current" {}

# Get VPC information
data "aws_vpc" "selected" {
  id = var.vpc_id
}

# Get private subnets tagged with tier=private
data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }

  tags = {
    tier = "private"
  }
}

# Get Secrets Manager secret
data "aws_secretsmanager_secret" "descope_credentials" {
  name = var.secrets_manager_secret_name
}

# Get ALB information
data "aws_lb" "selected" {
  arn = var.alb_arn
}

# Get ALB listener (HTTPS on port 443)
data "aws_lb_listener" "https" {
  load_balancer_arn = var.alb_arn
  port              = 443
}
