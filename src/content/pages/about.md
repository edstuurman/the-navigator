---
pageTitle: "Alex Mercer — About"
description: "About Alex Mercer — Principal Cloud & Platform Architect specializing in multi-region AWS infrastructure, Terraform IaC, and resilient systems."
heading: "About me"
greeting: "Hi, I'm Alex Mercer."
languagesHeading: "Languages"
languages:
  - name: "English"
    level: "Native"
    badgeStyle: "native"
  - name: "Spanish"
    nativeName: "Español"
    level: "Fluent"
    badgeStyle: "fluent"
  - name: "Japanese"
    nativeName: "日本語"
    level: "Conversational"
    badgeStyle: "beginner"
recommendations:
  eyebrow: "Recommendations"
  heading: "Kind words from colleagues"
faq:
  eyebrow: "FAQ"
  heading: "Frequently Asked Questions"
  subtitle: "Common questions about this starter theme, architecture, and deployment stack."
  groups:
    - title: "Theme & Customization"
      description: "How to adapt this starter template for your own site."
      items:
        - question: "Where do I configure my name, domain, avatar, and social links?"
          answerHtml: '<p>All personal and site identity settings live in <code class="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">src/site.config.ts</code>, while UI mechanics (SVG wordmark, navigation links, pagination, tooltips, Formspree, and Umami) live in <code class="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">src/theme.config.ts</code>. See <a href="/blog/2026-11-03-part-1-customizing-this-astro-theme/" class="text-amber-700 dark:text-amber-400 underline underline-offset-2">Part 1 — Customizing This Astro Theme</a> for a complete walkthrough.</p>'
        - question: "How does the Living CV tag taxonomy work?"
          answerHtml: '<p>Shared tags connect four collections—Career Experience (<code class="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">src/data/experiences.ts</code>), Technical Articles (<code class="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">src/content/blog/</code>), Operational Logs (<code class="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">src/content/log/</code>), and Photography (<code class="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">src/content/photography/</code>)—into unified topic archive pages under <a href="/tags/" class="text-amber-700 dark:text-amber-400 underline underline-offset-2">/tags/</a>.</p>'
    - title: "Infrastructure & Delivery"
      description: "Static compilation and multi-region AWS replication."
      items:
        - question: "How is this website built and hosted?"
          answerHtml: '<p>The site compiles to 100% static HTML, CSS, and WebP assets using <strong class="font-semibold text-gray-900 dark:text-gray-100">Astro 7.4</strong> and <strong class="font-semibold text-gray-900 dark:text-gray-100">Tailwind CSS v4</strong>. Build artifacts can be deployed to any static host, or provisioned across regional AWS S3 buckets behind an S3 Multi-Region Access Point (<abbr title="Multi-Region Access Point">MRAP</abbr>) and CloudFront SigV4a Origin Access Control using the included Terraform stack.</p>'
contactSection:
  title: "Get in touch"
  subtitle: "Have a question about cloud architecture, distributed reliability, or this starter theme? Send a message below."
  subject: "Contact via About page"
---

I’m a Principal Cloud & Platform Architect with over a decade of experience designing resilient distributed systems, multi-region edge delivery networks, and declarative infrastructure-as-code workflows.

My engineering philosophy centers on simplicity, observability, and removing moving parts at runtime. Whether architecting global storage replication with AWS S3 Multi-Region Access Points or building zero-SSR static web applications, I prefer systems whose failure modes are predictable and whose deployments are fully reproducible from version control.

Outside the terminal, I spend my time photographing minimalist architecture, coastal geometry, and alpine landscapes.
