import type { ImageLoaderProps } from 'next/image';

/**
 * Custom next/image loader for the static export.
 * `src` is a Sanity CDN base URL; we append width/quality/format params so the
 * CDN does the resizing (no Next.js optimization server exists in `output: export`).
 */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const sep = src.includes('?') ? '&' : '?';
  const q = quality || 75;
  return `${src}${sep}w=${width}&q=${q}&auto=format&fit=max`;
}
