# Changelog

All notable changes to this starter theme and infrastructure blueprint are documented in this file and rendered automatically on [`/log/`](/log/).

## [2026-11-04] — The Navigator v1.1.0 Release

### Added & Changed
- **GitHub Actions & GitLab CI Dry-Run Pipelines**: Added `.github/workflows/deploy.yml` and enhanced `.gitlab-ci.yml` with automatic **Starter Template Dry-Run Mode** when `S3_BUCKET` and `TF_VAR_environment_domain` are not yet configured.
- **Dark Mode Pill & Tag Contrast Polish**: Refined dark-mode surfaces (`dark:bg-gray-800` / `dark:bg-gray-700/60`) and amber typography (`dark:text-amber-500`) across section navigation pills and experience-linked tag badges.
- **Responsive Floating Section Navigation**: Docked the pop-out section navigation capsule to the top of the viewport on desktop (`sm:top-4`) and the bottom thumb zone on mobile (`bottom-6`) with footer clearance lifting.
- **Edge & Browser Cache-Control Split + Security Headers**: Updated `scripts/s3-deploy.sh` cache tiers and attached AWS Managed `Managed-SecurityHeadersPolicy` in `terraform/cloudfront.tf`.
- **Interactive Mermaid Diagram Zoom Lightbox (`mermaid-zoom.ts`, `rehype-mermaid-a11y.mjs`)**: Wrapped inline Mermaid SVGs in an expandable card with a full-viewport vector zoom/pan modal (`50%`–`500%` scroll zoom, drag-to-pan, double-click `2×`, and keyboard controls) and fixed multi-line `<foreignObject>` label serialization and vertical centering so descenders (`g`, `p`, `q`, parentheses) are never clipped.
- **PageSpeed 100/100/100/100 Performance & WCAG 2.2 AA Accessibility**: Added shared content-hashed stylesheet caching (`build.inlineStylesheets: 'auto'`), per-page ES module script splitting and inlining (`inlineScripts()`, `stripHtmlComments()`, and `verifyAssetReferences()` in `astro.config.mjs`), pre-paint justified gallery sizing (`0.000` CLS) with `fetchpriority="high"` LCP discovery on [`/photography/`](/photography/), batched DOM reads/writes (`section-nav.ts`, `LogIndexView.astro`), W3C HTML-ARIA `role="note"` alert callouts (`remark-alerts.mjs`), and `4.5:1+` WCAG AA contrast across all light and dark surfaces.
- **Type-Safe Astro Check & Timezone-Stable Dates (`dates.ts`, `photoImages.ts`, `site.config.ts`)**: Added `npm run check` (`astro check`) in CI with zero TypeScript errors, added `site.timeZone` (`America/Los_Angeles` default) so frontmatter dates parse and format identically across local machines and UTC CI runners, and consolidated duplicate photography asset globs and breadcrumb structured data.

## [2026-11-03] — The Navigator v1.0.0 Release

### Features & Architecture
- **Decoupled Configuration Architecture**: Split site & author identity (`src/site.config.ts`) from theme UI mechanics (`src/theme.config.ts`) for one-file personalization.
- **Multi-Region AWS S3 MRAP + CloudFront SigV4a Stack**: Included turnkey Terraform modules (`terraform/bootstrap/` and `terraform/`) and MD5/ETag incremental deployment script (`scripts/s3-deploy.sh`).
- **Build-Time Markdown & Media Compilers**: Integrated Satori 1200×630 Open Graph card generator, inline SVG Mermaid renderer, click-to-load YouTube facade, GitHub alerts, and zero-JS technical acronym tooltips (`rehype-tech-tooltips.mjs`).
- **Smart Flex Photography Gallery & Lightbox**: Added zero-dependency aspect-ratio gallery, accessible lightbox with filmstrip and zoom, and unified 4-collection tag taxonomy under [`/tags/`](/tags/).
