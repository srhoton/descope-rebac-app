# ACM Certificate for S3 Service
# Certificate must be created in us-east-1 for CloudFront

resource "aws_acm_certificate" "s3_service" {
  provider = aws.us_east_1  # CloudFront requires certificates in us-east-1

  domain_name       = var.s3_service_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.environment}-s3-service-cert"
  }
}

# DNS validation records for ACM certificate
resource "aws_route53_record" "s3_service_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.s3_service.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.sb_fullbay.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

# Certificate validation
resource "aws_acm_certificate_validation" "s3_service" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.s3_service.arn
  validation_record_fqdns = [for record in aws_route53_record.s3_service_cert_validation : record.fqdn]
}
