import crypto from 'node:crypto';
import type { PictureLog } from './pictureLogs';

export type AdjacentPhoto = {
  id: number;
  title: string;
  dateFormatted: string;
} | null;

/**
 * Computes a deterministic cache key for a static photograph permalink route (/photography/[id]/).
 * Changes only when the photograph metadata, narrative story, or adjacent links change.
 */
export function computePhotoCacheKey(
  photo: PictureLog,
  prevPhoto: AdjacentPhoto,
  nextPhoto: AdjacentPhoto
): string {
  const hash = crypto.createHash('sha256');
  hash.update(String(photo.id));
  hash.update(photo.filename);
  hash.update(photo.title);
  hash.update(String(photo.pubDate.valueOf()));
  hash.update(photo.category);
  hash.update(photo.location);
  hash.update(photo.story || '');
  hash.update((photo.tags || []).join(','));
  hash.update(prevPhoto ? `${prevPhoto.id}:${prevPhoto.title}` : 'none');
  hash.update(nextPhoto ? `${nextPhoto.id}:${nextPhoto.title}` : 'none');
  return hash.digest('hex');
}

