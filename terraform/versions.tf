terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = local.primary_bucket.region

  default_tags {
    tags = {
      Project   = var.environment_domain
      ManagedBy = "Terraform"
    }
  }
}

