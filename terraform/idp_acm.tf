# ACM Certificate for CloudFront (must be in us-east-1)
# This certificate is used by CloudFront for the custom domain
# Note: The aws.us_east_1 provider is defined in versions.tf

# Data source to look up Route53 hosted zone
data "aws_route53_zone" "sb_fullbay" {
  name         = "sb.fullbay.com"
  private_zone = false
}

# ACM certificate for CloudFront distribution
resource "aws_acm_certificate" "idp_service" {
  provider = aws.us_east_1

  domain_name       = var.idp_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.environment}-idp-service-cert"
  }
}

# DNS validation record for ACM certificate
resource "aws_route53_record" "idp_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.idp_service.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.sb_fullbay.zone_id
}

# Wait for certificate validation to complete
resource "aws_acm_certificate_validation" "idp_service" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.idp_service.arn
  validation_record_fqdns = [for record in aws_route53_record.idp_cert_validation : record.fqdn]

  timeouts {
    create = "10m"
  }
}
