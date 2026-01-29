output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.org_service.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.org_service.arn
}

output "lambda_alias_arn" {
  description = "ARN of the Lambda alias"
  value       = aws_lambda_alias.org_service.arn
}

output "lambda_role_arn" {
  description = "ARN of the Lambda IAM role"
  value       = aws_iam_role.lambda.arn
}

output "target_group_arn" {
  description = "ARN of the Lambda target group"
  value       = aws_lb_target_group.lambda.arn
}

output "alb_listener_rule_arn" {
  description = "ARN of the ALB listener rule"
  value       = aws_lb_listener_rule.lambda.arn
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.lambda.name
}

output "service_endpoint" {
  description = "Service endpoint URL"
  value       = "https://${data.aws_lb.selected.dns_name}/tenants"
}
