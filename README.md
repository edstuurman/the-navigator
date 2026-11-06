# The Navigator — Modular Astro 7 & Tailwind CSS v4 Starter Theme

[![Live Interactive Demo: the-navigator-sage.vercel.app](https://img.shields.io/badge/%F0%9F%A7%AD%20Live%20Interactive%20Demo-the--navigator--sage.vercel.app-d97706?style=for-the-badge&labelColor=111827)](https://the-navigator-sage.vercel.app/)
[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/edstuurman/the-navigator/deploy.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&label=CI%2FCD%20Dry--Run&labelColor=111827)](https://github.com/edstuurman/the-navigator/actions/workflows/deploy.yml)
[![Astro 7.4](https://img.shields.io/badge/Astro-7.4-ff5d01?style=for-the-badge&logo=astro&logoColor=white&labelColor=111827)](https://astro.build/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=111827)](https://tailwindcss.com/)
[![Terraform AWS S3 + CloudFront](https://img.shields.io/badge/Optional_Terraform-AWS_S3_%2B_CloudFront-7b42bc?style=for-the-badge&logo=terraform&logoColor=white&labelColor=111827)](./terraform/README.md)

> ### 🚀 **[Explore the Live Demo → https://the-navigator-sage.vercel.app/](https://the-navigator-sage.vercel.app/)**
>
> Try **The Navigator** in your browser — test the Light/Dark theme switcher, homepage carousels, photo gallery & lightbox (`?photo=1`), interactive Markdown diagrams, hover tooltips, and floating section navigator.

**The Navigator** is an open-source, modular starter template for a fast personal website, blog, living CV, activity log, and photography portfolio built with **Astro 7.4** and **Tailwind CSS v4**.

Every section of the site is **toggleable in a single configuration file**, and you can set any page (such as your Blog or About page) as your front page. Deploy the static output for free on **Vercel, Netlify, Cloudflare Pages, or GitHub/GitLab Pages**, or use the optional **Terraform** stack for multi-region **AWS S3 + CloudFront** hosting.

[![The Navigator — Dark & Light Mode Homepage Overview](./docs/screenshots/navigator_01_home_dark_light_1280x720.png)](https://the-navigator-sage.vercel.app/)

---

## Modular by Design — Toggle Any Feature (`src/theme.config.ts`)

Want a blog and an about page without a photo gallery? Prefer your blog index to be the front page instead of the multi-section overview? You can turn any feature on or off in [`src/theme.config.ts`](./src/theme.config.ts) without touching a single `.astro` template:

```ts
features: {
  defaultHomePage: 'home', // 'home' | 'blog' | 'about' | 'now' | 'photography' | 'log' | 'tags' | 'contact'
  home: true,              // Multi-stream overview page with carousels
  about: true,             // Bio, career timeline & peer recommendations
  now: true,               // Current focus & status page (/now/)
  blog: true,              // Articles & reading-time archive (/blog/)
  photography: true,       // Photo gallery, lightbox & photo logs (/photography/)
  log: true,               // Short status notes & release changelog stream (/log/)
  tags: true,              // Cross-linked topic pages (/tags/)
  contact: true,           // Contact page & social/email links (/contact/)
  contactForm: true,       // Optional Formspree message form on /contact/, /about/ & blog posts
  rss: true,               // RSS (/rss.xml) & Atom (/atom.xml) feeds
  llms: true,              // AI-readable site indexes (/llms.txt, /llms-full.txt, /llms.json)
}
```

- **Complete feature removal when disabled**: Turning a section off (or setting `enabled: false` on its item in `navigation.items`) doesn't just hide the menu link—it skips building those pages and removes its homepage carousel, log filter tabs, tag archive sections, sitemap links, and RSS/AI feed items automatically.
- **Configurable homepage (`defaultHomePage`)**: Set `defaultHomePage: 'blog'` (or `'about'`, `'photography'`, `'now'`, etc.) to render that page directly at `/`.
- **Optional contact form**: Don't want a form backend? Set `contactForm: false` (or leave the Formspree URL blank) to hide the message form on `/contact/`, `/about/`, and blog posts while keeping your email and social links.

---

## Visual Tour & Screenshots

| Technical Blog & Featured Articles | Photo Gallery & Lightbox |
| :---: | :---: |
| [![Technical Blog Index & Featured Article Rail](./docs/screenshots/navigator_02_blog_featured_1280x720.png)](https://the-navigator-sage.vercel.app/blog/) | [![Smart Flex Photography Gallery & Lightbox](./docs/screenshots/navigator_03_photography_gallery_lightbox_1280x720.png)](https://the-navigator-sage.vercel.app/photography/) |
| Featured article cards, reading-time estimates, click-to-play YouTube embeds, and topic tags on [`/blog/`](https://the-navigator-sage.vercel.app/blog/). | Responsive aspect-ratio photo grid and accessible lightbox with zoom, thumbnail filmstrip, and shareable links on [`/photography/`](https://the-navigator-sage.vercel.app/photography/). |

| Living CV & Career Timeline | Rich Markdown, Diagrams & Activity Log |
| :---: | :---: |
| [![Living CV & Tag-Linked Experience Timeline](./docs/screenshots/navigator_04_experience_timeline_1280x720.png)](https://the-navigator-sage.vercel.app/about/) | [![Rich Markdown, Inline Mermaid & Operational Log](./docs/screenshots/navigator_05_markdown_mermaid_and_log_1280x720.png)](https://the-navigator-sage.vercel.app/log/) |
| Interactive career timeline on [`/about/`](https://the-navigator-sage.vercel.app/about/) connecting roles to related articles, status notes, and photos. | Light/dark Mermaid diagrams with zoom, hover tooltips for technical terms, callout alerts, and the unified [`/log/`](https://the-navigator-sage.vercel.app/log/) stream. |

---

## Key Features

- **100% Static & Fast**: Generates clean HTML/CSS with minimal JavaScript (~4–6 KB gzipped per page) and instant hover page preloading. Warm builds finish in **~1.5–2 seconds**.
- **Living CV & Cross-Linked Topics**: Shared tags connect your career timeline (`src/data/experiences.ts`), blog posts (`src/content/blog/`), status updates (`src/content/log/`), and photos (`src/content/photography/`) into unified topic pages (`/tags/[tag]/`).
- **Unified Activity & Release Log (`/log/`)**: Merges short status updates, photo rolls, and release notes from root `CHANGELOG.md` into one filterable timeline.
- **Zero-Dependency Photo Gallery & Lightbox**: Justified photo grid and `<dialog>` lightbox with WebP optimization, zoom/fullscreen controls, thumbnail strip, keyboard/swipe navigation, and individual photo pages (`/photography/[id]/`).
- **Rich Markdown Writing**:
  - **Diagrams**: ```` ```mermaid ```` code blocks compile at build time into crisp inline SVGs with an interactive zoom/pan modal.
  - **Privacy-Friendly Video**: ```` ```youtube ```` blocks render a cached thumbnail with a play button, loading YouTube only when clicked.
  - **Automatic Term Tooltips**: Technical terms in `src/data/techTerms.ts` automatically upgrade into hover/tap definition cards.
  - **Callouts & Code Copy**: GitHub-style alerts (`> [!NOTE]`, `> [!TIP]`) and one-click copy buttons on code blocks.
- **Floating Section Navigator**: Optional table-of-contents bar that docks to the top of the screen on desktop and the bottom thumb zone on mobile, complete with a Light/Dark theme toggle and quick navigation menu.
- **Automatic Social Preview Cards & Feeds**: Build-time 1200×630 Open Graph preview images (`/og/*.jpg`) for every page, plus toggleable RSS/Atom feeds and AI discovery files (`/llms.txt`).

---

## Project Structure

```text
/
├── .cache/                     # Build caches (optimized images, social preview cards, video thumbnails)
├── .github/workflows/          # Optional GitHub Actions CI/CD workflow (with 5s dry-run mode)
├── docs/screenshots/           # Theme screenshots
├── public/                     # Static assets (favicon.svg, logo.svg)
├── scripts/
│   └── s3-deploy.sh            # Optional AWS S3 sync & CloudFront invalidation script
├── src/
│   ├── components/             # UI components & reusable page views (HomeView, BlogIndexView, etc.)
│   ├── content/
│   │   ├── blog/               # Blog articles (.md)
│   │   ├── log/                # Short status updates (.md)
│   │   ├── pages/              # Page titles, descriptions & intro copy (home, about, now, contact...)
│   │   └── photography/        # Photo titles, stories & capture dates (.md)
│   ├── data/                   # Career timeline (experiences.ts), recommendations.ts & techTerms.ts
│   ├── images/                 # Author portrait (author.jpg), blog images & gallery photos
│   ├── layouts/                # Base page layout & blog post layout
│   ├── pages/                  # Route entrypoints, social card generator (/og) & RSS/LLM feeds
│   ├── plugins/                # Markdown plugins (alerts, YouTube facade, Mermaid zoom, tooltips)
│   ├── scripts/                # Lightweight browser scripts (carousels, tooltips, theme toggle)
│   ├── styles/                 # Tailwind CSS v4 stylesheet (global.css)
│   ├── utils/                  # Feature flags, pagination, feeds & caching helpers
│   ├── site.config.ts          # 1. Your identity, bio, avatar & social links
│   └── theme.config.ts         # 2. Feature toggles, default homepage, logo, nav & integrations
├── terraform/                  # Optional AWS S3 + CloudFront Terraform templates
├── .gitlab-ci.yml              # Optional GitLab CI/CD pipeline
├── CHANGELOG.md                # Release history (automatically shown on /log/)
└── package.json
```

---

## Quickstart & Local Development

### Requirements
- **Node.js** `>= 20` and `npm`
- **Playwright Chromium** *(used at build time to render Markdown Mermaid diagrams into SVG)*
- *(Optional)* **A [Formspree](https://formspree.io/) account (free)** — only needed if you want the embedded message form on `/contact/`, `/about/`, and blog posts (`integrations.formspree.endpoint` in `src/theme.config.ts`). Set `contactForm: false` or leave the endpoint blank to use simple email/social links instead.
- *(Optional)* **An [Umami](https://umami.is/) account or self-hosted instance** — for privacy-friendly analytics (`integrations.umami` in `src/theme.config.ts`).
- *(Optional)* **A GitLab or GitHub account** — for repository hosting and automated CI/CD builds.

### 1. Install Dependencies

```bash
npm ci
npx playwright install chromium
```

*(For fresh local setups or updating packages, `npm install` works as well.)*

### 2. Start the Dev Server

```bash
npm run dev
```

Opens the local site at `http://localhost:4321` with live reload.

### 3. Build for Production

```bash
npm run build
npm run preview
```

Outputs the static site into `./dist/`. The first build generates all responsive photos and social preview cards (~45–60s); subsequent builds reuse `.cache/` and finish in **~1.5–2.0s**.

### Useful Commands

| Command | Action |
| :--- | :--- |
| `npm ci` / `npm install` | Install dependencies |
| `npx playwright install chromium` | Install headless Chromium for build-time diagram rendering |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build static site into `./dist/` |
| `npm run preview` | Preview the built `./dist/` folder locally |
| `npm run check` | Run Astro & TypeScript diagnostics |

---

## Customizing Your Site (3-Part Guide)

The theme includes a built-in **3-Part Setup & Deployment Guide** in `src/content/blog/` (featured on the starter homepage and live at [`the-navigator-sage.vercel.app`](https://the-navigator-sage.vercel.app/)):
- **[Part 1 — Customizing This Astro Theme](https://the-navigator-sage.vercel.app/blog/2026-11-03-part-1-customizing-this-astro-theme/)**: Editing `src/site.config.ts`, toggling features in `src/theme.config.ts`, and adding your own pages and posts.
- **[Part 2 (Optional) — Provisioning the Multi-Region AWS Stack with Terraform](https://the-navigator-sage.vercel.app/blog/2026-11-03-part-2-provisioning-aws-mrap-cloudfront-terraform-gitlab-ci/)**: Setting up AWS S3, CloudFront, SSL certificates, and Route 53 DNS with Terraform.
- **[Part 3 — Automated CI/CD Pipelines & Deploying to Any Static Host](https://the-navigator-sage.vercel.app/blog/2026-11-03-part-3-ci-cd-pipelines-dry-run-mode-and-static-hosting/)**: Zero-config hosting on Vercel, Netlify, or Cloudflare Pages, plus GitHub Actions and GitLab CI pipelines.

### Quick Customization Checklist
1. **Your Identity (`src/site.config.ts`)**: Update your site URL, title, author name, bio, portrait (`src/images/author.jpg`), and social links.
2. **Features & Layout (`src/theme.config.ts`)**: Choose your `defaultHomePage`, toggle the sections you want under `features`, set your logo text, and optionally add a Formspree endpoint or Umami analytics ID.
3. **Your Content (`src/content/` & `src/data/`)**: Replace the starter blog posts, photos, page intros (`src/content/pages/*.md`), and career timeline (`src/data/experiences.ts`). *(Set `setupGuide.enabled: false` in [`src/content/pages/home.md`](./src/content/pages/home.md) to hide the starter onboarding banner on the homepage.)*

---

## (Optional) Deploying to AWS S3 + CloudFront

Because `npm run build` outputs a standard `./dist/` folder, you can deploy **The Navigator** to **Vercel, Netlify, Cloudflare Pages, or GitHub/GitLab Pages** with zero AWS setup.

If you want the multi-region AWS S3 + CloudFront stack, full setup instructions are in [`terraform/README.md`](./terraform/README.md) and [Part 2 of the Guide](https://the-navigator-sage.vercel.app/blog/2026-11-03-part-2-provisioning-aws-mrap-cloudfront-terraform-gitlab-ci/). Both **GitLab CI** ([`.gitlab-ci.yml`](./.gitlab-ci.yml)) and **GitHub Actions** ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)) include an automatic **Dry-Run Mode** that passes in 5–10 seconds until you configure your AWS repository variables:

> [!NOTE]
> **Enabling CI/CD on Your Fork**: Automated CI is disabled on the upstream `the-navigator` template repository to conserve shared runner minutes. To enable automated builds on your fork:
> - **GitLab CI**: Runs automatically if you rename your repository when forking (e.g. `my-site`). If your project path still contains `navigator`, set CI/CD variable `ENABLE_CI = "true"` in **Settings > CI/CD > Variables**.
> - **GitHub Actions**: Un-comment the `push:` block at lines 6–10 of `.github/workflows/deploy.yml` to trigger builds on every push to `main`.
