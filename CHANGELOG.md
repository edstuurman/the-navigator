# Changelog

All notable changes to this starter theme and infrastructure blueprint are documented in this file and rendered automatically on [`/log/`](/log/).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2026-11-06] — The Navigator v1.2.0 Release

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
