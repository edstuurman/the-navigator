import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_TITLE } from '../utils/consts';
import { getTagTaxonomy } from '../utils/tagTaxonomy';
import { tagHref } from '../utils/tagHref';
import { pictureLogs } from '../utils/pictureLogs';
import { siteConfig } from '../site.config';

/**
 * Machine-readable counterpart to `/llms.txt` and `/llms-full.txt`.
 * Built from the content collections at build time so it never drifts
 * out of sync with published articles, topics, or photography.
 */
export async function GET(context: APIContext) {
  const siteUrl = (context.site ? context.site.href : siteConfig.site.url).replace(/\/+$/, '');
  const abs = (path: string) => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const [posts, taxonomy] = await Promise.all([getCollection('blog'), getTagTaxonomy()]);

  const articles = posts
    .slice()
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post) => ({
      title: post.data.title,
      url: abs(`/blog/${post.id}/`),
      description: post.data.description,
      published: post.data.pubDate.toISOString(),
      updated: (post.data.updatedDate || post.data.pubDate).toISOString(),
      author: post.data.author || SITE_AUTHOR,
      tags: post.data.tags,
    }));

  const topics = taxonomy.sortedTags.map((tag) => ({
    name: tag.name,
    url: abs(tagHref(tag.slug)),
    counts: {
      total: tag.count,
      articles: tag.blogCount,
      log: tag.logCount,
      photos: tag.photoCount,
      career: tag.expCount,
    },
  }));

  const newestPhoto = pictureLogs.reduce<Date | null>(
    (latest, p) => (!latest || p.pubDate > latest ? p.pubDate : latest),
    null
  );

  const body = {
    $schema: abs('/llms.json'),
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: abs('/'),
    language: 'en',
    updated: articles[0]?.updated ?? null,
    owner: {
      name: SITE_AUTHOR,
      ...(siteConfig.author.alternateName ? { alternateName: siteConfig.author.alternateName } : {}),
      role: siteConfig.author.jobTitle,
      location: siteConfig.author.location,
      email: siteConfig.author.email,
      links: {
        website: abs('/'),
        ...siteConfig.socials,
      },
    },
    llmFiles: [
      {
        name: 'llms.txt',
        url: abs('/llms.txt'),
        type: 'text/markdown',
        description: 'Concise site overview and index of key pages, written for LLMs.',
      },
      {
        name: 'llms-full.txt',
        url: abs('/llms-full.txt'),
        type: 'text/markdown',
        description: 'Concatenated Markdown archive of profile and article content for ingestion and RAG.',
      },
      {
        name: 'llms.json',
        url: abs('/llms.json'),
        type: 'application/json',
        description: 'This file: structured index of pages, articles, topics, and feeds, generated at build time.',
      },
    ],
    feeds: {
      rss: abs('/rss.xml'),
      atom: abs('/atom.xml'),
      sitemap: abs('/sitemap-index.xml'),
    },
    pages: [
      { name: 'Home', url: abs('/'), description: 'Overview, featured photography, and recent articles.' },
      { name: 'About', url: abs('/about/'), description: 'Career history, homelab philosophy, and recommendations.' },
      { name: 'Now', url: abs('/now/'), description: 'What Ed is currently working on and focused on.' },
      { name: 'Log', url: abs('/log/'), description: 'Micro-updates, site changelogs, and photo rolls.' },
      { name: 'Blog', url: abs('/blog/'), description: 'Technical articles and homelab write-ups.' },
      { name: 'Photography', url: abs('/photography/'), description: 'Portfolio of landscape, architecture, and street photography.' },
      { name: 'Tags', url: abs('/tags/'), description: 'Cross-collection topic directory.' },
      { name: 'Contact', url: abs('/contact/'), description: 'How to get in touch.' },
    ],
    articles,
    topics,
    photography: {
      url: abs('/photography/'),
      count: pictureLogs.length,
      latest: newestPhoto ? newestPhoto.toISOString() : null,
    },
  };

  return new Response(JSON.stringify(body, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

