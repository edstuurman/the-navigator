output "primary_upload_bucket" {
  description = "Primary S3 bucket name where CI/CD pipelines should upload static builds"
  value       = aws_s3_bucket.s3_buckets[local.primary_bucket.region].id
}

output "primary_upload_region" {
  description = "AWS region of the primary S3 upload bucket"
  value       = local.primary_bucket.region
}

output "active_bucket_regions" {
  description = "List of all active S3 bucket regions registered with the Multi-Region Access Point"
  value       = keys(local.all_buckets)
}

output "mrap_alias" {
  description = "Global alias of the S3 Multi-Region Access Point"
  value       = aws_s3control_multi_region_access_point.mrap.alias
}

output "mrap_domain_name" {
  description = "Global domain name of the S3 Multi-Region Access Point"
  value       = aws_s3control_multi_region_access_point.mrap.domain_name
}

output "mrap_arn" {
  description = "ARN of the S3 Multi-Region Access Point"
  value       = aws_s3control_multi_region_access_point.mrap.arn
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID (for CI/CD cache invalidations)"
  value       = aws_cloudfront_distribution.mrap_distribution.id
}

output "cloudfront_domain_name" {
  description = "CloudFront Distribution default domain name (*.cloudfront.net)"
  value       = aws_cloudfront_distribution.mrap_distribution.domain_name
}

output "site_urls" {
  description = "Configured HTTPS URLs served by CloudFront"
  value       = [for alias in local.cloudfront_aliases : "https://${alias}"]
}

