# ACM Certificate for Host Application
# Certificate must be created in us-east-1 for CloudFront

resource "aws_acm_certificate" "host_app" {
  provider = aws.us_east_1 # CloudFront requires certificates in us-east-1

  domain_name       = var.host_app_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.environment}-host-app-cert"
  }
}

# DNS validation records for ACM certificate
resource "aws_route53_record" "host_app_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.host_app.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id         = data.aws_route53_zone.sb_fullbay.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

# Certificate validation
resource "aws_acm_certificate_validation" "host_app" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.host_app.arn
  validation_record_fqdns = [for record in aws_route53_record.host_app_cert_validation : record.fqdn]
}
