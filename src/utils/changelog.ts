import fs from 'node:fs';
import path from 'node:path';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { rehypeTechTooltips } from '../plugins/rehype-tech-tooltips.mjs';

export interface ChangelogEntry {
  kind: 'changelog';
  isChangelog: true;
  id: string;
  date: Date;
  dateFormatted?: string;
  title: string;
  tags: string[];
  html: string;
  rawMarkdown: string;
}

let cachedEntries: ChangelogEntry[] | null = null;

/**
 * Parses CHANGELOG.md as the single source of truth for site changelogs.
 */
export async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  if (cachedEntries) return cachedEntries;

  const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    return [];
  }

  const rawText = fs.readFileSync(changelogPath, 'utf-8');
  // Match `## [YYYY-MM-DD]` or `## [YYYY-MM-DD] - Title` or `## [v1.0.0] - YYYY-MM-DD`
  const sectionRegex = /^## \[([^\]]+)\](?:\s*[-–—]\s*(.+))?$/gm;
  const matches: { index: number; dateOrVersion: string; title?: string; raw: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = sectionRegex.exec(rawText)) !== null) {
    matches.push({
      index: m.index,
      dateOrVersion: m[1].trim(),
      title: m[2]?.trim(),
      raw: m[0],
    });
  }

  const processor = await createMarkdownProcessor({
    rehypePlugins: [rehypeTechTooltips],
  });
  const entries: ChangelogEntry[] = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const sectionBody = rawText
      .substring(current.index + current.raw.length, next ? next.index : undefined)
      .trim();

    if (!sectionBody) continue;

    // Detect if dateOrVersion is a YYYY-MM-DD or if the title contains the date
    let dateStr = current.dateOrVersion;
    let title = current.title;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) && title && /^\d{4}-\d{2}-\d{2}$/.test(title)) {
      // Swapped format: `## [1.0.0] - 2026-10-30`
      const tmp = dateStr;
      dateStr = title;
      title = tmp;
    }

    const date = new Date(`${dateStr}T12:00:00Z`);
    if (isNaN(date.getTime())) continue;

    // Determine title if not explicitly set
    if (!title) {
      const boldMatches = Array.from(sectionBody.matchAll(/-\s*\*\*([^*]+)\*\*/g)).map((b) => b[1].trim());
      if (boldMatches.length > 0) {
        title = boldMatches.slice(0, 3).join(', ');
        if (boldMatches.length > 3) title += ' & more';
      } else {
        title = `Site Update — ${dateStr}`;
      }
    }

    // Determine tags
    const tagsSet = new Set<string>();
    tagsSet.add('AstroJS');
    if (/Tailwind/i.test(sectionBody)) tagsSet.add('Tailwind CSS');
    if (/Design|UI|flare|visual|css|modal|theme|logo/i.test(sectionBody)) tagsSet.add('Design');
    if (/Infra|S3|AWS|analytics|pipeline|satori|exif|umami/i.test(sectionBody)) tagsSet.add('Infrastructure');
    if (/Photo|gallery|LightGallery/i.test(sectionBody)) tagsSet.add('Photography');
    if (/Performance|speed|optimization/i.test(sectionBody)) tagsSet.add('Performance');
    if (/Career|sabbatical/i.test(sectionBody)) tagsSet.add('Career');

    // 1. Rewrite any page source links to valid live site URLs
    let cleanedMarkdown = sectionBody
      .replace(/\(src\/pages\/index\.astro\)/g, '(/)')
      .replace(/\(src\/pages\/([a-z0-9_-]+)\/index\.astro\)/g, '(/$1/)')
      .replace(/\(src\/pages\/([a-z0-9_-]+)\.astro\)/g, '(/$1/)');

    // 2. Strip / sanitize any local source file links so they never render as broken links in dist:
    // Any markdown link pointing to src/ or code files (.ts, .astro, .css, .mjs, .md, etc.) is unwrapped to code.
    cleanedMarkdown = cleanedMarkdown
      .replace(
        /\[`?([^\]`]+)`?\]\((?!https?:\/\/|mailto:|\/)[^)]*(?:src\/|[a-zA-Z0-9_-]+\.(?:astro|ts|js|mjs|css|json|md|py))\)/g,
        '`$1`'
      )
      .replace(/\[`?([^\]`]+)`?\]\(\/?src\/[^)]+\)/g, '`$1`');

    const rendered = await processor.render(cleanedMarkdown);

    entries.push({
      kind: 'changelog',
      isChangelog: true,
      id: `changelog-${dateStr}`,
      date,
      title,
      tags: Array.from(tagsSet),
      html: rendered.code,
      rawMarkdown: sectionBody,
    });
  }

  // Sort descending by date
  entries.sort((a, b) => b.date.valueOf() - a.date.valueOf());
  cachedEntries = entries;
  return entries;
}

