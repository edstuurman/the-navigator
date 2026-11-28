# Changelog

All notable changes to this starter theme and infrastructure blueprint are documented in this file and rendered automatically on [`/log/`](/log/).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2026-11-28] — Published npm Markdown Plugins (v1.4.0)

### Changed
- **Dogfooded Zero-Dependency npm Plugin Packages**: Replaced vendored local Markdown/build-time plugins with the published npm packages [`rehype-mermaid-a11y`](https://www.npmjs.com/package/rehype-mermaid-a11y), [`rehype-tech-tooltips`](https://www.npmjs.com/package/rehype-tech-tooltips), and [`remark-youtube-facade`](https://www.npmjs.com/package/remark-youtube-facade) in `package.json`, `astro.config.mjs`, `postVideo.ts`, and `TechTooltipsScript.astro`.
- **Standalone Tooltip Stylesheet**: Switched `TechTooltipsScript.astro` to import the package stylesheet `rehype-tech-tooltips/styles.css` directly, removing redundant inline style overrides while preserving `<Tooltip />` arrow alignment.

## [2026-11-28] — The Navigator v1.6.0 Release

### Added & Changed
- **Series Navigation & Related Reading**: Added multi-part `series` / `seriesOrder` frontmatter support with an inline `SeriesBox` navigation card, header series pill, and IDF-weighted tag similarity `RelatedPosts` grid on blog articles.
- **Umami Engagement & Interaction Telemetry**: Added `window.__umamiQueue` / `window.__trackUmami` event queueing in `Head.astro` and progressive-enhancement tracking for genuine article reads (`article-read`), series and related-post clicks, code block copies, Mermaid diagram zoom modals, YouTube video plays, photo lightbox opens, and contact form submissions.
- **Unified Photography Responsive Ladder & Canonical Image SEO**: Consolidated gallery, photo permalink, homepage carousel, [`/log/`](/log/), and [`/tags/`](/tags/) onto a shared 5-variant WebP ladder (`photoImages.ts`) with 1:1 canonical full-resolution matching across `<img src>`, `ImageObject.contentUrl`, lightbox links, and `sitemap-0.xml` `<image:loc>`, enriched scene `alt` text, and accurate photography `<lastmod>` timestamps (`sitemap-images.mjs`).
- **Structured WebPage Schema & Canonical Person Anchoring**: Extended `Head.astro` with `'webpage'` JSON-LD + `pageSameAs` support while keeping `Person` `@id` strictly anchored to the site domain.

## [2026-11-19] — The Navigator v1.5.0 Release

### Added & Changed
- **Configurable Dual-Mode Hero**: Added `hero.style` (`'metrics' | 'classic'`) in `theme.config.ts` so [`/`](/) can toggle seamlessly between the systems-focused metrics layout and the classic editorial avatar hero.
- **High-Impact Systems Hero**: Introduced a 4-column quick-facts metric bar with tabular figures and semantic `<dl>` markup, full-width responsive headline and narrative flow, and customizable CTA action buttons.
- **Dynamic CloudFront Edge Telemetry**: Added progressive enhancement via `edge-telemetry.ts` to detect the nearest CloudFront POP and IATA edge airport code in a live status indicator pill with automatic graceful fallback.

## [2026-11-19] — The Navigator v1.4.0 Release

### Added & Polish
- **Adaptive Two-Column Social Directory**: Redesigned the footer directory to dynamically detect social profile count. When configured with 6 or more social links, the directory automatically scales into an adaptive two-column grid (`lg:grid-cols-5`) for optimal visual balance, while maintaining a clean single-column list when 5 or fewer profiles are configured.
- **Expanded Social Channels (Bluesky, Mastodon & DEV.to)**: Added native support and branded SVG icons for Bluesky, Mastodon, and DEV.to across the footer directory, [`/contact/`](/contact/) direct channel pills, machine-readable `llms.txt`, and automated Schema.org `Person.sameAs` / `<link rel="me">` identity verification.
- **Strict Canonical WebSite Metadata**: Cleaned up the global WebSite entity schema to dynamically mirror site configuration defaults without hardcoded brand assumptions.

## [2026-11-06] — The Navigator v1.3.0 Release

### Added & Changed
- **Modular Feature Toggles**: Every major site section (`home`, `about`, `now`, `blog`, `photography`, `log`, `tags`, `contact`, `contactForm`, `rss`, and `llms`) can now be toggled on or off in one place. Turning a feature off skips building its pages and automatically removes its menu links, homepage carousel, [`/log/`](/log/) filter tab, [`/tags/`](/tags/) section, sitemap entries, and RSS/AI feed items.
- **Configurable Root Homepage (`defaultHomePage`)**: Any enabled section (such as [`/blog/`](/blog/), [`/about/`](/about/), or [`/photography/`](/photography/)) can now be set as the root [`/`](/) front page instead of the multi-stream overview.
- **Optional Contact Form**: The Formspree message form on [`/contact/`](/contact/), [`/about/`](/about/), and blog articles can now be disabled independently (`contactForm: false` or an empty endpoint) while keeping email and social links active.
- **Streamlined Starter Documentation**: Simplified the README and [**Part 1 Setup Guide**](/blog/2026-11-03-part-1-customizing-this-astro-theme/) into a clear, jargon-free tutorial with prominent feature toggle examples.

## [2026-11-05] — The Navigator v1.2.0 Release

### Changed & Optimized
- **Lightweight Social Preview Cards**: Converted all Open Graph link preview cards to optimized MozJPEG images, cutting file size by 88% for fast, crisp link sharing in messaging apps and social feeds.
- **Instant Hover Page Preloading**: Enabled background prefetching on link hover and tap so subsequent pages load instantly.
- **Zero-JavaScript Layout Refinements**: Replaced client-side resizing scripts on [`/blog/`](/blog/) with modern CSS flexbox layouts for zero layout shifts and smoother scrolling.
- **Compact Changelog Summaries**: Compacted long release logs on [`/log/`](/log/) into clean 3-bullet previews with native expand/collapse details.
- **Accessibility & Motion Polish**: Added respect for reduced-motion preferences, improved keyboard and touch tooltip handlers, and unified search-engine structured data.
- **Dual Pipeline Accelerations**: Added pre-baked dependency caching and a slim build container in both GitLab CI and GitHub Actions, speeding up automated builds significantly.

## [2026-11-04] — The Navigator v1.1.0 Release

### Added & Changed
- **Starter Template Dry-Run Mode**: Dual GitHub Actions and GitLab CI workflows pass green in 5–10 seconds out of the box on fresh forks before AWS secrets are configured.
- **Interactive Diagram Zoom Lightbox**: Markdown diagrams now include an interactive zoom modal supporting pinch-to-zoom, click-and-drag panning, and full keyboard navigation.
- **Perfect 100/100 PageSpeed Performance**: Refined stylesheet and script delivery to achieve a perfect 100 PageSpeed score across Performance, Accessibility, Best Practices, and SEO.
- **Responsive Floating Navigation**: The section navigator docks conveniently at the top of the viewport on desktop and in the bottom thumb zone on mobile for effortless one-handed browsing.
- **Dark Mode Surface & Typography Polish**: Enhanced contrast across tag badges and navigation pills with clean slate surfaces and warm amber accents for comfortable reading.
- **4-Tier S3 Caching & Security Headers**: Streamlined S3 deployment script with split browser and edge cache lifetimes, paired with CloudFront security headers.

## [2026-11-03] — The Navigator v1.0.0 Release

### Features & Architecture
- **Decoupled Configuration Architecture**: Site identity, author profile, theme mechanics, navigation, and tooltip options live in simple configuration files for quick personalization.
- **Multi-Region AWS S3 & CloudFront Infrastructure**: Turnkey Terraform modules for globally replicated S3 storage, Multi-Region Access Points (MRAP), and CloudFront SigV4a edge delivery.
- **Fast Build-Time Markdown & Media Compilers**: Integrated automated social preview cards, inline SVG diagrams, privacy-friendly YouTube facades, and zero-JS technical acronym tooltips.
- **Smart Flex Photography Gallery & Lightbox**: Zero-dependency aspect-ratio photo gallery, accessible lightbox with filmstrip and zoom, and unified cross-collection topic archives.
