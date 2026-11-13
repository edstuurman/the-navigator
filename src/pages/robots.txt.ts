import type { APIRoute } from 'astro';
import { themeConfig } from '../theme.config';

export const GET: APIRoute = () => {
  const siteUrl = themeConfig.site.url.replace(/\/$/, '');
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Sitemaps',
    `Sitemap: ${siteUrl}/sitemap-index.xml`,
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
    '# LLM & AI Context Manifests (llms.txt standard: https://llmstxt.org)',
    '# Structured knowledge graph and site documentation for search engines and AI assistants',
    `Allow: /llms.txt`,
    `Allow: /llms-full.txt`,
    `Allow: /llms.json`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

