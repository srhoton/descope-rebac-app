# Target group for Lambda function
resource "aws_lb_target_group" "lambda" {
  name        = "${var.service_name}-lambda-tg"
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
    Name = "${var.service_name}-lambda-tg"
  }

  lifecycle {
    ignore_changes = [health_check[0].protocol, health_check[0].port]
  }
}

# Attach Lambda to target group
resource "aws_lb_target_group_attachment" "lambda" {
  target_group_arn = aws_lb_target_group.lambda.arn
  target_id        = aws_lambda_alias.org_service.arn
  depends_on       = [aws_lambda_permission.alb]
}

# ALB listener rule to route traffic to Lambda
resource "aws_lb_listener_rule" "lambda" {
  listener_arn = data.aws_lb_listener.https.arn
  priority     = 250

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lambda.arn
  }

  condition {
    path_pattern {
      values = [var.path_pattern]
    }
  }

  tags = {
    Name = "${var.service_name}-listener-rule"
  }
}
