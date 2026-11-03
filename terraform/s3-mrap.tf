# ------------------------------------------------------------------------------
# 1. Regional S3 Buckets, Public Access Block, Versioning, Encryption & Lifecycle
# ------------------------------------------------------------------------------

resource "aws_s3_bucket" "s3_buckets" {
  for_each = local.all_buckets

  bucket = each.value.bucket_name
  region = each.value.region
}

resource "aws_s3_bucket_public_access_block" "s3_public_access_block" {
  for_each = local.all_buckets

  bucket = aws_s3_bucket.s3_buckets[each.key].id
  region = each.value.region

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "s3_versioning" {
  for_each = local.all_buckets

  bucket = aws_s3_bucket.s3_buckets[each.key].id
  region = each.value.region

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "encrypt_all_buckets" {
  for_each = local.all_buckets

  bucket = aws_s3_bucket.s3_buckets[each.key].id
  region = each.value.region

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Automatically purge noncurrent object versions, orphaned delete markers,
# and incomplete multipart uploads so versioned buckets stay lean.
resource "aws_s3_bucket_lifecycle_configuration" "s3_lifecycle" {
  for_each   = local.all_buckets
  depends_on = [aws_s3_bucket_versioning.s3_versioning]

  bucket = aws_s3_bucket.s3_buckets[each.key].id
  region = each.value.region

  rule {
    id     = "purge-noncurrent-versions-and-delete-markers"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 7
    }

    expiration {
      expired_object_delete_marker = true
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

# ------------------------------------------------------------------------------
# 2. Cross-Region S3 Replication (Primary Bucket -> Active Secondary Replicas)
# ------------------------------------------------------------------------------

resource "aws_iam_role" "replication_role" {
  count = local.has_replicas ? 1 : 0
  name  = "${local.domain_slug}-s3-replication-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "s3.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_policy" "replication_policy" {
  count       = local.has_replicas ? 1 : 0
  name        = "${local.domain_slug}-s3-replication-policy"
  description = "Least-privilege IAM policy allowing S3 replication from primary bucket to active secondary buckets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPrimaryBucketConfigurationRead"
        Effect = "Allow"
        Action = [
          "s3:GetReplicationConfiguration",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.s3_buckets[local.primary_bucket.region].arn
        ]
      },
      {
        Sid    = "AllowPrimaryBucketObjectVersionRead"
        Effect = "Allow"
        Action = [
          "s3:GetObjectVersionForReplication",
          "s3:GetObjectVersionAcl",
          "s3:GetObjectVersionTagging",
          "s3:GetObjectRetention",
          "s3:GetObjectLegalHold"
        ]
        Resource = [
          "${aws_s3_bucket.s3_buckets[local.primary_bucket.region].arn}/*"
        ]
      },
      {
        Sid    = "AllowReplicaBucketsReplicationWrite"
        Effect = "Allow"
        Action = [
          "s3:ReplicateObject",
          "s3:ReplicateDelete",
          "s3:ReplicateTags",
          "s3:ObjectOwnerOverrideToBucketOwner"
        ]
        Resource = [
          for r in values(local.replica_buckets) : "${aws_s3_bucket.s3_buckets[r.region].arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "replication_policy_attach" {
  count      = local.has_replicas ? 1 : 0
  role       = aws_iam_role.replication_role[0].name
  policy_arn = aws_iam_policy.replication_policy[0].arn
}

resource "aws_s3_bucket_replication_configuration" "replication" {
  count      = local.has_replicas ? 1 : 0
  depends_on = [aws_s3_bucket_versioning.s3_versioning, aws_iam_role_policy_attachment.replication_policy_attach]

  bucket = aws_s3_bucket.s3_buckets[local.primary_bucket.region].id
  region = local.primary_bucket.region
  role   = aws_iam_role.replication_role[0].arn

  dynamic "rule" {
    for_each = local.replica_buckets
    content {
      id       = "${local.domain_slug}-${rule.value.region}"
      status   = "Enabled"
      priority = rule.value.priority

      filter {
        prefix = ""
      }

      destination {
        bucket        = aws_s3_bucket.s3_buckets[rule.key].arn
        storage_class = "STANDARD"

        replication_time {
          status = "Enabled"
          time {
            minutes = 15
          }
        }

        metrics {
          status = "Enabled"
          event_threshold {
            minutes = 15
          }
        }
      }

      delete_marker_replication {
        status = "Enabled"
      }
    }
  }
}

# ------------------------------------------------------------------------------
# 3. S3 Multi-Region Access Point (MRAP) & Access Policies
# ------------------------------------------------------------------------------

resource "aws_s3control_multi_region_access_point" "mrap" {
  account_id = local.account_id

  details {
    name = "${local.domain_slug}-mrap"

    dynamic "region" {
      for_each = local.all_buckets
      content {
        bucket = aws_s3_bucket.s3_buckets[region.key].id
      }
    }
  }
}

resource "aws_s3control_multi_region_access_point_policy" "mrap" {
  account_id = local.account_id

  details {
    name = aws_s3control_multi_region_access_point.mrap.details[0].name

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Sid    = "AllowCloudFrontOACReadThroughMRAP"
          Effect = "Allow"
          Principal = {
            Service = "cloudfront.amazonaws.com"
          }
          Action = [
            "s3:GetObject",
            "s3:ListBucket"
          ]
          Resource = [
            "arn:aws:s3::${local.account_id}:accesspoint/${aws_s3control_multi_region_access_point.mrap.alias}",
            "arn:aws:s3::${local.account_id}:accesspoint/${aws_s3control_multi_region_access_point.mrap.alias}/object/*"
          ]
          Condition = {
            StringEquals = {
              "aws:SourceArn" = aws_cloudfront_distribution.mrap_distribution.arn
            }
          }
        }
      ]
    })
  }
}

resource "aws_s3_bucket_policy" "mrap_bucket_policy" {
  for_each   = local.all_buckets
  depends_on = [aws_s3_bucket_public_access_block.s3_public_access_block]

  bucket = aws_s3_bucket.s3_buckets[each.key].id
  region = each.value.region

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DelegateReadAccessToMultiRegionAccessPoint"
        Effect    = "Allow"
        Principal = "*"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.s3_buckets[each.key].arn,
          "${aws_s3_bucket.s3_buckets[each.key].arn}/*"
        ]
        Condition = {
          StringEquals = {
            "s3:DataAccessPointArn" = aws_s3control_multi_region_access_point.mrap.arn
          }
        }
      }
    ]
  })
}

