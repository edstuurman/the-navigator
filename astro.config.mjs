// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { remarkAlerts } from './src/plugins/remark-alerts.mjs';
import { remarkYouTube } from './src/plugins/remark-youtube.mjs';
import { THUMB_CACHE_DIR, THUMB_PUBLIC_PREFIX, THUMB_FILENAME_RE, buildThumbnailBuffer, remoteThumbnailUrl } from './src/utils/youtube-thumbnail.mjs';
import { rehypeMermaidA11y } from './src/plugins/rehype-mermaid-a11y.mjs';
import { rehypeTechTooltips, TECH_TOOLTIPS_DIGEST } from './src/plugins/rehype-tech-tooltips.mjs';
import { getImagesForUrl, getLastModForUrl } from './src/utils/sitemap-images.mjs';
import { themeConfig } from './src/theme.config.ts';
import rehypeMermaid from 'rehype-mermaid';

/**
 * Astro integration ensuring sitemap.xml exists alongside sitemap-index.xml
 * for direct browser requests and legacy crawler compatibility.
 * @returns {import('astro').AstroIntegration}
 */
function sitemapAlias() {
  return {
    name: 'sitemap-alias',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        try {
          const distDir = fileURLToPath(dir);
          const indexFile = path.join(distDir, 'sitemap-index.xml');
          const aliasFile = path.join(distDir, 'sitemap.xml');
          if (fs.existsSync(indexFile)) {
            fs.copyFileSync(indexFile, aliasFile);
            logger.info('`sitemap.xml` created as alias to `sitemap-index.xml`');
          }
        } catch (err) {
          logger.warn(`Failed to create sitemap.xml alias: ${err}`);
        }
      }
    }
  };
}

/**
 * Astro integration publishing cached YouTube facade thumbnails (downloaded at
 * build time by `remark-youtube.mjs`) under `/yt-thumbs/` in both `dist/` and
 * the dev server.
 * @returns {import('astro').AstroIntegration}
 */
function youtubeThumbnails() {
  return {
    name: 'youtube-thumbnails',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(THUMB_PUBLIC_PREFIX, (req, res, next) => {
          const name = path.basename((req.url || '').split('?')[0]);
          const file = path.join(THUMB_CACHE_DIR, name);
          if (!THUMB_FILENAME_RE.test(name) || !fs.existsSync(file)) return next();
          res.setHeader('Content-Type', 'image/webp');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          fs.createReadStream(file).pipe(res);
        });
      },
      'astro:build:done': async ({ dir, logger }) => {
        try {
          const distDir = fileURLToPath(dir);
          // Map each thumbnail file referenced by built pages -> the HTML files using it.
          const references = new Map();
          const refRe = new RegExp(`${THUMB_PUBLIC_PREFIX}/([A-Za-z0-9_.-]+\\.webp)`, 'g');
          const walk = (d) => {
            for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
              const full = path.join(d, entry.name);
              if (entry.isDirectory()) walk(full);
              else if (entry.name.endsWith('.html')) {
                for (const m of fs.readFileSync(full, 'utf-8').matchAll(refRe)) {
                  if (!THUMB_FILENAME_RE.test(m[1])) continue;
                  if (!references.has(m[1])) references.set(m[1], new Set());
                  references.get(m[1]).add(full);
                }
              }
            }
          };
          walk(distDir);
          if (references.size === 0) return;

          const outDir = path.join(distDir, THUMB_PUBLIC_PREFIX.slice(1));
          fs.mkdirSync(THUMB_CACHE_DIR, { recursive: true });
          fs.mkdirSync(outDir, { recursive: true });
          let published = 0;

          for (const [file, pages] of references) {
            const cached = path.join(THUMB_CACHE_DIR, file);
            if (!fs.existsSync(cached)) {
              // Page HTML came from Astro's content cache but the thumbnail cache is cold: heal or soft-fail.
              const videoId = file.slice(0, 11);
              try {
                fs.writeFileSync(cached, await buildThumbnailBuffer(videoId));
                logger.warn(`Re-downloaded missing YouTube thumbnail for ${videoId}`);
              } catch (err) {
                logger.warn(`Thumbnail for ${videoId} unavailable (${err?.message ?? err}); using remote URL.`);
                for (const page of pages) {
                  const html = fs.readFileSync(page, 'utf-8');
                  fs.writeFileSync(page, html.split(`${THUMB_PUBLIC_PREFIX}/${file}`).join(remoteThumbnailUrl(videoId)));
                }
                continue;
              }
            }
            fs.copyFileSync(cached, path.join(outDir, file));
            published++;
          }
          if (published > 0) logger.info(`Published ${published} YouTube thumbnail(s) to ${THUMB_PUBLIC_PREFIX}/`);
        } catch (err) {
          logger.warn(`Failed to publish YouTube thumbnails: ${err}`);
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  cacheDir: './.cache/astro',
  experimental: {
    incrementalBuild: true,
  },
  vite: {
    plugins: [tailwindcss()]
  },
  site: themeConfig.site.url,
  redirects: {
    '/tags/infra': '/tags/infrastructure/',
  },
  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid'],
    },
    processor: unified({
      remarkPlugins: [remarkAlerts, remarkYouTube],
      rehypePlugins: [
        [
          rehypeMermaid,
          {
            strategy: 'inline-svg',
            launchOptions: {
              args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
            mermaidConfig: {
              theme: 'dark',
              htmlLabels: true,
              flowchart: {
                htmlLabels: true,
                padding: 20,
                wrappingWidth: 240,
                subGraphTitleMargin: {
                  top: 10,
                  bottom: 8,
                },
                diagramPadding: 12,
              },
              themeCSS: `
                .cluster-label span.nodeLabel p { padding: 0 12px !important; }
                .node .nodeLabel p { padding: 2px 6px !important; }
              `,
              themeVariables: {
                darkMode: true,
                background: 'transparent',
                mainBkg: '#1f2937',
                nodeBorder: '#f59e0b',
                clusterBkg: '#111827',
                titleColor: '#f3f4f6',
                textColor: '#f3f4f6',
                lineColor: '#f59e0b',
                arrowheadColor: '#f59e0b',
              },
            },
          },
        ],
        rehypeMermaidA11y,
        [rehypeTechTooltips, { digest: TECH_TOOLTIPS_DIGEST }],
      ],
    }),
  },
  integrations: [
    sitemap({
      xslURL: '/sitemap-style.xsl',
      serialize(item) {
        const lastmod = getLastModForUrl(item);
        if (lastmod) {
          item.lastmod = lastmod;
        }
        const images = getImagesForUrl(item);
        if (images && images.length > 0) {
          item.img = images;
        }
        return item;
      }
    }),
    sitemapAlias(),
    youtubeThumbnails()
  ],
  prefetch: {
    prefetchAll: true
  }
});
