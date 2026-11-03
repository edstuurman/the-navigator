import crypto from 'node:crypto';
import type { CollectionEntry } from 'astro:content';

export type AdjacentPost = {
  id: string;
  title: string;
  description: string;
} | null;

/**
 * Computes a deterministic cache key for an individual blog post route.
 * Changes only when the post body, metadata, or adjacent navigation cards change.
 */
export function computeBlogCacheKey(
  post: CollectionEntry<'blog'>,
  nextPost: AdjacentPost,
  prevPost: AdjacentPost
): string {
  const hash = crypto.createHash('sha256');
  hash.update(post.id);
  hash.update(post.body || '');
  hash.update(post.data.title || '');
  hash.update(post.data.description || '');
  hash.update(String(post.data.pubDate?.valueOf() || ''));
  hash.update(String(post.data.updatedDate?.valueOf() || ''));
  hash.update((post.data.tags || []).join(','));
  hash.update(post.data.heroImage ? JSON.stringify(post.data.heroImage) : '');
  hash.update(
    JSON.stringify([
      post.data.showSections ?? null,
      post.data.sectionNav ?? null,
      post.data.sectionDepth ?? null,
      post.data.sections ?? null,
    ])
  );
  hash.update(nextPost ? `${nextPost.id}:${nextPost.title}` : 'none');
  hash.update(prevPost ? `${prevPost.id}:${prevPost.title}` : 'none');
  return hash.digest('hex');
}

