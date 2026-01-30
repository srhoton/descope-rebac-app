# S3 Service Frontend Infrastructure
# S3 bucket for static website hosting, CloudFront distribution, and Route53 DNS

# S3 bucket for static website hosting
resource "aws_s3_bucket" "s3_service" {
  bucket = "${var.environment}-descope-s3-service"

  tags = {
    Name = "${var.environment}-s3-service"
  }
}

# Enable versioning for rollback capability
resource "aws_s3_bucket_versioning" "s3_service" {
  bucket = aws_s3_bucket.s3_service.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Configure lifecycle policy to clean up old versions
resource "aws_s3_bucket_lifecycle_configuration" "s3_service" {
  bucket = aws_s3_bucket.s3_service.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }

  rule {
    id     = "delete-incomplete-multipart-uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Block public access at the bucket level (CloudFront will access via OAC)
resource "aws_s3_bucket_public_access_block" "s3_service" {
  bucket = aws_s3_bucket.s3_service.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket policy to allow CloudFront OAC access
resource "aws_s3_bucket_policy" "s3_service" {
  bucket = aws_s3_bucket.s3_service.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.s3_service.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.s3_service.arn
          }
        }
      }
    ]
  })
}

# CloudFront Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "s3_service" {
  name                              = "${var.environment}-s3-service-oac"
  description                       = "OAC for S3 Service S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront response headers policy for security headers
resource "aws_cloudfront_response_headers_policy" "s3_service" {
  name = "${var.environment}-s3-service-security-headers"

  security_headers_config {
    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
  }

  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      override = true
      value    = "geolocation=(), microphone=(), camera=()"
    }
  }
}

# CloudFront distribution for S3 service
resource "aws_cloudfront_distribution" "s3_service" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "${var.environment} S3 Service"
  price_class         = "PriceClass_100"
  aliases             = [var.s3_service_domain_name]

  origin {
    domain_name              = aws_s3_bucket.s3_service.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.s3_service.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_service.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${aws_s3_bucket.s3_service.id}"

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 3600
    max_ttl                    = 86400
    compress                   = true
    response_headers_policy_id = aws_cloudfront_response_headers_policy.s3_service.id
  }

  # Custom error response for SPA routing
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.s3_service.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.environment}-s3-service"
  }

  depends_on = [
    aws_acm_certificate_validation.s3_service
  ]
}

# Route53 A record for custom domain
resource "aws_route53_record" "s3_service" {
  zone_id = data.aws_route53_zone.sb_fullbay.zone_id
  name    = var.s3_service_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_service.domain_name
    zone_id                = aws_cloudfront_distribution.s3_service.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for IPv6 support
resource "aws_route53_record" "s3_service_ipv6" {
  zone_id = data.aws_route53_zone.sb_fullbay.zone_id
  name    = var.s3_service_domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.s3_service.domain_name
    zone_id                = aws_cloudfront_distribution.s3_service.hosted_zone_id
    evaluate_target_health = false
  }
}

# CloudWatch log group for CloudFront distribution
resource "aws_cloudwatch_log_group" "s3_cloudfront" {
  name              = "/aws/cloudfront/${var.environment}-s3-service"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${var.environment}-s3-cloudfront-logs"
  }
}

# Outputs for S3 Service
output "s3_service_bucket_name" {
  description = "S3 Service bucket name"
  value       = aws_s3_bucket.s3_service.id
}

output "s3_service_cloudfront_domain" {
  description = "S3 Service CloudFront distribution domain"
  value       = aws_cloudfront_distribution.s3_service.domain_name
}

output "s3_service_cloudfront_id" {
  description = "S3 Service CloudFront distribution ID"
  value       = aws_cloudfront_distribution.s3_service.id
}

output "s3_service_url" {
  description = "S3 Service URL"
  value       = "https://${var.s3_service_domain_name}"
}
