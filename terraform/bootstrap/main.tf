terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

variable "environment_domain" {
  description = "Primary domain name (used to derive the default state bucket name)"
  type        = string
  default     = "example.com"
}

variable "environment_domain_slug" {
  description = "Optional slug override for naming the state bucket. Defaults to environment_domain with dots replaced by hyphens."
  type        = string
  default     = null
  nullable    = true
}

variable "state_bucket_name" {
  description = "Explicit S3 bucket name for Terraform state and lock files. Defaults to '<domain-slug>-tfstate'."
  type        = string
  default     = null
  nullable    = true
}

variable "state_bucket_region" {
  description = "AWS region where the Terraform state S3 bucket will be created."
  type        = string
  default     = "ap-northeast-1"
}

locals {
  domain_slug = coalesce(var.environment_domain_slug, replace(var.environment_domain, ".", "-"))
  bucket_name = coalesce(var.state_bucket_name, "${local.domain_slug}-tfstate")
}

provider "aws" {
  region = var.state_bucket_region

  default_tags {
    tags = {
      Project   = var.environment_domain
      Purpose   = "TerraformRemoteState"
      ManagedBy = "Terraform"
    }
  }
}

# Dedicated S3 Bucket for Terraform state (.tfstate) and native S3 lock file (.tflock)
resource "aws_s3_bucket" "tfstate" {
  bucket = local.bucket_name
  region = var.state_bucket_region

  lifecycle {
    prevent_destroy = true
  }
}

# Block all public access to the state bucket
resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  region = var.state_bucket_region

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable bucket versioning for state history and safe lockfile recovery
resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  region = var.state_bucket_region

  versioning_configuration {
    status = "Enabled"
  }
}

# Enforce SSE-S3 encryption at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  region = var.state_bucket_region

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Expire old noncurrent state versions after 90 days and clean up incomplete multipart uploads
resource "aws_s3_bucket_lifecycle_configuration" "tfstate" {
  bucket     = aws_s3_bucket.tfstate.id
  region     = var.state_bucket_region
  depends_on = [aws_s3_bucket_versioning.tfstate]

  rule {
    id     = "expire-noncurrent-state-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }

    expiration {
      expired_object_delete_marker = true
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Enforce TLS (HTTPS-only) access to the state bucket
resource "aws_s3_bucket_policy" "tfstate_tls_only" {
  bucket     = aws_s3_bucket.tfstate.id
  region     = var.state_bucket_region
  depends_on = [aws_s3_bucket_public_access_block.tfstate]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "EnforceTLSRequestsOnly"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.tfstate.arn,
          "${aws_s3_bucket.tfstate.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

output "state_bucket_name" {
  description = "Name of the dedicated Terraform state S3 bucket"
  value       = aws_s3_bucket.tfstate.id
}

output "state_bucket_arn" {
  description = "ARN of the dedicated Terraform state S3 bucket"
  value       = aws_s3_bucket.tfstate.arn
}

output "state_bucket_region" {
  description = "Region of the dedicated Terraform state S3 bucket"
  value       = var.state_bucket_region
}

