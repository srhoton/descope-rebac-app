# Main Terraform configuration for Descope Tenant Management Service
#
# This configuration deploys a Quarkus-based Lambda function for managing
# Descope tenants. The Lambda is deployed in a private VPC subnet and
# accessible through an existing Application Load Balancer.
#
# Architecture:
# - Lambda function in private subnets
# - ALB for external access
# - Secrets Manager for Descope credentials
# - CloudWatch for logging
# - SnapStart enabled for improved cold start performance

# Note: All resources are defined in separate files:
# - versions.tf: Provider and version requirements
# - variables.tf: Input variables
# - data.tf: Data sources for existing resources
# - iam.tf: IAM roles and policies
# - lambda.tf: Lambda function and configuration
# - alb.tf: ALB target group and listener rules
# - cloudwatch.tf: CloudWatch log group
# - outputs.tf: Output values
