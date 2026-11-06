# Multi-Region S3 + MRAP + CloudFront Infrastructure (Terraform)

[![Terraform >= 1.10](https://img.shields.io/badge/Terraform-%3E%3D%201.10-7b42bc?style=for-the-badge&logo=terraform&logoColor=white&labelColor=111827)](https://www.terraform.io/)
[![AWS Provider ~> 6.0](https://img.shields.io/badge/AWS_Provider-~%3E%206.0-ff9900?style=for-the-badge&logo=amazonwebservices&logoColor=white&labelColor=111827)](https://registry.terraform.io/providers/hashicorp/aws/latest)
[![S3 MRAP + SigV4a OAC](https://img.shields.io/badge/S3_MRAP-CloudFront_SigV4a_OAC-d97706?style=for-the-badge&labelColor=111827)](./cloudfront.tf)
[![GitLab CI/CD](https://img.shields.io/badge/GitLab_CI%2FCD-Ready-fc6d26?style=for-the-badge&logo=gitlab&logoColor=white&labelColor=111827)](#option-a--gitlab-cicd-setup--workflow)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Ready-2088ff?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=111827)](#option-b--github-actions-setup--workflow)
[![Local CLI](https://img.shields.io/badge/Local_CLI-Supported-10b981?style=for-the-badge&logo=gnubash&logoColor=white&labelColor=111827)](#option-c--local-cli-setup--workflow)

Repeatable, globally distributed static site hosting infrastructure on AWS using **S3 Multi-Region Access Points (MRAP)**, cross-region replication, **CloudFront with native SigV4a Origin Access Control (OAC)**, **CloudFront Functions**, **ACM SSL/TLS**, and **Route 53**.

No Lambda@Edge functions or custom signing proxies are required.

> ⏱️ **First-Time Provisioning Time (~20–30 Minutes)**: While provisioning is 100% automated by Terraform, the initial greenfield `terraform apply` from zero takes roughly **20–30 minutes** to complete because AWS must provision and globally propagate the **S3 Multi-Region Access Point (MRAP)** routing control plane, validate the **ACM SSL certificate** via DNS, and deploy the **CloudFront distribution** across global edge locations. Once provisioned, routine site updates (`s3-deploy.sh`) complete in a few seconds.

---

## Choose Your Deployment Path

You can provision the AWS infrastructure and deploy the static `./dist/` site using **any one** of the three workflows below:

| Deployment Option | Pipeline / Tooling | Best For |
| :--- | :--- | :--- |
| **[Option A — GitLab CI/CD](#option-a--gitlab-cicd-setup--workflow)** | [`.gitlab-ci.yml`](../.gitlab-ci.yml) | Automated GitLab pipelines with manual `terraform:bootstrap` / `plan` / `apply` gates and automatic `build` → `deploytos3` on push |
| **[Option B — GitHub Actions](#option-b--github-actions-setup--workflow)** | [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) | Automated GitHub workflows with `workflow_dispatch` (`bootstrap` / `plan` / `apply`) and push-triggered `build` → `deploytos3` |
| **[Option C — Local CLI](#option-c--local-cli-setup--workflow)** | `terraform` + `aws` CLI + [`scripts/s3-deploy.sh`](../scripts/s3-deploy.sh) | Running Terraform and syncing `./dist/` directly from your workstation without CI/CD runners |

> **Starter Template Dry-Run Mode**: In both `.gitlab-ci.yml` and `.github/workflows/deploy.yml`, if `S3_BUCKET` and `TF_VAR_environment_domain` are not set in repository variables, the pipeline automatically runs a fast **5-second syntax & config dry-run** and passes (`✅`) without making AWS calls.

---

## Common Prerequisites & Region Selection (All Options)

### 1. AWS Account, Route 53 Hosted Zone & Domain Format
1. **Active AWS Account & IAM Credentials**: An IAM user or role (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) permitted to manage S3, S3 Control (MRAP), CloudFront, ACM (`us-east-1`), Route 53, and the S3 replication IAM role.
2. **Public Route 53 Hosted Zone (`environment_domain`)**:
   - Always specify your **naked root domain without `https://` or `www.`** — for example: **`example.com`**.
   - `example.com` must already exist as a public Hosted Zone in Route 53, and your domain registrar's `NS` records must point to those Route 53 nameservers so DNS validation succeeds.
   - **Automated SSL & DNS**: Terraform automatically requests and DNS-validates an ACM certificate (`us-east-1`) covering both `example.com` and `*.example.com`, and creates Route 53 `A` (IPv4) and `AAAA` (IPv6) Alias records for both `example.com` and `www.example.com`.
   - **Naked-to-WWW Redirect**: Requests to `example.com` are automatically `301 Moved Permanently` redirected to `https://www.example.com` at the edge via the `viewer-request` CloudFront Function.

### 2. Choose Your Active S3 MRAP Regions Before First Apply
Open [`terraform/variables.tf`](./variables.tf) and comment out (`#`) any regions in `variable "buckets"` that you do not want to provision **before** running `terraform apply` for the first time.
- *Important*: AWS S3 MRAP bucket membership is fixed at creation time and cannot be modified in-place later without recreating the MRAP.
- By default, all **17 default-enabled (non-opt-in) AWS regions** supported by S3 MRAP + CloudFront OAC are listed (`ap-northeast-1` marked `is_main = true`, plus 16 replica regions across Asia Pacific, Europe, and the Americas). Replication priorities are calculated automatically for whichever replica regions remain uncommented.

### 3. Directory Structure

```text
terraform/
├── bootstrap/
│   └── main.tf              # Step 1: Creates dedicated S3 bucket for .tfstate & .tflock
├── versions.tf              # Terraform >= 1.10 & AWS provider ~> 6.0 constraints
├── backend.tf               # S3 remote backend with native S3 lockfile (use_lockfile = true)
├── variables.tf             # Domain config & commentable list of all 17 non-opt-in MRAP regions
├── locals.tf                # Auto-discovered Account ID, domain slug, and replica priorities
├── s3-mrap.tf               # Regional S3 buckets, SSE-S3, replication IAM & rules, MRAP & policies
├── acm-route53.tf           # Automated ACM SSL certificate (us-east-1) & Route 53 DNS records
├── cloudfront.tf            # CloudFront distribution, native SigV4a OAC & viewer-request function
├── outputs.tf               # Primary upload bucket, MRAP alias, CloudFront distribution ID
└── terraform.tfvars.example # Example variable overrides for Local CLI usage
```

### 4. Shared Variable Reference (GitLab CI/CD & GitHub Actions)

#### Phase 1 — Required Before Provisioning (`bootstrap` / `plan` / `apply`)

| Variable Key | Example Value | GitLab Location | GitHub Location | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | CI/CD Variables *(Masked)* | Actions **Secrets** | AWS IAM Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | `wJalrXUtnFEMI/...` | CI/CD Variables *(Masked)* | Actions **Secrets** | AWS IAM Secret Access Key |
| `TF_VAR_environment_domain` | `example.com` | CI/CD Variables | Actions **Variables** | Naked apex domain (must match Route 53 Hosted Zone) |

#### Phase 2 — Added After `terraform apply` (Activates Live `build` → `deploytos3`)

| Variable Key | Value Source (`terraform apply` output) | GitLab Location | GitHub Location | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `S3_BUCKET` | `primary_upload_bucket` (e.g. `example-com-ap-northeast-1`) | CI/CD Variables | Actions **Variables** | Primary S3 bucket uploaded to by `s3-deploy.sh` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` (e.g. `E1A2B3C4D5E6F7`) | CI/CD Variables | Actions **Variables** | CloudFront Distribution ID invalidated on deploy |

#### Optional Override Variables

| Variable Key | Default (if omitted) | Purpose |
| :--- | :--- | :--- |
| `AWS_DEFAULT_REGION` | `ap-northeast-1` | Default AWS CLI region and default region for `<domain-slug>-tfstate` |
| `TF_VAR_environment_domain_slug` | `<domain-with-dashes>` (e.g. `example-com`) | Custom resource prefix slug for buckets, MRAP, and IAM |
| `TF_STATE_BUCKET` | `<domain-slug>-tfstate` | Custom S3 bucket name for `terraform.tfstate` and `.tflock` |
| `TF_STATE_REGION` | `$AWS_DEFAULT_REGION` (`ap-northeast-1`) | Custom AWS region for the Terraform state S3 bucket |
| `TF_VAR_cloudfront_price_class` | `PriceClass_200` | CloudFront price class (`PriceClass_100`, `PriceClass_200`, `PriceClass_All`) |
| `ENABLE_CI` | `""` | Set to `"true"` on GitLab if your fork project path still contains `navigator` |

---

## Option A — GitLab CI/CD Setup & Workflow

![GitLab CI/CD](https://img.shields.io/badge/Option_A-GitLab_CI%2FCD-fc6d26?style=for-the-badge&logo=gitlab&logoColor=white&labelColor=111827)

Defined in [`.gitlab-ci.yml`](../.gitlab-ci.yml). Because `build` and `deploytos3` run on an independent DAG track (`needs: [build]`), normal content pushes to `main` deploy immediately without waiting on manual Terraform jobs.

1. **Configure Phase 1 Variables**:
   - In GitLab, open **Settings → CI/CD → Variables** and add `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `TF_VAR_environment_domain` (e.g. `example.com`).
2. **Run `terraform:bootstrap` (One-Time Only)**:
   - Open **Build → Pipelines** on `main` and click the play button (**▶**) next to **`terraform:bootstrap`** to create the `<domain-slug>-tfstate` S3 bucket.
3. **Run `terraform:plan` & `terraform:apply`**:
   - Click **▶** on **`terraform:plan`** (or push a change under `terraform/`), review the plan output, and click **▶** on **`terraform:apply`**.
4. **Configure Phase 2 Variables & Deploy**:
   - Copy `primary_upload_bucket` (`S3_BUCKET`) and `cloudfront_distribution_id` (`CLOUDFRONT_DISTRIBUTION_ID`) from the end of the `terraform:apply` log into **Settings → CI/CD → Variables**.
   - Re-run the pipeline (or push a commit to `main`) — `build` and `deploytos3` will now build `./dist/` and deploy live to S3 + CloudFront.

---

## Option B — GitHub Actions Setup & Workflow

![GitHub Actions](https://img.shields.io/badge/Option_B-GitHub_Actions-2088ff?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=111827)

Defined in [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml). Supports both push-triggered site deployments and manual `workflow_dispatch` Terraform actions (`bootstrap`, `plan`, `apply`).

1. **Configure Phase 1 Secrets & Variables**:
   - Open **Settings → Secrets and variables → Actions** in your GitHub repository:
     - Under the **Secrets** tab, add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
     - Under the **Variables** tab, add `TF_VAR_environment_domain` (e.g. `example.com`).
2. **Run `bootstrap` (One-Time Only)**:
   - Open the **Actions** tab → select **CI/CD Pipeline** → click **Run workflow** → choose `terraform_action: bootstrap` → click **Run workflow**.
3. **Run `plan` & `apply`**:
   - Trigger **Run workflow** with `terraform_action: plan` to preview changes, then trigger **Run workflow** with `terraform_action: apply` to provision the S3 buckets, MRAP, ACM SSL certificate, CloudFront distribution, and Route 53 records.
4. **Configure Phase 2 Variables & Deploy**:
   - Copy `primary_upload_bucket` and `cloudfront_distribution_id` from the `Terraform Apply` step output and add them under **Settings → Secrets and variables → Actions → Variables** as `S3_BUCKET` and `CLOUDFRONT_DISTRIBUTION_ID`.
   - Every subsequent push to `main` (or manual workflow run) will automatically build `./dist/` with persistent `.cache/` caching and sync to S3 + CloudFront.

---

## Option C — Local CLI Setup & Workflow

![Local CLI](https://img.shields.io/badge/Option_C-Local_Terraform_%26_AWS_CLI-10b981?style=for-the-badge&logo=gnubash&logoColor=white&labelColor=111827)

If you prefer to provision infrastructure and deploy directly from your workstation without GitLab CI or GitHub Actions (requires `terraform >= 1.10` and `aws` CLI configured locally via `aws configure` or environment variables):

### Step 1: Provision the Dedicated S3 State Bucket (`bootstrap/`)

```bash
cd terraform/bootstrap
terraform init
terraform apply -var="state_bucket_name=example-com-tfstate" -var="state_bucket_region=ap-northeast-1"
```

### Step 2: Initialize & Apply the Main Infrastructure Stack

```bash
cd ..
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and set:
# environment_domain = "example.com"

terraform init \
  -backend-config="bucket=example-com-tfstate" \
  -backend-config="region=ap-northeast-1"

terraform apply
```

### Step 3: Build & Deploy the Static Site from Your Terminal

From the repository root, run `npm run build` and invoke [`scripts/s3-deploy.sh`](../scripts/s3-deploy.sh) with the `primary_upload_bucket` and `cloudfront_distribution_id` outputs from Step 2:

```bash
cd ..
npm run build

S3_BUCKET="example-com-ap-northeast-1" \
CLOUDFRONT_DISTRIBUTION_ID="E1A2B3C4D5E6F7" \
bash ./scripts/s3-deploy.sh ./dist
```
