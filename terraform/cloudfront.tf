# ------------------------------------------------------------------------------
# CloudFront Origin Access Control (Native SigV4a for S3 MRAP)
# ------------------------------------------------------------------------------

resource "aws_cloudfront_origin_access_control" "mrap_oac" {
  name                              = "${local.domain_slug}-mrap-oac"
  description                       = "Native SigV4a Origin Access Control for S3 Multi-Region Access Point"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4a"
}

# ------------------------------------------------------------------------------
# CloudFront Function: Naked-to-WWW 301 Redirect & Directory Index Rewriting
# ------------------------------------------------------------------------------

resource "aws_cloudfront_function" "directory_index" {
  name    = "${local.domain_slug}-directory-index"
  runtime = "cloudfront-js-2.0"
  comment = "Redirects naked domain to www and rewrites directory paths (/blog/ or /blog) to /index.html"
  publish = true

  code = <<-EOF
    function handler(event) {
      var request = event.request;
      var host = request.headers.host ? request.headers.host.value.toLowerCase() : '';

      // 301 Redirect naked/apex domain (${var.environment_domain}) to https://www.${var.environment_domain}
      if (host === '${lower(var.environment_domain)}') {
        var qs = [];
        for (var key in request.querystring) {
          if (request.querystring[key].multiValue) {
            request.querystring[key].multiValue.forEach(function (mv) {
              qs.push(mv.value ? key + '=' + mv.value : key);
            });
          } else {
            qs.push(request.querystring[key].value ? key + '=' + request.querystring[key].value : key);
          }
        }
        var location = 'https://www.${lower(var.environment_domain)}' + request.uri + (qs.length ? '?' + qs.join('&') : '');

        return {
          statusCode: 301,
          statusDescription: 'Moved Permanently',
          headers: {
            'location': { value: location },
            'cache-control': { value: 'public, max-age=86400' }
          }
        };
      }

      var uri = request.uri;
      if (uri.endsWith('/')) {
        request.uri += 'index.html';
      } else if (!uri.includes('.')) {
        request.uri += '/index.html';
      }

      return request;
    }
  EOF
}

# AWS Managed Cache Policy: CachingOptimized (658327ea-f89d-4fab-a63d-7e88639e58f6)
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

# AWS Managed Response Headers Policy: SecurityHeadersPolicy (67f7725c-6f97-4210-82d7-5512b31e9d03)
data "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "Managed-SecurityHeadersPolicy"
}

# ------------------------------------------------------------------------------
# CloudFront Distribution
# ------------------------------------------------------------------------------

resource "aws_cloudfront_distribution" "mrap_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  default_root_object = "index.html"
  aliases             = local.cloudfront_aliases
  price_class         = var.cloudfront_price_class

  origin {
    domain_name              = aws_s3control_multi_region_access_point.mrap.domain_name
    origin_id                = "mrap_origin_id"
    origin_access_control_id = aws_cloudfront_origin_access_control.mrap_oac.id

    # S3 Multi-Region Access Point endpoints (*.accesspoint.s3-global.amazonaws.com)
    # must use custom_origin_config in CloudFront alongside the SigV4a OAC; omitting
    # this block causes the provider to send S3OriginConfig, which CloudFront rejects
    # for global MRAP domains.
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id           = "mrap_origin_id"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.directory_index.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.validated_cert.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = "production"
  }
}

