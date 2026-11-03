# ------------------------------------------------------------------------------
# Route 53 Hosted Zone & Automated ACM SSL/TLS Certificate (us-east-1)
# ------------------------------------------------------------------------------

data "aws_route53_zone" "main" {
  name         = var.environment_domain
  private_zone = false
}

# CloudFront requires ACM certificates to be provisioned in us-east-1
resource "aws_acm_certificate" "cert" {
  region                    = "us-east-1"
  domain_name               = var.environment_domain
  subject_alternative_names = ["*.${var.environment_domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "dns_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
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
  zone_id         = data.aws_route53_zone.main.zone_id
}

resource "aws_acm_certificate_validation" "validated_cert" {
  region                  = "us-east-1"
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.dns_validation : record.fqdn]
}

# ------------------------------------------------------------------------------
# Route 53 Alias Records (IPv4 A + IPv6 AAAA) for CloudFront Distribution
# ------------------------------------------------------------------------------

resource "aws_route53_record" "cloudfront_a" {
  for_each = toset(local.cloudfront_aliases)

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.mrap_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.mrap_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cloudfront_aaaa" {
  for_each = toset(local.cloudfront_aliases)

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.mrap_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.mrap_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

