/**
 * Shared photography image registry (`photoImages.ts`)
 *
 * Single `import.meta.glob` over `src/images/photography/` used by the gallery,
 * photo permalinks, homepage carousel, Picture Log stream, and tag archives.
 * Keys are absolute Vite paths (`/src/images/photography/<filename>`), matching
 * `PictureLog.imageKey`.
 */
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { isFeatureEnabled } from './features';

export const PHOTO_FULL_QUALITY = 80;
export const PHOTO_RESPONSIVE_WIDTHS = [320, 480, 640, 960] as const;

export interface ResponsivePhotoImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

export const PHOTO_DIR_KEY = '/src/images/photography/';

const rawPhotoImageModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/images/photography/*.{jpg,jpeg,png,webp}',
);

export const photoImageModules: Record<string, () => Promise<{ default: ImageMetadata }>> =
  isFeatureEnabled('photography') ? rawPhotoImageModules : {};

/** All photo image keys (`/src/images/photography/<filename>`), unsorted. */
export const photoImageKeys: string[] = Object.keys(photoImageModules);

/** Total number of photographs on disk. */
export const photoCount = photoImageKeys.length;

/** Builds the glob key for a photo filename (accepts an existing key unchanged). */
export function toPhotoKey(filenameOrKey: string): string {
  return filenameOrKey.startsWith(PHOTO_DIR_KEY) ? filenameOrKey : `${PHOTO_DIR_KEY}${filenameOrKey}`;
}

/** Lazily resolves a photo's `ImageMetadata` by filename or glob key, or `null` if missing. */
export async function loadPhotoImage(filenameOrKey: string): Promise<ImageMetadata | null> {
  const importer = photoImageModules[toPhotoKey(filenameOrKey)];
  return importer ? (await importer()).default : null;
}

const photoVariantCache = new Map<string, ReturnType<typeof getImage>>();

function getPhotoVariant(imgMeta: ImageMetadata, width: number) {
  const key = `${imgMeta.src}:${width}`;
  let cached = photoVariantCache.get(key);
  if (!cached) {
    cached = getImage({
      src: imgMeta,
      width,
      format: 'webp',
      quality: PHOTO_FULL_QUALITY,
    });
    photoVariantCache.set(key, cached);
  }
  return cached;
}

/**
 * Generates the canonical full-resolution WebP asset for a photograph at `PHOTO_FULL_QUALITY`.
 * Shared across `/photography/[id]/`, `/photography/` lightbox links, and image sitemaps.
 */
export async function getCanonicalPhotoImage(imgMeta: ImageMetadata) {
  return await getPhotoVariant(imgMeta, imgMeta.width);
}

/**
 * Generates responsive WebP `srcset` entries plus the canonical full-resolution `src`
 * for photography gallery cards and `/photography/[id]/` stage images.
 */
export async function getResponsivePhotoImage(
  imgMeta: ImageMetadata,
  options?: { maxWidth?: number; includeFullInSrcset?: boolean },
): Promise<ResponsivePhotoImage> {
  const canonical = await getCanonicalPhotoImage(imgMeta);
  const widths = PHOTO_RESPONSIVE_WIDTHS.filter(
    (w) => w < imgMeta.width && (options?.maxWidth == null || w <= options.maxWidth),
  );
  const entries = await Promise.all(
    widths.map(async (w) => {
      const res = await getPhotoVariant(imgMeta, w);
      return `${res.src} ${w}w`;
    }),
  );
  const includeFull = Boolean(options?.includeFullInSrcset) || entries.length === 0;
  const srcset = (includeFull ? [...entries, `${canonical.src} ${imgMeta.width}w`] : entries).join(
    ', ',
  );
  return {
    src: canonical.src,
    srcset,
    width: imgMeta.width,
    height: imgMeta.height,
  };
}

/**
 * Generates responsive WebP `srcset` entries plus the canonical full-resolution `src`
 * for the `/photography/[id]/` stage `<img>`.
 */
export async function getCanonicalPhotoStage(imgMeta: ImageMetadata) {
  return getResponsivePhotoImage(imgMeta, { includeFullInSrcset: true });
}
