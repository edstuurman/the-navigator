variable "environment_domain" {
  description = "Primary domain name (e.g. 'example.com'). Must already exist as a public Hosted Zone in Route 53. Both '<domain>' and 'www.<domain>' are provisioned automatically, with the naked domain 301-redirecting to 'https://www.<domain>' at the CloudFront edge."
  type        = string
  default     = "example.com"
}

variable "environment_domain_slug" {
  description = "Optional slug prefix for AWS resource names. Defaults to environment_domain with dots replaced by hyphens (e.g. 'example-com')."
  type        = string
  default     = null
  nullable    = true
}

variable "account_id" {
  description = "Optional AWS Account ID override. Defaults to the currently authenticated AWS caller account."
  type        = string
  default     = null
  nullable    = true
}

variable "cloudfront_aliases" {
  description = "Optional custom domain aliases for the CloudFront distribution. Defaults to ['www.<environment_domain>', '<environment_domain>'] so the naked domain redirects to www."
  type        = list(string)
  default     = null
  nullable    = true
}

variable "cloudfront_price_class" {
  description = "CloudFront distribution price class (PriceClass_100, PriceClass_200, or PriceClass_All)."
  type        = string
  default     = "PriceClass_200"
}

variable "buckets" {
  description = <<-EOT
    List of AWS regions for S3 buckets backing the Multi-Region Access Point (MRAP).
    Populated with all 17 default-enabled (non-opt-in) AWS regions that support S3 MRAP + native CloudFront OAC (SigV4a).
    Comment out (#) any region line below BEFORE initial creation to exclude it from bucket creation, replication, and the MRAP.
    Note: AWS S3 MRAP bucket membership is immutable after creation; changing the region list later forces recreation of the MRAP.
    Replication rule priorities are assigned automatically in sequential order for all active replica regions.
  EOT
  type = list(object({
    region   = string
    is_main  = optional(bool, false)
    priority = optional(number)
  }))
  default = [
    # Primary region (CI/CD upload target; replicates out to all active secondary regions below)
    { region = "ap-northeast-1", is_main = true }, # Asia Pacific (Tokyo)

    # Asia Pacific replicas (comment out with # to disable any region)
    { region = "ap-northeast-2", is_main = false }, # Asia Pacific (Seoul)
    { region = "ap-northeast-3", is_main = false }, # Asia Pacific (Osaka)
    { region = "ap-south-1", is_main = false },     # Asia Pacific (Mumbai)
    { region = "ap-southeast-1", is_main = false }, # Asia Pacific (Singapore)
    { region = "ap-southeast-2", is_main = false }, # Asia Pacific (Sydney)

    # Europe replicas (comment out with # to disable any region)
    { region = "eu-central-1", is_main = false }, # Europe (Frankfurt)
    { region = "eu-north-1", is_main = false },   # Europe (Stockholm)
    { region = "eu-west-1", is_main = false },    # Europe (Ireland)
    { region = "eu-west-2", is_main = false },    # Europe (London)
    { region = "eu-west-3", is_main = false },    # Europe (Paris)

    # Americas replicas (comment out with # to disable any region)
    { region = "ca-central-1", is_main = false }, # Canada (Central)
    { region = "sa-east-1", is_main = false },    # South America (São Paulo)
    { region = "us-east-1", is_main = false },    # US East (N. Virginia)
    { region = "us-east-2", is_main = false },    # US East (Ohio)
    { region = "us-west-1", is_main = false },    # US West (N. California)
    { region = "us-west-2", is_main = false },    # US West (Oregon)
  ]

  validation {
    condition     = length(var.buckets) >= 1 && length(var.buckets) <= 17
    error_message = "Between 1 and 17 regions must remain uncommented for an S3 Multi-Region Access Point."
  }

  validation {
    condition     = length(distinct([for b in var.buckets : b.region])) == length(var.buckets)
    error_message = "Each region in var.buckets must be unique (an MRAP supports at most one bucket per region)."
  }
}
