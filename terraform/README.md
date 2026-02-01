# Terraform Infrastructure for Org Service

This Terraform configuration deploys the Descope Tenant Management Service (Org Service) to AWS.

## Architecture

The infrastructure consists of:

- **AWS Lambda Function**: Quarkus-based Java 21 Lambda running the tenant management service
- **Application Load Balancer Integration**: Routes `/tenants*` requests to the Lambda function
- **VPC Configuration**: Lambda deployed in private subnets for security
- **Secrets Manager**: Stores Descope project ID and management key
- **CloudWatch Logs**: 7-day retention for Lambda execution logs
- **SnapStart**: Enabled for improved cold start performance

## Prerequisites

1. **Terraform**: Version 1.5.0 or later
2. **AWS CLI**: Configured with appropriate credentials
3. **Existing Infrastructure**:
   - VPC with private subnets tagged `tier=private`
   - Application Load Balancer with HTTPS listener
   - Secrets Manager secret with Descope credentials

4. **Built Lambda Artifact**: Run the following in the `org_service` directory:
   ```bash
   cd ../org_service
   ./gradlew build -Dquarkus.package.type=fast-jar
   ```

## Configuration

### Required Variables

The following variables have default values but can be overridden:

| Variable | Default | Description |
|----------|---------|-------------|
| `aws_region` | `us-west-2` | AWS region |
| `environment` | `sandbox` | Environment name |
| `vpc_id` | `vpc-03163f35ccd0fc6a9` | VPC ID |
| `alb_arn` | `arn:aws:elasticloadbalancing:us-west-2:345594586248:loadbalancer/app/external-private-alb/720e2b5474d3d602` | ALB ARN |
| `secrets_manager_secret_name` | `sandbox/descope/rebac` | Secrets Manager secret name |
| `lambda_memory_size` | `1024` | Lambda memory in MB |
| `lambda_timeout` | `60` | Lambda timeout in seconds |
| `log_retention_days` | `7` | CloudWatch log retention |
| `service_name` | `org-service` | Service name |
| `path_pattern` | `/tenants*` | ALB path pattern |
| `health_check_path` | `/q/health` | Health check endpoint |

### Secrets Manager Secret Format

The Secrets Manager secret should contain a JSON object with:

```json
{
  "projectId": "your-descope-project-id",
  "managementKey": "your-descope-management-key"
}
```

## Usage

### Initialize Terraform

```bash
terraform init
```

### Plan Deployment

```bash
terraform plan
```

### Apply Configuration

```bash
terraform apply
```

### Destroy Infrastructure

```bash
terraform destroy
```

## Outputs

After applying, Terraform will output:

- `lambda_function_name`: Name of the deployed Lambda function
- `lambda_function_arn`: ARN of the Lambda function
- `lambda_alias_arn`: ARN of the Lambda alias (for SnapStart)
- `lambda_role_arn`: ARN of the Lambda IAM role
- `target_group_arn`: ARN of the target group
- `alb_listener_rule_arn`: ARN of the ALB listener rule
- `cloudwatch_log_group_name`: Name of the CloudWatch log group
- `service_endpoint`: Full URL to access the service

## File Structure

```
terraform/
├── README.md           # This file
├── main.tf             # Main configuration (documentation)
├── versions.tf         # Provider versions
├── variables.tf        # Input variables
├── data.tf             # Data sources
├── iam.tf              # IAM roles and policies
├── lambda.tf           # Lambda function configuration
├── alb.tf              # ALB integration
├── cloudwatch.tf       # CloudWatch logs
└── outputs.tf          # Output values
```

## State Management

This configuration uses local state by default. For production use, configure remote state using S3 and DynamoDB:

```hcl
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "org-service/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

## Security Considerations

1. **VPC**: Lambda runs in private subnets with no direct internet access
2. **Secrets**: Credentials stored in Secrets Manager, not in code
3. **IAM**: Least privilege principle - Lambda can only read specific secret
4. **Encryption**: Secrets Manager encrypts data at rest
5. **Logging**: All Lambda invocations logged to CloudWatch

## Troubleshooting

### Lambda Not Responding

1. Check CloudWatch logs: `/aws/lambda/org-service`
2. Verify Secrets Manager secret exists and has correct format
3. Check Lambda has network connectivity from private subnets

### ALB Returns 502

1. Verify target group health checks are passing
2. Check Lambda timeout is sufficient (60s default)
3. Review Lambda execution logs

### Permission Errors

1. Verify IAM role has required permissions
2. Check Secrets Manager resource policy
3. Ensure Lambda can access VPC resources

## Maintenance

### Updating the Lambda Function

1. Build new Lambda artifact:
   ```bash
   cd ../org_service && ./gradlew build
   ```

2. Apply Terraform changes:
   ```bash
   terraform apply
   ```

### Modifying Configuration

Update `variables.tf` or provide values via:
- Command line: `terraform apply -var="lambda_memory_size=2048"`
- Variable file: `terraform apply -var-file="production.tfvars"`
- Environment variables: `TF_VAR_lambda_memory_size=2048`

## License

Copyright © 2026 Fullbay
