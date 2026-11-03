import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { siteConfig } from '../site.config.ts';

const SITE_URL = siteConfig.site.url.replace(/\/+$/, '');
const SITE_TITLE = siteConfig.site.title;
const AUTHOR_NAME = siteConfig.author.name;
const AUTHOR_ROLE = siteConfig.author.jobTitle;
const AUTHOR_LOCATION = siteConfig.author.location;
const AUTHOR_AVATAR_STEM = path.parse(siteConfig.author.avatar || 'author.jpg').name.toLowerCase();
const AUTHOR_ABOUT_STEM = path.parse(siteConfig.author.aboutImage || siteConfig.author.avatar || 'author.jpg').name.toLowerCase();
const ESCAPED_SITE_TITLE = SITE_TITLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PREFIX_TITLE_REGEX = new RegExp(`^${ESCAPED_SITE_TITLE}\\s*[-—|:]\\s*`, 'i');
const SUFFIX_TITLE_REGEX = new RegExp(`\\s*[-—|:]\\s*${ESCAPED_SITE_TITLE}$`, 'i');

const gitTimeCache = new Map();

/**
 * Resolves the latest git commit ISO timestamp for a file, or falls back to fs.statSync mtime.
 * Results are cached in memory for the duration of the build to avoid redundant git queries.
 *
 * @param {string} filePath
 * @returns {string | undefined}
 */
export function getGitCommitDate(filePath) {
  if (gitTimeCache.has(filePath)) {
    return gitTimeCache.get(filePath);
  }
  try {
    const out = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    if (out) {
      const d = new Date(out);
      if (!isNaN(d.getTime())) {
        const iso = d.toISOString();
        gitTimeCache.set(filePath, iso);
        return iso;
      }
    }
  } catch {
    // Git unavailable or file not yet committed
  }
  try {
    if (fs.existsSync(filePath)) {
      const iso = fs.statSync(filePath).mtime.toISOString();
      gitTimeCache.set(filePath, iso);
      return iso;
    }
  } catch {}
  gitTimeCache.set(filePath, undefined);
  return undefined;
}

/**
 * Extracts a clean, semantic title from HTML for an article or page,
 * prioritizing <h1>, then stripping site branding prefixes/suffixes from <title>.
 *
 * @param {string} html
 * @returns {string}
 */
export function extractPageTitle(html) {
  // 1. Try <h1> first (ideal for articles / blog posts)
  const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    const clean = h1Match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    if (clean) return clean;
  }

  // 2. Try <title> tag, stripping site branding prefix/suffix
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    let title = titleMatch[1]
      .replace(PREFIX_TITLE_REGEX, '')
      .replace(SUFFIX_TITLE_REGEX, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    if (title) return title;
  }

  // 3. Try <meta property="og:title">
  const ogTitleMatch = html.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/i);
  if (ogTitleMatch) {
    let title = ogTitleMatch[1]
      .replace(PREFIX_TITLE_REGEX, '')
      .replace(SUFFIX_TITLE_REGEX, '')
      .trim();
    if (title) return title;
  }

  return SITE_TITLE;
}

/**
 * Checks whether an image URL points to an author headshot or avatar.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isHeadshotUrl(url) {
  const lower = url.toLowerCase();
  return (
    lower.includes(AUTHOR_AVATAR_STEM) ||
    lower.includes(AUTHOR_ABOUT_STEM) ||
    lower.includes('avatar') ||
    lower.includes('author') ||
    lower.includes('headshot')
  );
}

/**
 * Extracts image metadata for a given sitemap item URL.
 * Reads the generated static HTML from the dist/ directory.
 *
 * @param {{ url: string }} item
 * @param {string} distDir
 * @returns {Array<{url: string, title?: string, caption?: string, geoLocation?: string}>}
 */
export function getImagesForUrl(item, distDir = path.join(process.cwd(), 'dist')) {
  try {
    const urlObj = new URL(item.url);
    let pathname = urlObj.pathname;
    if (pathname.endsWith('/')) {
      pathname += 'index.html';
    } else if (!pathname.endsWith('.html')) {
      pathname += '/index.html';
    }

    const htmlPath = path.join(distDir, pathname);
    if (!fs.existsSync(htmlPath)) {
      return [];
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const images = [];
    const seenUrls = new Set();

    const addImage = (img) => {
      if (!img || !img.url) return;
      let fullUrl = img.url;
      if (fullUrl.startsWith('/')) {
        fullUrl = `${SITE_URL}${fullUrl}`;
      }
      // Strictly ignore author headshots in sitemap.xml
      if (isHeadshotUrl(fullUrl)) {
        return;
      }
      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        images.push({
          url: fullUrl,
          ...(img.title ? { title: img.title } : {}),
          ...(img.caption ? { caption: img.caption } : {}),
          ...(img.geoLocation ? { geoLocation: img.geoLocation } : {}),
        });
      }
    };

    // 1. Photography gallery page - bundle all full-resolution photos
    if (
      urlObj.pathname === '/photography' ||
      urlObj.pathname === '/photography/' ||
      urlObj.pathname.startsWith('/photography/page/')
    ) {
      const galleryMatches = [
        ...html.matchAll(/<a\b[^>]*class="[^"]*\bgallery-photo-card\b[^"]*"[^>]*>/g),
      ];
      galleryMatches.forEach((m, idx) => {
        const hrefMatch = m[0].match(/\bhref="([^"]+)"/);
        if (!hrefMatch) return;
        const href = hrefMatch[1];
        const idMatch = m[0].match(/\bdata-photo-id="(\d+)"/);
        const numMatch = href.match(/\/(\d+)\.[^/]+$/);
        const photoNum = idMatch ? idMatch[1] : numMatch ? numMatch[1] : idx + 1;
        addImage({
          url: href,
          title: `Photograph #${photoNum} — ${AUTHOR_NAME}`,
          caption: `Moments, landscapes, and architecture captured through the lens in ${AUTHOR_LOCATION}.`,
          geoLocation: AUTHOR_LOCATION,
        });
      });
      return images;
    }

    // 2. Homepage - featured photo roll mementos and opengraph image
    if (urlObj.pathname === '/' || urlObj.pathname === '') {
      const imgTags = [...html.matchAll(/<img\b[^>]*class="[^"]*aspect-video[^"]*"[^>]*>/g)];
      imgTags.forEach((m, idx) => {
        const srcMatch = m[0].match(/\bsrc="([^">]+)"/);
        if (!srcMatch) return;
        const href = srcMatch[1];
        const numMatch = href.match(/\/(\d+)\.[^/]+$/);
        const photoNum = numMatch ? numMatch[1] : (idx + 1);
        addImage({
          url: href,
          title: `Photograph #${photoNum} from the photo roll — ${AUTHOR_NAME}`,
          caption: `Moments from the photo roll in ${AUTHOR_LOCATION}.`,
          geoLocation: AUTHOR_LOCATION,
        });
      });

      const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (ogMatch) {
        addImage({
          url: ogMatch[1],
          title: SITE_TITLE,
          caption: `${AUTHOR_NAME} — ${AUTHOR_ROLE}`,
          geoLocation: AUTHOR_LOCATION,
        });
      }
      return images;
    }

    // 3. Blog Posts - article diagrams/screenshots & named OG image
    if (
      urlObj.pathname.startsWith('/blog/') &&
      urlObj.pathname !== '/blog/' &&
      !urlObj.pathname.startsWith('/blog/page/')
    ) {
      const articleTitle = extractPageTitle(html);

      const articleMatch = html.match(/<article[\s\S]*?<\/article>/);
      if (articleMatch) {
        const articleHtml = articleMatch[0];
        const articleImgs = [...articleHtml.matchAll(/<img[^>]+src="([^">]+)"(?:[^>]*alt="([^">]*)")?[^>]*>/g)];
        for (const m of articleImgs) {
          const src = m[1];
          if (isHeadshotUrl(src)) continue;
          const alt = m[2] || articleTitle;
          addImage({
            url: src,
            title: alt,
            caption: `${alt} — ${articleTitle}`,
            geoLocation: AUTHOR_LOCATION,
          });
        }
      }

      const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (ogMatch) {
        addImage({
          url: ogMatch[1],
          title: articleTitle,
          caption: `${articleTitle} — ${AUTHOR_NAME}`,
          geoLocation: AUTHOR_LOCATION,
        });
      }
      return images;
    }

    // 4. General content pages with opengraph image (e.g. /about/, /now/, /log/, /contact/)
    if (!urlObj.pathname.startsWith('/tags/')) {
      const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (ogMatch) {
        const pageTitle = extractPageTitle(html);
        addImage({
          url: ogMatch[1],
          title: pageTitle,
          caption: `${pageTitle} — ${AUTHOR_NAME}`,
          geoLocation: AUTHOR_LOCATION,
        });
      }
    }

    return images;
  } catch (err) {
    console.warn(`[sitemap-images] Failed to extract images for ${item?.url}:`, err);
    return [];
  }
}

/**
 * Resolves an authentic per-page ISO `lastmod` timestamp by inspecting
 * article modified/published meta tags, embedded `<time datetime="...">`
 * elements in the built HTML, or source file modification times.
 *
 * @param {{ url: string }} item
 * @param {string} distDir
 * @returns {string | undefined}
 */
export function getLastModForUrl(item, distDir = path.join(process.cwd(), 'dist')) {
  try {
    const urlObj = new URL(item.url);
    let pathname = urlObj.pathname;
    if (pathname.endsWith('/')) {
      pathname += 'index.html';
    } else if (!pathname.endsWith('.html')) {
      pathname += '/index.html';
    }

    const htmlPath = path.join(distDir, pathname);
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');

      // 1. Explicit Open Graph article modified/published timestamps (blog articles)
      const modMatch = html.match(/<meta property="article:modified_time" content="([^"]+)"/);
      if (modMatch) {
        const d = new Date(modMatch[1]);
        if (!isNaN(d.getTime())) return d.toISOString();
      }
      const pubMatch = html.match(/<meta property="article:published_time" content="([^"]+)"/);
      if (pubMatch) {
        const d = new Date(pubMatch[1]);
        if (!isNaN(d.getTime())) return d.toISOString();
      }

      // 2. Latest `<time datetime="...">` rendered on collection/index/tag pages
      const timeMatches = [...html.matchAll(/<time\b[^>]*\bdatetime="([^"]+)"/g)];
      if (timeMatches.length > 0) {
        let maxMs = 0;
        for (const m of timeMatches) {
          const ms = new Date(m[1]).getTime();
          if (!isNaN(ms) && ms > maxMs) maxMs = ms;
        }
        if (maxMs > 0) return new Date(maxMs).toISOString();
      }

      // 2b. Photography gallery: inspect embedded photoDateMeta JSON timestamps
      const photoMetaMatch = html.match(/<script[^>]*id="photo-dates-data"[^>]*>([\s\S]*?)<\/script>/);
      if (photoMetaMatch) {
        try {
          const parsed = JSON.parse(photoMetaMatch[1]);
          const photoTimestamps = Object.values(parsed).map(Number).filter((n) => !isNaN(n) && n > 0);
          if (photoTimestamps.length > 0) {
            let maxPhotoMs = Math.max(...photoTimestamps);
            const photoPageSrc = path.join(process.cwd(), 'src/components/pages/PhotographyView.astro');
            const photoSrcDate = getGitCommitDate(photoPageSrc);
            if (photoSrcDate) {
              maxPhotoMs = Math.max(maxPhotoMs, new Date(photoSrcDate).getTime());
            }
            return new Date(maxPhotoMs).toISOString();
          }
        } catch {
          // fall through to source file mtime
        }
      }
    }

    // 3. Static or experience-only pages without `<time>` elements: map to backing source git commit time
    const cleanRoute = urlObj.pathname.replace(/^\/+|\/+$/g, '');
    if (cleanRoute.startsWith('tags/') && cleanRoute !== 'tags') {
      const tagBackingFiles = [
        path.join(process.cwd(), 'src/data/experiences.ts'),
        path.join(process.cwd(), 'src/pages/tags/[tag].astro'),
      ];
      let maxMs = 0;
      for (const f of tagBackingFiles) {
        const dateStr = getGitCommitDate(f);
        if (dateStr) {
          const ms = new Date(dateStr).getTime();
          if (ms > maxMs) maxMs = ms;
        }
      }
      if (maxMs > 0) return new Date(maxMs).toISOString();
    }

    const candidates = cleanRoute
      ? [
          path.join(process.cwd(), 'src/pages', `${cleanRoute}.astro`),
          path.join(process.cwd(), 'src/pages', cleanRoute, 'index.astro'),
        ]
      : [path.join(process.cwd(), 'src/pages/index.astro')];

    for (const srcCandidate of candidates) {
      const dateStr = getGitCommitDate(srcCandidate);
      if (dateStr) return dateStr;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

