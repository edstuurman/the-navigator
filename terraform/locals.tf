data "aws_caller_identity" "current" {}

locals {
  account_id  = coalesce(var.account_id, data.aws_caller_identity.current.account_id)
  domain_slug = coalesce(var.environment_domain_slug, replace(var.environment_domain, ".", "-"))

  # Select the primary bucket (marked `is_main = true`, or fallback to the first active entry)
  explicit_main_buckets = [for b in var.buckets : b if try(b.is_main, false)]
  primary_bucket        = length(local.explicit_main_buckets) > 0 ? local.explicit_main_buckets[0] : var.buckets[0]

  # Map of all active buckets keyed by region
  all_buckets = {
    for b in var.buckets : b.region => {
      region      = b.region
      bucket_name = "${local.domain_slug}-${b.region}"
      is_main     = b.region == local.primary_bucket.region
    }
  }

  # Filtered list of secondary replica buckets
  replica_buckets_list = [
    for b in var.buckets : b if b.region != local.primary_bucket.region
  ]

  # Map of secondary replica buckets with automatically calculated sequential priorities (0, 1, 2, ...)
  replica_buckets = {
    for idx, b in local.replica_buckets_list : b.region => {
      region      = b.region
      bucket_name = "${local.domain_slug}-${b.region}"
      priority    = coalesce(b.priority, idx)
    }
  }

  has_replicas = length(local.replica_buckets) > 0

  # Include both www.<domain> and naked <domain> by default so CloudFront + Route 53
  # serve www.<domain> and 301-redirect <domain> -> https://www.<domain> at the edge.
  cloudfront_aliases = coalesce(var.cloudfront_aliases, [
    "www.${var.environment_domain}",
    var.environment_domain,
  ])
}

