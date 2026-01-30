variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "sandbox"
}

variable "vpc_id" {
  description = "ID of the VPC where the Lambda will be deployed"
  type        = string
  default     = "vpc-03163f35ccd0fc6a9"
}

variable "alb_arn" {
  description = "ARN of the existing Application Load Balancer"
  type        = string
  default     = "arn:aws:elasticloadbalancing:us-west-2:345594586248:loadbalancer/app/external-private-alb/720e2b5474d3d602"
}

variable "alb_listener_arn" {
  description = "ARN of the ALB listener (will be looked up if not provided)"
  type        = string
  default     = ""
}

variable "secrets_manager_secret_name" {
  description = "Name of the Secrets Manager secret containing Descope credentials"
  type        = string
  default     = "sandbox/descope/rebac"
}

variable "lambda_memory_size" {
  description = "Memory size for the Lambda function in MB"
  type        = number
  default     = 1024
}

variable "lambda_timeout" {
  description = "Timeout for the Lambda function in seconds"
  type        = number
  default     = 60
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 7
}

variable "service_name" {
  description = "Name of the service"
  type        = string
  default     = "org-service"
}

variable "path_pattern" {
  description = "Path pattern for ALB routing"
  type        = string
  default     = "/tenants*"
}

variable "health_check_path" {
  description = "Health check path for the Lambda function"
  type        = string
  default     = "/q/health"
}

# IDP Service Variables
variable "idp_domain_name" {
  description = "Domain name for the IDP service"
  type        = string
  default     = "descope-idp.sb.fullbay.com"
}

# S3 Service Variables
variable "s3_service_domain_name" {
  description = "Domain name for the S3 service"
  type        = string
  default     = "descope-s3.sb.fullbay.com"
}
