import type { CollectionEntry } from 'astro:content';
import { getReadingTime } from './readingTime';

export interface RelatedPostItem {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  readingTime: string;
  sharedTags: string[];
}

export interface SeriesPostItem {
  id: string;
  title: string;
  partNumber: number;
  isCurrent: boolean;
}

export interface PostSeriesContext {
  name: string;
  currentPart: number;
  totalParts: number;
  items: SeriesPostItem[];
}

/**
 * Builds ordered multi-part series navigation context for a blog post.
 * Returns `null` when the post has no `series` or fewer than 2 posts belong to it.
 */
export function getPostSeriesContext(
  currentPost: CollectionEntry<'blog'>,
  allPosts: CollectionEntry<'blog'>[]
): PostSeriesContext | null {
  const seriesName = currentPost.data.series;
  if (!seriesName) {
    return null;
  }

  const matchingPosts = allPosts
    .filter((p) => p.data.series === seriesName)
    .sort((a, b) => {
      const orderDiff =
        (a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER);
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
    });

  if (matchingPosts.length < 2) {
    return null;
  }

  const items: SeriesPostItem[] = matchingPosts.map((p, idx) => ({
    id: p.id,
    title: p.data.title,
    partNumber: idx + 1,
    isCurrent: p.id === currentPost.id,
  }));

  const currentItem = items.find((item) => item.isCurrent);

  return {
    name: seriesName,
    currentPart: currentItem?.partNumber ?? 1,
    totalParts: items.length,
    items,
  };
}

/**
 * Computes up to `limit` related blog posts using IDF-weighted tag similarity
 * so niche technical tags outweigh broad editorial tags, padding with recent
 * posts when fewer than `limit` candidates share tags.
 */
export function getRelatedPosts(
  currentPost: CollectionEntry<'blog'>,
  allPosts: CollectionEntry<'blog'>[],
  options?: { limit?: number; excludeIds?: Set<string> }
): RelatedPostItem[] {
  const limit = options?.limit ?? 3;
  if (limit <= 0) {
    return [];
  }

  // Count document frequency per lowercase tag so rare tags carry higher weight.
  const tagFreq = new Map<string, number>();
  for (const post of allPosts) {
    const uniqueTags = new Set(post.data.tags.map((t) => t.toLowerCase()));
    for (const tagLower of uniqueTags) {
      tagFreq.set(tagLower, (tagFreq.get(tagLower) ?? 0) + 1);
    }
  }

  const currentTagsLower = new Set(currentPost.data.tags.map((t) => t.toLowerCase()));

  interface ScoredCandidate {
    post: CollectionEntry<'blog'>;
    score: number;
    sharedTags: string[];
  }

  const scoredAll: ScoredCandidate[] = [];

  for (const candidate of allPosts) {
    if (candidate.id === currentPost.id) {
      continue;
    }

    let score = 0;
    const matched: Array<{ tag: string; weight: number }> = [];
    const seenMatched = new Set<string>();

    for (const rawTag of candidate.data.tags) {
      const tagLower = rawTag.toLowerCase();
      if (currentTagsLower.has(tagLower) && !seenMatched.has(tagLower)) {
        seenMatched.add(tagLower);
        const weight = 1 / Math.log2(1 + (tagFreq.get(tagLower) ?? 1));
        score += weight;
        matched.push({ tag: rawTag, weight });
      }
    }

    matched.sort((a, b) => b.weight - a.weight);

    scoredAll.push({
      post: candidate,
      score,
      sharedTags: matched.map((m) => m.tag),
    });
  }

  scoredAll.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.sharedTags.length !== a.sharedTags.length) {
      return b.sharedTags.length - a.sharedTags.length;
    }
    return b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf();
  });

  const excludeIds = options?.excludeIds;
  const primaryCandidates = excludeIds
    ? scoredAll.filter((item) => !excludeIds.has(item.post.id))
    : scoredAll;

  const selected = primaryCandidates.slice(0, limit);

  if (selected.length < limit && scoredAll.length > selected.length) {
    const selectedIds = new Set(selected.map((item) => item.post.id));
    const fallback = scoredAll.filter((item) => !selectedIds.has(item.post.id));
    selected.push(...fallback.slice(0, limit - selected.length));
  }

  return selected.map(({ post, sharedTags }) => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    readingTime: getReadingTime(post.body),
    sharedTags: sharedTags.slice(0, 3),
  }));
}
