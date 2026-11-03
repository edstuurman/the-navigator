# Remote S3 state & native S3 lockfile (Terraform >= 1.10).
# First provision the dedicated state bucket via `cd bootstrap && terraform init && terraform apply`.
# Update `bucket` and `region` below to match your bootstrap output, or override at init time:
#   terraform init -backend-config="bucket=<your-domain-slug>-tfstate" -backend-config="region=ap-northeast-1"
terraform {
  backend "s3" {
    bucket       = "example-com-tfstate"
    key          = "global/s3-mrap-cloudfront/terraform.tfstate"
    region       = "ap-northeast-1"
    encrypt      = true
    use_lockfile = true
  }
}

