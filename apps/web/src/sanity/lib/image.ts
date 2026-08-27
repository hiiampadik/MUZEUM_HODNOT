import createImageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { dataset, projectId } from '../env';

const builder = createImageUrlBuilder({ projectId, dataset });

/** Build an optimized Sanity CDN URL for an image source (respects hotspot/crop). */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
