# Changelog

All notable changes to this starter theme and infrastructure blueprint are documented in this file and rendered automatically on [`/log/`](/log/).

## [2026-11-03] — The Navigator v1.0.0 Release

### Features & Architecture
- **Decoupled Configuration Architecture**: Split site & author identity (`src/site.config.ts`) from theme UI mechanics (`src/theme.config.ts`) for one-file personalization.
- **Multi-Region AWS S3 MRAP + CloudFront SigV4a Stack**: Included turnkey Terraform modules (`terraform/bootstrap/` and `terraform/`) and MD5/ETag incremental deployment script (`scripts/s3-deploy.sh`).
- **Build-Time Markdown & Media Compilers**: Integrated Satori 1200×630 Open Graph card generator, inline SVG Mermaid renderer, click-to-load YouTube facade, GitHub alerts, and zero-JS technical acronym tooltips (`rehype-tech-tooltips.mjs`).
- **Smart Flex Photography Gallery & Lightbox**: Added zero-dependency aspect-ratio gallery, accessible lightbox with filmstrip and zoom, and unified 4-collection tag taxonomy under [`/tags/`](/tags/).
