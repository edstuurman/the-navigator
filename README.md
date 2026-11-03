# The Navigator — Astro 7.4 & Tailwind CSS v4 Static Theme + AWS MRAP Infrastructure

**The Navigator** (`the-navigator`) is an open-source starter template for a fast, zero-SSR static personal engineering site, living CV, operational log, technical blog, and photography gallery built with **Astro 7.4** and **Tailwind CSS v4**, paired with turnkey **Terraform** infrastructure for globally replicated **AWS S3 Multi-Region Access Points (MRAP)** + **CloudFront** delivery.

---

## Architecture & Highlights

- **100% Static Output (`output: 'static'`)**: Zero server-side runtime, lightweight progressive-enhancement client scripts, and deterministic HTML routes ready for S3 + CloudFront.
- **Unified 4-Collection Taxonomy**: Shared tags connect Career Experience (`src/data/experiences.ts`), Technical Articles (`src/content/blog/`), Operational Status-Updates (`src/content/log/`), and Photography (`src/content/photography/`) into cross-linked topic archive pages (`/tags/[tag]/`).
- **Single-Source Changelog Stream**: Root `CHANGELOG.md` is parsed at build time and merged directly into `/log/` alongside status-updates and photo rolls with static pagination and category routes (`/log/status/`, `/log/changelogs/`, `/log/photos/`).
- **Zero-Dependency Aspect-Aware Smart Flex Photo Gallery & Lightbox**: Lookahead Smart Flex row engine and accessible `<dialog>`-style `#photo-lightbox` (`src/components/pages/PhotographyView.astro`) with WebP optimization, zoom/fullscreen controls, thumbnail filmstrip, keyboard/swipe navigation, sort-order switching, `?photo=ID` deep links, and individual story pages (`/photography/[id]/`).
- **Configurable Section Navigation & Floating Reading Capsule**: Optional frontmatter-driven section pills (`src/components/SectionNav.astro` & `src/utils/sectionNav.ts`) that morph on scroll into a floating glassmorphic capsule (bottom-docked on desktop with footer collision avoidance; top-docked on mobile) complete with active heading spy, synchronized light/dark theme toggle, site navigation hamburger menu, and back-to-top control.
- **Interactive 7-Card Homepage Carousels**: GPU-accelerated CSS scroll-snap carousels (`src/scripts/carousel.ts`) across **From the Photo Roll**, **From the Blog**, and **From the Log** with dynamic slide counters, pagination pills, and keyboard/swipe support.
- **Build-Time Compilers & Persistent Disk Caching**:
  - **Satori + Resvg OG Cards** (`src/pages/og/[...slug].png.ts` & `src/utils/generateOgImage.ts`) with SHA-256 content-addressed caching in `.cache/og-images/`.
  - **Astro Image Cache** relocated to `.cache/astro/` so `npm ci` in CI/CD preserves optimized WebP/AVIF assets across builds (~1.8s warm production builds).
  - **Inline SVG Mermaid Diagrams** (`rehype-mermaid` + `src/plugins/rehype-mermaid-a11y.mjs`) rendered at build time via headless Chromium with zero client Mermaid bundle.
  - **Click-to-Load YouTube Embeds** (`src/plugins/remark-youtube.mjs` + `src/scripts/youtube-embed.ts`): a fenced ```` ```youtube ```` block compiles to a thumbnail + play-button facade cached in `.cache/youtube-thumbs/`, loading the privacy-enhanced iframe only on click.
  - **Technical Acronym Tooltips** (`src/plugins/rehype-tech-tooltips.mjs` + `src/data/techTerms.ts`) compiled from `<abbr>` / `<Tooltip>` tags at build time with viewport-clamped glassmorphic popovers.
- **Syndication & AI/LLM Endpoints**: Build-time `/rss.xml`, `/atom.xml`, image-enriched `/sitemap-index.xml` (`/sitemap.xml`), `/llms.txt`, `/llms-full.txt`, and `/llms.json`.
- **Turnkey Multi-Region AWS Terraform Stack & Incremental S3 Deployer**:
  - [`terraform/`](./terraform/README.md) provisions up to 17 regional S3 buckets, cross-region S3 Replication Time Control (RTC), an S3 Multi-Region Access Point (MRAP), CloudFront with native SigV4a Origin Access Control (OAC), a `viewer-request` CloudFront Function (naked-to-`www` 301 redirect + `/index.html` directory resolution), automated `us-east-1` ACM SSL certificates, Route 53 `A`/`AAAA` records, and a dedicated S3 remote state + native `.tflock` bucket (`terraform/bootstrap/`).
  - `scripts/s3-deploy.sh` compares local MD5 digests against remote S3 ETags to upload only modified objects and issue targeted CloudFront invalidations.

---

## Project Structure

```text
/
├── .cache/                     # Persistent build caches (Astro WebP/AVIF, SHA-256 OG PNGs, YouTube thumbs)
├── public/                     # Static assets (favicon.svg, logo.svg)
├── scripts/
│   └── s3-deploy.sh            # MD5/ETag incremental S3 uploader & targeted CloudFront invalidator
├── src/
│   ├── components/             # Clean-room UI primitives (Navigation, SectionNav, Footer, AmbientGlow, Tooltip...)
│   │   └── pages/              # Paginated view templates (BlogIndexView, LogIndexView, PhotographyView)
│   ├── content/
│   │   ├── blog/               # Technical articles (.md)
│   │   ├── log/                # Operational status-updates (.md)
│   │   ├── pages/              # Top-level page titles, descriptions & personal narrative (home, about, now, contact, etc.)
│   │   └── photography/        # Individual photograph backstories & EXIF dates (.md)
│   ├── data/                   # Typed datasets (experiences.ts, recommendations.ts, techTerms.ts)
│   ├── images/
│   │   ├── blog/               # Article imagery processed by astro:assets
│   │   ├── photography/        # Source gallery photographs (1.jpg – 40.jpg)
│   │   └── author.jpg          # Profile portrait & author avatar
│   ├── layouts/                # BaseLayout.astro & BlogPost.astro shells
│   ├── pages/                  # Static route entrypoints (/blog, /log, /photography, /tags, /og, RSS/Atom & LLM endpoints)
│   ├── plugins/                # Custom Remark/Rehype build plugins (alerts, YouTube embeds, Mermaid a11y, tech tooltips)
│   ├── scripts/                # Client progressive enhancement (border-beam.ts, carousel.ts, tech-tooltips.ts, youtube-embed.ts)
│   ├── styles/                 # Tailwind CSS v4 global stylesheet (global.css)
│   ├── utils/                  # Pagination, feed builders, OG renderer, section nav, changelog parser & caches
│   ├── content.config.ts       # Astro Content Layer Zod schemas (blog, log, photography, pages)
│   ├── site.config.ts          # Site identity, author profile, headshots & social links
│   └── theme.config.ts         # Theme UI mechanics (SVG logo, nav, pagination, tooltips, integrations, footer)
├── terraform/                  # Multi-region AWS S3 MRAP + CloudFront SigV4a OAC + Route 53 + ACM IaC
│   ├── bootstrap/              # Step 1: Dedicated S3 bucket for Terraform state (.tfstate) & lockfile (.tflock)
│   └── *.tf                    # Step 2: Regional S3 buckets, replication, MRAP, CloudFront, ACM, and Route 53
├── .gitlab-ci.yml              # GitLab CI/CD pipeline (Terraform infrastructure stages + Astro build & S3 deploy)
├── astro.config.mjs            # Astro 7.4 + Tailwind v4 Vite plugin + unified Markdown pipeline
├── CHANGELOG.md                # Single source of truth for site releases
└── package.json
```

---

## Prerequisites & Building the Theme

### Requirements
- **Node.js** `>= 20` (tested on Node 22 / 25) and `npm`
- **Playwright Chromium** *(required at build time by `rehype-mermaid` to compile Markdown `mermaid` fences into inline SVGs)*
- **A GitLab account (free)** *(for repository hosting and automated CI/CD infrastructure & site deployment pipelines)*
- **A Formspree account (free)** *(for the `/contact/` form submission endpoint configured in `src/components/ContactForm.astro`)*

### 1. Install Dependencies & Browser Binary

```bash
npm ci
npx playwright install chromium
```

*(For fresh local setups or updating dependencies, `npm install` works as well.)*

### 2. Local Development

```bash
npm run dev
```

Starts the Astro dev server at `http://localhost:4321` with hot module replacement.

### 3. Production Build

```bash
npm run build
```

- `npm run build` outputs the complete static site into `./dist/`. Cold builds generate all responsive WebP/AVIF photography variants and 1200×630 Open Graph PNGs in ~45–60s; subsequent warm builds reuse `.cache/astro/` and `.cache/og-images/` and finish in **~1.5–2.0s**.
- Preview the compiled `./dist/` folder locally at any time with:
  ```bash
  npm run preview
  ```

### All NPM Commands

| Command | Action |
| :--- | :--- |
| `npm ci` / `npm install` | Install project dependencies |
| `npx playwright install chromium` | Install headless Chromium used by build-time Mermaid SVG rendering |
| `npm run dev` | Start local development server at `localhost:4321` |
| `npm run build` | Build production static site and Open Graph cards to `./dist/` |
| `npm run preview` | Serve `./dist/` locally for pre-deployment inspection |
| `npm run astro -- check` | Run Astro CLI diagnostics |

---

## Provisioning Infrastructure & Deploying to AWS S3 + CloudFront

Full infrastructure-as-code and GitLab CI/CD setup instructions are documented in [`terraform/README.md`](./terraform/README.md).

CI/CD is configured in [`.gitlab-ci.yml`](./.gitlab-ci.yml) across two independent tracks:

1. **Infrastructure Track (`terraform:bootstrap` $\rightarrow$ `terraform:plan` $\rightarrow$ `terraform:apply`)**:
   - Provisions the dedicated S3 state bucket, regional S3 buckets, cross-region replication, S3 Multi-Region Access Point, ACM SSL certificate, CloudFront distribution (with native SigV4a OAC), and Route 53 DNS records.
2. **Site Build & Deploy Track (`build` $\rightarrow$ `deploytos3`)**:
   - **Build Stage**: Uses `mcr.microsoft.com/playwright` with `.npm/` and `.cache/` persisted across runs, executing `npm run build`.
   - **Deploy Stage**: Runs `./scripts/s3-deploy.sh ./dist`, which diffs local MD5 hashes against remote S3 object ETags and invalidates only changed CloudFront paths:

```bash
S3_BUCKET="your-primary-s3-bucket" \
CLOUDFRONT_DISTRIBUTION_ID="YOUR_CF_DIST_ID" \
bash ./scripts/s3-deploy.sh ./dist
```

---

## Adapting as a Starter Theme

If you fork or adapt this repository for your own site:
1. **Site & Author Identity (`src/site.config.ts`)**: Edit [`src/site.config.ts`](./src/site.config.ts) to customize your site URL, domain, title, description, author profile, portrait (`avatar` / `aboutImage`), and social links.
2. **Theme & UI Mechanics (`src/theme.config.ts`)**: Edit [`src/theme.config.ts`](./src/theme.config.ts) to customize the SVG logo wordmark, Formspree endpoint, Umami analytics toggle, navigation items, pagination sizes, automatic technical acronym tooltips, Open Graph branding, and footer columns.
3. **Personal Content & Media**: Replace `src/images/author.jpg`, `src/images/photography/*`, `src/content/{pages,blog,log,photography}/*`, `src/data/experiences.ts`, and `src/data/recommendations.ts` with your own page narrative, writing, career history, and photographs.
4. **Cloud Infrastructure**: Set `environment_domain` in `terraform/terraform.tfvars` (or `TF_VAR_environment_domain` in GitLab CI/CD Variables) and follow [`terraform/README.md`](./terraform/README.md).

---

## Open-Source & Tailwind Plus Cleanliness Audit

All source files (`Astro`, `TypeScript`, `MJS`, `CSS`, and `HCL`) plus `package.json` and `package-lock.json` have been audited and written from scratch for clean MIT open-source readiness.

### Overall Verdict: **0% Proprietary Tailwind Plus Code (~99.8%–100% Original / Open-Source MIT)**

| Layer | Scope | Proprietary / Plus % | Details |
| :--- | :--- | :---: | :--- |
| **NPM Dependencies** | `package.json`, `package-lock.json` | **0%** | `@tailwindplus/elements` and GPLv3 `astro-lightgallery` (`lightgallery`) have been completely removed. Every dependency is permissive open-source (`MIT`, `Apache-2.0`, `MPL-2.0`, `OFL-1.1`). |
| **Decorative & Interactive Primitives** | `AmbientGlow.astro`, `Navigation.astro`, `SectionNav.astro`, `Footer.astro`, `PhotographyView.astro` | **0%** | Zero `clip-path: polygon(...)` blobs, zero `<el-disclosure>` / `in-aria-expanded` / `data-slot="icon"` attributes, and zero nested 3-tier marketing footer grids. |
| **Page & Card Layouts** | `about.astro`, `BlogIndexView.astro`, `BlogPost.astro`, `404.astro`, `LogIndexView.astro`, `now.astro`, `contact.astro`, `tags/index.astro`, `tags/[tag].astro` | **0%** | Custom-built timelines, symmetrical bento rails, glassmorphic `.border-beam-card` components, Formspree controller (`ContactForm.astro`), career spine (`ExperienceTimeline.astro`), and static pagination (`PaginationControls.astro`). |
| **Build Pipelines, Plugins & Scripts** | `src/utils/*`, `src/plugins/*`, `src/scripts/*`, `global.css` | **0%** | 100% bespoke (Satori OG generator + SHA-256 disk cache, Rehype tooltip & Mermaid compilers, border-beam observer, carousel controller, LLM endpoints, RSS/Atom/Sitemap pipelines). |
| **Homepage Intro Card** | `src/pages/index.astro` | **0%–0.18%** | Standard 2-column paragraph grid (`grid-cols-1 gap-8 lg:grid-cols-2`) inside a custom glassmorphism card using generic core Tailwind utility classes. |

### Icon & Utility Licensing Notes
- **Inline SVG Icons** across `Breadcrumbs.astro`, `contact.astro`, `now.astro`, `Footer.astro`, and `PathsForward.astro` come from **Heroicons** (`MIT`) and **Lucide** (`ISC`/`MIT`) — neither is part of Tailwind Plus.
- **Core Tailwind v4 Utilities & Typography** (`mx-auto max-w-7xl`, `prose dark:prose-invert`, `ring-1`) belong to open-source `tailwindcss` (`MIT`) and `@tailwindcss/typography` (`MIT`).
