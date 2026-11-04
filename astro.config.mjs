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
          /** @param {string} d */
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
                logger.warn(`Thumbnail for ${videoId} unavailable (${err instanceof Error ? err.message : String(err)}); using remote URL.`);
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

/**
 * Astro integration inlining self-contained `/_astro/*.js` module scripts directly
 * into built HTML pages so initial navigation has zero chained JS subrequests.
 * @returns {import('astro').AstroIntegration}
 */
function inlineScripts() {
  return {
    name: 'inline-scripts',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        try {
          const distDir = fileURLToPath(dir);
          const astroDir = path.join(distDir, '_astro');
          if (!fs.existsSync(astroDir)) return;

          const jsCache = new Map();
          for (const entry of fs.readdirSync(astroDir, { withFileTypes: true })) {
            if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
            const code = fs.readFileSync(path.join(astroDir, entry.name), 'utf-8');
            // Only inline self-contained bundles without external ES module imports or closing script tags
            if (!/\bimport\s*[\w*{]/.test(code) && !/\bfrom\s*['"]/.test(code) && !/<\/script/i.test(code)) {
              jsCache.set(`/_astro/${entry.name}`, code.trim());
            }
          }
          if (jsCache.size === 0) return;

          const scriptRe = /<script\s+type="module"\s+src="(\/_astro\/[^"]+\.js)"><\/script>/g;
          let inlinedCount = 0;

          /** @param {string} d */
          const walk = (d) => {
            for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
              const full = path.join(d, entry.name);
              if (entry.isDirectory()) walk(full);
              else if (entry.name.endsWith('.html')) {
                const html = fs.readFileSync(full, 'utf-8');
                let modified = false;
                const updated = html.replace(scriptRe, (match, src) => {
                  const code = jsCache.get(src);
                  if (!code) return match;
                  modified = true;
                  return `<script type="module">${code}</script>`;
                });
                if (modified) {
                  fs.writeFileSync(full, updated);
                  inlinedCount++;
                }
              }
            }
          };
          walk(distDir);
          if (inlinedCount > 0) {
            logger.info(`Inlined ${jsCache.size} module script bundle(s) across ${inlinedCount} HTML page(s)`);
          }
        } catch (err) {
          logger.warn(`Failed to inline module scripts: ${err}`);
        }
      },
    },
  };
}

/**
 * Astro integration stripping developer HTML comments (`<!-- ... -->`) from built
 * pages. Source comments stay in `.astro` files for maintainers; visitors don't
 * download them. Content inside `<script>`, `<style>`, `<pre>`, and `<textarea>` is left untouched.
 * @returns {import('astro').AstroIntegration}
 */
function stripHtmlComments() {
  return {
    name: 'strip-html-comments',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const re = /(<(script|style|pre|textarea)\b[\s\S]*?<\/\2>)|<!--(?!\[if)[\s\S]*?-->/gi;
        let saved = 0;

        /** @param {string} d */
        const walk = (d) => {
          for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
            const full = path.join(d, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith('.html')) {
              const html = fs.readFileSync(full, 'utf-8');
              const stripped = html.replace(re, (match, keep) => keep ?? '');
              if (stripped.length !== html.length) {
                saved += html.length - stripped.length;
                fs.writeFileSync(full, stripped);
              }
            }
          }
        };
        walk(distDir);
        if (saved > 0) logger.info(`Stripped ${(saved / 1024).toFixed(1)} KiB of HTML comments from built pages`);
      },
    },
  };
}

/**
 * Astro integration that fails the build if any built HTML page references a
 * `/_astro/*.css` or `/_astro/*.js` asset missing from `dist/`. Guards against
 * stale incremental-build (route cache) output pointing at superseded hashed bundles.
 * @returns {import('astro').AstroIntegration}
 */
function verifyAssetReferences() {
  return {
    name: 'verify-asset-references',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const refRe = /["'(](\/_astro\/[^"'()\s?#]+\.(?:css|js))/g;
        /** @type {Map<string, string>} */
        const missing = new Map();
        let checked = 0;

        /** @param {string} d */
        const walk = (d) => {
          for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
            const full = path.join(d, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith('.html')) {
              checked++;
              for (const m of fs.readFileSync(full, 'utf-8').matchAll(refRe)) {
                if (!missing.has(m[1]) && !fs.existsSync(path.join(distDir, m[1]))) {
                  missing.set(m[1], path.relative(distDir, full));
                }
              }
            }
          }
        };
        walk(distDir);

        if (missing.size > 0) {
          const list = [...missing].map(([asset, page]) => `  ${asset} (first seen in ${page})`).join('\n');
          throw new Error(
            `Built HTML references ${missing.size} missing asset(s). Clear .cache/astro and rebuild:\n${list}`
          );
        }
        logger.info(`All /_astro/ CSS and JS references resolve across ${checked} HTML page(s)`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  cacheDir: './.cache/astro',
  build: {
    // Small per-page styles are inlined; the shared Tailwind bundle ships as one content-hashed,
    // immutably cached file so it is downloaded once and reused across every navigation and prefetch.
    inlineStylesheets: 'auto',
  },
  experimental: {
    incrementalBuild: true,
  },
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'dedupe-tailwind-color-mix-supports',
        generateBundle(_, bundle) {
          const re = /([^{}@]+)\{([a-z-]+):[^{};]+\}@supports \(color:color-mix\(in lab, red, red\)\)\{\1\{\2:([^{};]+)\}\}/g;
          for (const chunk of Object.values(bundle)) {
            if (chunk.type === 'asset' && chunk.fileName.endsWith('.css') && typeof chunk.source === 'string') {
              chunk.source = chunk.source.replace(re, '$1{$2:$3}');
            }
          }
        },
      },
    ],
    build: {
      target: ['chrome111', 'safari16.4', 'firefox113'],
      cssTarget: ['chrome111', 'safari16.4', 'firefox113'],
      // Inline page-specific style chunks (<16 KiB, e.g. BlogPost/Mermaid/Tooltips/YouTube) while
      // keeping the shared site-wide Tailwind bundle (~102 KiB raw / ~12.4 KiB brotli) as a single
      // content-hashed external stylesheet (`/_astro/styles.<hash>.css`).
      assetsInlineLimit: 16384,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.names?.some((n) => n.endsWith('.css'))) {
              return '_astro/styles.[hash][extname]';
            }
            return '_astro/[name].[hash][extname]';
          },
        },
      },
    },
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
      remarkPlugins: [[remarkAlerts, { version: 'v2-note' }], remarkYouTube],
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
        [rehypeMermaidA11y, { version: 'v2-build-time-wrapper' }],
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
          // `img` is passed through to the `sitemap` serializer (image sitemap extension) but is not in `SitemapItem`
          /** @type {import('sitemap').SitemapItemLoose} */ (item).img = images;
        }
        return item;
      }
    }),
    sitemapAlias(),
    youtubeThumbnails(),
    inlineScripts(),
    stripHtmlComments(),
    verifyAssetReferences()
  ],
  prefetch: {
    prefetchAll: true,
    // Prefetch on hover/focus only: pages are 200–400 KB uncompressed, so avoid viewport-wide prefetching.
    defaultStrategy: 'hover',
  }
});
