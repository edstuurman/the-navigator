---
title: "Validated native CloudFront SigV4a Origin Access Control against S3 MRAP"
date: 2026-10-29
type: "note"
tags: ["AWS", "Infrastructure", "CI/CD"]
---

Confirmed end-to-end `sigv4a` request signing between CloudFront and the global `*.accesspoint.s3-global.amazonaws.com` Multi-Region Access Point endpoint using native Origin Access Control (<abbr>OAC</abbr>), retiring the legacy `Lambda@Edge` Python signer.
