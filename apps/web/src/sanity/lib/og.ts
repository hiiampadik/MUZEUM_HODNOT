import { urlFor } from './image';

type CoverLike = { asset?: { _id?: string | null } | null } | null | undefined;

/**
 * Build a 1200×630 Open Graph image URL from a Sanity cover/image, or null.
 * Forced to JPEG: sources may be AVIF/PNG, which social scrapers don't render.
 */
export function ogImageUrl(source: CoverLike): string | null {
  const id = source?.asset?._id;
  if (!id) return null;
  return urlFor({ asset: { _ref: id } })
    .width(1200)
    .height(630)
    .fit('crop')
    .format('jpg')
    .url();
}
