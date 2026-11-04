import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage, computeOgCacheKey, type OgImageProps } from '../../utils/generateOgImage';
import { getReadingTime } from '../../utils/readingTime';
import { getExcerpt } from '../../utils/excerpt';
import { getChangelogEntries } from '../../utils/changelog';
import { getTagTaxonomy } from '../../utils/tagTaxonomy';
import { isHardLinkedTag } from '../../utils/tagHref';
import { pictureLogs } from '../../utils/pictureLogs';
import { siteConfig } from '../../site.config';

export const prerender = true;

interface StaticPathEntry {
  params: { slug: string };
  props: OgImageProps;
  cacheKey: string;
}

export async function getStaticPaths() {
  const paths: StaticPathEntry[] = [];

  // 1. Blog Posts
  const allPosts = await getCollection('blog');
  for (const post of allPosts) {
    const props: OgImageProps = {
      badge: 'Engineering Article',
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      updatedDate: post.data.updatedDate,
      readingTime: getReadingTime(post.body),
      tags: post.data.tags || [],
      theme: 'cyan',
    };
    paths.push({
      params: { slug: `blog/${post.id}` },
      props,
      cacheKey: computeOgCacheKey(props),
    });
  }

  // 2. Status-Updates from src/content/log/
  const allLogs = await getCollection('log');
  for (const log of allLogs) {
    const slug = log.id.replace(/\.[^/.]+$/, '');
    const props: OgImageProps = {
      badge: 'Status-Update',
      title: log.data.title,
      description: getExcerpt(log.body ?? "", 170),
      pubDate: log.data.date,
      tags: log.data.tags || [],
      theme: 'amber',
    };
    paths.push({
      params: { slug: `log/${slug}` },
      props,
      cacheKey: computeOgCacheKey(props),
    });
  }

  // 2b. Changelog entries (single source of truth from CHANGELOG.md)
  const changelogEntries = await getChangelogEntries();
  for (const cl of changelogEntries) {
    const props: OgImageProps = {
      badge: 'Changelog',
      title: cl.title,
      description: getExcerpt(cl.rawMarkdown, 170),
      pubDate: cl.date,
      tags: cl.tags || [],
      theme: 'amber',
    };
    paths.push({
      params: { slug: `log/${cl.id}` },
      props,
      cacheKey: computeOgCacheKey(props),
    });
  }

  // 3. Unique Topic / Tag Archives
  const { archiveMap } = await getTagTaxonomy();
  for (const [tagSlug, data] of archiveMap.entries()) {
    if (isHardLinkedTag(tagSlug)) continue;
    const tag = data.tagName;
    const props: OgImageProps = {
      badge: 'Topic Archive',
      title: `#${tag}`,
      description: `Explore engineering write-ups, homelab notes, career experience, and photography topics on #${tag} by ${siteConfig.author.name}.`,
      tags: [tag],
      theme: 'violet',
    };
    paths.push({
      params: { slug: `tags/${tagSlug}` },
      props,
      cacheKey: computeOgCacheKey(props),
    });
  }

  // 4. Core Static Pages
  const corePages: Record<string, OgImageProps> = {
    home: {
      badge: siteConfig.author.jobTitle,
      title: `${siteConfig.author.name} — Systems, Homelab & Cloud`,
      description: siteConfig.site.description,
      tags: ['Infrastructure', 'Reliability', 'Linux', 'AWS'],
      theme: 'amber',
    },
    about: {
      badge: 'Profile & Background',
      title: `About ${siteConfig.author.name}`,
      description: 'Infrastructure and reliability engineer with over a decade scaling carrier-grade email security platforms, enterprise hardware escalations, and cloud architecture in Japan.',
      tags: ['Engineering', 'Reliability', 'Career', 'Japan'],
      theme: 'indigo',
    },
    now: {
      badge: 'Living Snapshot',
      title: 'What I’m Doing Now — /now',
      description: 'A living snapshot of where I am in Japan, what I am building in the homelab, and what is occupying my time and engineering attention.',
      tags: ['Now', 'Homelab', 'Projects', 'Japan'],
      theme: 'emerald',
    },
    log: {
      badge: 'Stream • Changelogs, Status-Updates & Photo Rolls',
      title: 'Log Stream & Status-Updates',
      description: 'A chronological stream of status-updates, site changelogs, and everyday discoveries.',
      tags: ['Changelogs', 'Status-Updates', 'Photo Rolls'],
      theme: 'amber',
    },
    blog: {
      badge: 'Engineering Articles',
      title: 'From the Blog — Technical Deep-Dives',
      description: 'Notes from the homelab: carrier-grade email deliverability, AWS Multi-Region Access Points, Proxmox virtualization, and AI-assisted workflows.',
      tags: ['Architecture', 'AWS', 'Email', 'AI'],
      theme: 'cyan',
    },
    photography: {
      badge: 'Visual Gallery',
      title: 'Photography Roll — Moments & Landscapes',
      description: `Moments, textures, and architecture captured through the lens across Japan, the Aegean, and Europe by ${siteConfig.author.name}.`,
      tags: ['Photography', 'Japan', 'Architecture'],
      theme: 'fuchsia',
    },
    contact: {
      badge: 'Direct Connect',
      title: `Get in Touch — ${siteConfig.author.name}`,
      description: 'Reach out for conversations on infrastructure resilience, carrier-grade mail delivery, or general engineering inquiries.',
      tags: ['Contact', 'Email', 'Japan'],
      theme: 'blue',
    },
    tags: {
      badge: 'Topic Directory',
      title: 'Topics & Taxonomy',
      description: 'Explore articles, status updates, career experience, and photos by technology, location, and theme.',
      tags: ['Topics', 'Tags', 'Index'],
      theme: 'violet',
    },
    default: {
      badge: siteConfig.author.jobTitle,
      title: `${siteConfig.author.name} — ${siteConfig.site.domain}`,
      description: siteConfig.site.description,
      tags: ['Infrastructure', 'Reliability', 'Japan'],
      theme: 'amber',
    },
  };

  for (const [pageSlug, props] of Object.entries(corePages)) {
    paths.push({
      params: { slug: pageSlug },
      props,
      cacheKey: computeOgCacheKey(props),
    });
  }

  // 5. Individual Photographs (/og/photography/[id].png)
  for (const photo of pictureLogs) {
    const props: OgImageProps = {
      badge: `Photograph #${photo.id}`,
      title: photo.title,
      description: photo.story ? `${photo.location} — ${photo.story}` : photo.location,
      pubDate: photo.pubDate,
      tags: photo.tags || ['Photography'],
      ctaText: 'View Photo',
      photoFilename: photo.filename,
      theme: 'fuchsia',
    };
    paths.push({
      params: { slug: `photography/${photo.id}` },
      props,
      cacheKey: computeOgCacheKey(props),
    });
  }

  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  try {
    const pngBuffer = await generateOgImage(props as OgImageProps);
    return new Response(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Failed to generate OG image:', error);
    return new Response('Failed to generate OG image', { status: 500 });
  }
};

