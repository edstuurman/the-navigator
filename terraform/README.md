# Multi-Region S3 + MRAP + CloudFront Infrastructure (Terraform)

Repeatable, globally distributed static site hosting infrastructure on AWS using **S3 Multi-Region Access Points (MRAP)**, cross-region replication, **CloudFront with native SigV4a Origin Access Control (OAC)**, **CloudFront Functions**, **ACM SSL/TLS**, and **Route 53**.

No Lambda@Edge functions or custom signing proxies are required.

---

## Prerequisites & Domain Behavior

1. **An Active AWS Account & IAM Credentials**: An AWS account with default regions enabled and an IAM user/role (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) permitted to manage S3, S3 Control (MRAP), CloudFront, ACM (`us-east-1`), Route 53, and the S3 replication IAM role.
2. **A Registered Domain & Public Route 53 Hosted Zone**: Your `environment_domain` (e.g. `example.com`) must already exist as a public Hosted Zone in Route 53, and its domain registrar `NS` records must point to those Route 53 nameservers so public DNS validation succeeds.
   - **Automated SSL & DNS**: Terraform automatically requests and DNS-validates an ACM certificate (`us-east-1`) covering both `example.com` and `*.example.com`, and creates Route 53 `A` (IPv4) and `AAAA` (IPv6) Alias records for both `example.com` and `www.example.com`.
   - **Naked-to-WWW Redirect**: Requests to the naked/apex domain (`example.com`) are automatically `301 Moved Permanently` redirected to `https://www.example.com` (preserving the request path and query string) by the `viewer-request` CloudFront Function at the edge.
3. **A GitLab account (free)**: Used for repository hosting and automated CI/CD infrastructure & site deployment pipelines ([`.gitlab-ci.yml`](../.gitlab-ci.yml)).
4. **Terraform** `>= 1.10.0` (uses native S3 state lockfiles via `use_lockfile = true`) and **AWS Provider** `~> 6.0` (supports per-resource `region` targeting without provider alias boilerplate).

---

## Project Structure

```text
terraform/
├── bootstrap/
│   └── main.tf              # Step 1: Creates dedicated S3 bucket for .tfstate & .tflock
├── versions.tf              # Terraform & AWS provider version constraints
├── backend.tf               # S3 remote backend with native S3 lockfile (use_lockfile = true)
├── variables.tf             # Domain config & commentable list of all 17 non-opt-in MRAP regions
├── locals.tf                # Auto-discovered Account ID, domain slug, and replica priorities
├── s3-mrap.tf               # Regional S3 buckets, SSE-S3, replication IAM & rules, MRAP & policies
├── acm-route53.tf           # Automated ACM SSL certificate (us-east-1) & Route 53 DNS records
├── cloudfront.tf            # CloudFront distribution, native SigV4a OAC & viewer-request function
├── outputs.tf               # Primary upload bucket, MRAP alias, CloudFront distribution ID
└── terraform.tfvars.example # Example variable overrides
```

---

## GitLab CI/CD Setup & Workflow

The repository root [`.gitlab-ci.yml`](../.gitlab-ci.yml) integrates three Terraform jobs (`terraform:bootstrap`, `terraform:plan`, and `terraform:apply`) alongside the Astro static build (`build` → `deploytos3`).

Because `build` and `deploytos3` run on an independent DAG track (`needs: [build]`), normal content pushes to `main` deploy immediately without waiting on manual Terraform jobs.

### 1. Add Initial Bootstrap & Provisioning Variables

On a greenfield setup, your S3 buckets and CloudFront distribution do not exist yet, so `S3_BUCKET` and `CLOUDFRONT_DISTRIBUTION_ID` are added **after** `terraform:apply`. Start by opening **Settings → CI/CD → Variables** in GitLab and configuring:

#### Required Before `terraform:bootstrap` & `terraform:plan`

| Variable Key | Example Value | Flags | Purpose |
| :--- | :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | Protected, Masked | AWS IAM Access Key ID for Terraform & S3 deploys |
| `AWS_SECRET_ACCESS_KEY` | `wJalrXUtnFEMI/...` | Protected, Masked | AWS IAM Secret Access Key |
| `TF_VAR_environment_domain` | `example.com` | Protected | Primary domain name (must have a public Route 53 Hosted Zone) |

#### Optional Override Variables

| Variable Key | Default (if omitted) | Purpose |
| :--- | :--- | :--- |
| `AWS_DEFAULT_REGION` | `ap-northeast-1` | Default AWS CLI region and default region for `<domain-slug>-tfstate` |
| `TF_VAR_environment_domain_slug` | `<domain-with-dashes>` (e.g. `example-com`) | Custom resource prefix slug for buckets, MRAP, and IAM |
| `TF_STATE_BUCKET` | `<domain-slug>-tfstate` | Custom S3 bucket name for `terraform.tfstate` and `.tflock` |
| `TF_STATE_REGION` | `$AWS_DEFAULT_REGION` (`ap-northeast-1`) | Custom AWS region for the Terraform state S3 bucket |
| `TF_VAR_cloudfront_price_class` | `PriceClass_200` | CloudFront price class (`PriceClass_100`, `PriceClass_200`, `PriceClass_All`) |

---

### 2. Run the Greenfield Pipeline in GitLab

1. **Choose Your Regions Before First Apply**:
   - Edit [`terraform/variables.tf`](./variables.tf) and comment out (`#`) any regions in `variable "buckets"` that you do not wish to include in the Multi-Region Access Point.
   - *Note*: AWS S3 MRAP bucket membership is fixed at creation time and cannot be modified in-place later without recreating the MRAP.
2. **Run `terraform:bootstrap` (One-Time Only)**:
   - In GitLab, open **Build → Pipelines** on the `main` branch and click the play button (**▶**) next to **`terraform:bootstrap`**.
   - This creates the dedicated, versioned, encrypted `<domain-slug>-tfstate` S3 bucket (using the self-contained `terraform/bootstrap/main.tf` module).
3. **Run `terraform:plan` & `terraform:apply`**:
   - Whenever files inside `terraform/` are modified (and `TF_VAR_environment_domain` is set), **`terraform:plan`** runs automatically and saves the execution plan (`tfplan`) as a pipeline artifact. (You can also trigger `terraform:plan` manually on any pipeline.)
   - Inspect the plan output in the job log, then click the play button (**▶**) on **`terraform:apply`** to provision the regional S3 buckets, replication rules, MRAP, ACM SSL certificate, CloudFront distribution, and Route 53 records.
4. **Add Post-Provisioning Deployment Variables & Run `deploytos3`**:
   - At the end of the `terraform:apply` log, Terraform prints your newly created bucket and CloudFront IDs. Add them in **Settings → CI/CD → Variables**:

| Variable Key | Value Source (`terraform:apply` output) | Flags | Purpose |
| :--- | :--- | :--- | :--- |
| `S3_BUCKET` | `primary_upload_bucket` (e.g. `example-com-ap-northeast-1`) | Protected | Target primary S3 bucket used by `deploytos3` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` (e.g. `E1A2B3C4D5E6F7`) | Protected | Target CloudFront Distribution ID invalidated by `deploytos3` |

   - Re-run **`deploytos3`** (or push a commit) to sync `./dist` to the primary S3 bucket and invalidate CloudFront.

---

## Local CLI Quickstart

If you prefer to run Terraform from your workstation instead of GitLab CI:

### Step 1: Provision the Dedicated S3 State Bucket (`bootstrap/`)

```bash
cd terraform/bootstrap
terraform init
terraform apply -var="environment_domain=example.com"
```

### Step 2: Select Active MRAP Regions

Open [`variables.tf`](./variables.tf) and comment out (`#`) any regions in `variable "buckets"` that you do not want to provision **before** running `terraform apply`.

By default, all **17 default-enabled (non-opt-in) AWS regions** supported by S3 MRAP + CloudFront OAC are listed:

- **Primary**: `ap-northeast-1` (Tokyo) — marked `is_main = true`
- **Asia Pacific**: `ap-northeast-2` (Seoul), `ap-northeast-3` (Osaka), `ap-south-1` (Mumbai), `ap-southeast-1` (Singapore), `ap-southeast-2` (Sydney)
- **Europe**: `eu-central-1` (Frankfurt), `eu-north-1` (Stockholm), `eu-west-1` (Ireland), `eu-west-2` (London), `eu-west-3` (Paris)
- **Americas**: `ca-central-1` (Canada Central), `sa-east-1` (São Paulo), `us-east-1` (N. Virginia), `us-east-2` (Ohio), `us-west-1` (N. California), `us-west-2` (Oregon)

Replication priorities are calculated automatically for whichever replica regions remain uncommented.

### Step 3: Initialize & Apply the Main Stack

```bash
cd ..
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars to set environment_domain = "example.com"

terraform init \
  -backend-config="bucket=example-com-tfstate" \
  -backend-config="region=ap-northeast-1"

terraform apply
```
