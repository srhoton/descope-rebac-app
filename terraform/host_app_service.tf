# Host Application Infrastructure
# S3 bucket for static website hosting, CloudFront distribution, and Route53 DNS
# This hosts the module federation host app at descope-main.sb.fullbay.com

# S3 bucket for static website hosting
resource "aws_s3_bucket" "host_app" {
  bucket = "${var.environment}-descope-host-app"

  tags = {
    Name = "${var.environment}-host-app"
  }
}

# Enable versioning for rollback capability
resource "aws_s3_bucket_versioning" "host_app" {
  bucket = aws_s3_bucket.host_app.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Configure lifecycle policy to clean up old versions
resource "aws_s3_bucket_lifecycle_configuration" "host_app" {
  bucket = aws_s3_bucket.host_app.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }

  rule {
    id     = "delete-incomplete-multipart-uploads"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Block public access at the bucket level (CloudFront will access via OAC)
resource "aws_s3_bucket_public_access_block" "host_app" {
  bucket = aws_s3_bucket.host_app.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "host_app" {
  bucket = aws_s3_bucket.host_app.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 bucket policy to allow CloudFront OAC access
resource "aws_s3_bucket_policy" "host_app" {
  bucket = aws_s3_bucket.host_app.id

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
        Resource = "${aws_s3_bucket.host_app.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.host_app.arn
          }
        }
      }
    ]
  })
}

# CloudFront Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "host_app" {
  name                              = "${var.environment}-host-app-oac"
  description                       = "OAC for Host App S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront response headers policy for security headers
resource "aws_cloudfront_response_headers_policy" "host_app" {
  name = "${var.environment}-host-app-security-headers"

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

# CloudFront distribution for host app
resource "aws_cloudfront_distribution" "host_app" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "${var.environment} Host Application (Module Federation Host)"
  price_class         = "PriceClass_100"
  aliases             = [var.host_app_domain_name]

  origin {
    domain_name              = aws_s3_bucket.host_app.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.host_app.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.host_app.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${aws_s3_bucket.host_app.id}"

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
    response_headers_policy_id = aws_cloudfront_response_headers_policy.host_app.id
  }

  # Custom error response for SPA routing
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.host_app.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.environment}-host-app"
  }

  depends_on = [
    aws_acm_certificate_validation.host_app
  ]
}

# Route53 A record for custom domain
resource "aws_route53_record" "host_app" {
  zone_id = data.aws_route53_zone.sb_fullbay.zone_id
  name    = var.host_app_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.host_app.domain_name
    zone_id                = aws_cloudfront_distribution.host_app.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for IPv6 support
resource "aws_route53_record" "host_app_ipv6" {
  zone_id = data.aws_route53_zone.sb_fullbay.zone_id
  name    = var.host_app_domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.host_app.domain_name
    zone_id                = aws_cloudfront_distribution.host_app.hosted_zone_id
    evaluate_target_health = false
  }
}

# CloudWatch log group for CloudFront distribution
resource "aws_cloudwatch_log_group" "host_app_cloudfront" {
  name              = "/aws/cloudfront/${var.environment}-host-app"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${var.environment}-host-app-cloudfront-logs"
  }
}
