# IDP Service Deployment Guide

This document describes how to deploy the Descope IDP Service static website to AWS using Terraform.

## Architecture

The IDP service is deployed as a static website using:
- **S3**: Hosts the React application build artifacts
- **CloudFront**: CDN for global distribution with HTTPS
- **ACM**: SSL/TLS certificate for custom domain
- **Route53**: DNS management for descope-idp.sb.fullbay.com

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.5.0 installed
3. Node.js 18+ and npm for building the React application
4. Route53 hosted zone for `sb.fullbay.com` must exist

## Deployment Steps

### 1. Build the React Application

```bash
cd ../idp_service

# Install dependencies
npm install

# Create .env file with Descope project ID
echo "VITE_DESCOPE_PROJECT_ID=P38a668rJn8AUs65nESCiJqendj6" > .env

# Build for production
npm run build

# The dist/ directory now contains the static files
```

### 2. Initialize Terraform

```bash
cd ../terraform

# Initialize Terraform (first time only)
terraform init
```

### 3. Plan the Deployment

```bash
# Review the infrastructure changes
terraform plan

# The plan should show:
# - ACM certificate in us-east-1
# - S3 bucket for static hosting
# - CloudFront distribution
# - Route53 DNS records
# - Security headers and policies
```

### 4. Apply the Infrastructure

```bash
# Deploy the infrastructure
terraform apply

# Type 'yes' when prompted
```

The deployment will:
1. Create ACM certificate and wait for DNS validation (~5-10 minutes)
2. Create S3 bucket with versioning and lifecycle policies
3. Create CloudFront distribution (~15-20 minutes)
4. Create Route53 DNS records

**Total deployment time: ~20-30 minutes** (mainly CloudFront propagation)

### 5. Upload the React Application

```bash
# Upload the build artifacts to S3
aws s3 sync ../idp_service/dist/ s3://$(terraform output -raw idp_s3_bucket_name)/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML files with no-cache (for SPA routing)
aws s3 sync ../idp_service/dist/ s3://$(terraform output -raw idp_s3_bucket_name)/ \
  --exclude "*" \
  --include "*.html" \
  --include "*.json" \
  --cache-control "no-cache, no-store, must-revalidate"
```

### 6. Invalidate CloudFront Cache

```bash
# Create invalidation to immediately serve new content
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw idp_cloudfront_distribution_id) \
  --paths "/*"
```

### 7. Verify Deployment

```bash
# Get the service URL
terraform output idp_service_url

# Output: https://descope-idp.sb.fullbay.com

# Test the deployment
curl -I https://descope-idp.sb.fullbay.com

# You should see:
# - HTTP/2 200 status
# - Security headers (X-Frame-Options, Strict-Transport-Security, etc.)
# - CloudFront headers
```

## Configuration

### Variables

All IDP service variables are defined in `variables.tf`:

```hcl
variable "idp_domain_name" {
  description = "Domain name for the IDP service"
  type        = string
  default     = "descope-idp.sb.fullbay.com"
}
```

To override:

```bash
terraform apply -var="idp_domain_name=custom-idp.sb.fullbay.com"
```

### Environment Variables

The React application requires the following environment variable:

```env
VITE_DESCOPE_PROJECT_ID=P38a668rJn8AUs65nESCiJqendj6
```

This is set during the build process and baked into the static files.

## Updating the Application

To deploy a new version:

```bash
# 1. Build the updated React application
cd ../idp_service
npm run build

# 2. Sync to S3
cd ../terraform
aws s3 sync ../idp_service/dist/ s3://$(terraform output -raw idp_s3_bucket_name)/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json"

aws s3 sync ../idp_service/dist/ s3://$(terraform output -raw idp_s3_bucket_name)/ \
  --exclude "*" \
  --include "*.html" \
  --include "*.json" \
  --cache-control "no-cache, no-store, must-revalidate"

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw idp_cloudfront_distribution_id) \
  --paths "/*"
```

## Rollback

S3 versioning is enabled, allowing rollback to previous versions:

```bash
# List object versions
aws s3api list-object-versions \
  --bucket $(terraform output -raw idp_s3_bucket_name) \
  --prefix index.html

# Restore a previous version (replace with actual version ID)
aws s3api copy-object \
  --bucket $(terraform output -raw idp_s3_bucket_name) \
  --copy-source $(terraform output -raw idp_s3_bucket_name)/index.html?versionId=VERSION_ID \
  --key index.html

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw idp_cloudfront_distribution_id) \
  --paths "/*"
```

## Security Features

### S3 Bucket
- Versioning enabled for rollback capability
- Public access blocked (CloudFront accesses via OAC)
- Lifecycle policy to delete old versions after 30 days
- Server-side encryption enabled by default

### CloudFront
- HTTPS only (HTTP redirects to HTTPS)
- TLS 1.2+ enforced
- Security headers policy:
  - Strict-Transport-Security
  - X-Frame-Options: DENY
  - X-XSS-Protection
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy
- Origin Access Control (OAC) for S3 access
- SPA routing support (404/403 → index.html)

### ACM Certificate
- DNS validation (automated via Route53)
- TLS 1.2 minimum protocol version
- Certificate in us-east-1 (required for CloudFront)

## Monitoring

### CloudWatch Logs
CloudFront access logs are available in CloudWatch Logs:

```bash
# View recent logs
aws logs tail /aws/cloudfront/$(terraform output -var environment)-idp-service --follow
```

### CloudFront Metrics
Monitor via AWS Console:
- Requests
- Bytes downloaded
- Error rates (4xx, 5xx)
- Cache hit ratio

## Costs

Estimated monthly costs (based on moderate traffic):

- S3 storage: $0.023 per GB (~$1 for 50GB)
- CloudFront data transfer: $0.085 per GB (~$8.50 for 100GB)
- CloudFront requests: $0.0075 per 10,000 requests (~$0.75 for 1M requests)
- Route53 hosted zone: $0.50
- **Total: ~$10-20/month for moderate traffic**

## Troubleshooting

### Certificate validation fails
- Ensure Route53 hosted zone exists for `sb.fullbay.com`
- Check DNS propagation: `dig TXT _acme-challenge.descope-idp.sb.fullbay.com`
- Wait up to 10 minutes for validation

### CloudFront returns 403 errors
- Verify S3 bucket policy allows CloudFront OAC
- Check that files were uploaded to S3
- Verify default root object is set to `index.html`

### Application shows 404 for routes
- Ensure CloudFront error responses are configured (404/403 → index.html)
- Check that React Router is using BrowserRouter

### Deployment is slow
- CloudFront distributions take 15-20 minutes to deploy
- Cache invalidations take 5-10 minutes to propagate
- This is normal AWS behavior

## Cleanup

To destroy all infrastructure:

```bash
# WARNING: This will delete all resources including S3 bucket contents
terraform destroy

# Type 'yes' when prompted
```

Note: You may need to manually delete S3 bucket versions if the destroy fails.

## Additional Resources

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [React Deployment Guide](../idp_service/README.md)
