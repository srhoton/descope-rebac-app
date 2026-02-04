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

# IDP Service Outputs
output "idp_s3_bucket_name" {
  description = "Name of the IDP service S3 bucket"
  value       = aws_s3_bucket.idp_service.id
}

output "idp_s3_bucket_arn" {
  description = "ARN of the IDP service S3 bucket"
  value       = aws_s3_bucket.idp_service.arn
}

output "idp_cloudfront_distribution_id" {
  description = "ID of the IDP service CloudFront distribution"
  value       = aws_cloudfront_distribution.idp_service.id
}

output "idp_cloudfront_domain_name" {
  description = "Domain name of the IDP service CloudFront distribution"
  value       = aws_cloudfront_distribution.idp_service.domain_name
}

output "idp_service_url" {
  description = "URL of the IDP service"
  value       = "https://${var.idp_domain_name}"
}

output "idp_certificate_arn" {
  description = "ARN of the IDP service ACM certificate"
  value       = aws_acm_certificate.idp_service.arn
}

# Host Application Outputs
output "host_app_bucket_name" {
  description = "Host application S3 bucket name"
  value       = aws_s3_bucket.host_app.id
}

output "host_app_bucket_arn" {
  description = "Host application S3 bucket ARN"
  value       = aws_s3_bucket.host_app.arn
}

output "host_app_cloudfront_distribution_id" {
  description = "Host application CloudFront distribution ID"
  value       = aws_cloudfront_distribution.host_app.id
}

output "host_app_cloudfront_domain" {
  description = "Host application CloudFront distribution domain"
  value       = aws_cloudfront_distribution.host_app.domain_name
}

output "host_app_url" {
  description = "Host application URL"
  value       = "https://${var.host_app_domain_name}"
}

output "host_app_certificate_arn" {
  description = "ARN of the host application ACM certificate"
  value       = aws_acm_certificate.host_app.arn
}

# Module Federation URLs
output "remote_entry_url" {
  description = "URL of the remote entry point for module federation (s3_service)"
  value       = "https://${var.s3_service_domain_name}/assets/remoteEntry.js"
}
