import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

export type SanityImageValue = {
  asset?: {
    _id?: string | null;
    url?: string | null;
    metadata?: {
      lqip?: string | null;
      dimensions?: { width?: number | null; height?: number | null } | null;
    } | null;
  } | null;
  alt?: string | null;
  hotspot?: { x?: number; y?: number } | null;
  crop?: unknown;
} | null;

type SanityImageProps = {
  value: SanityImageValue;
  /** Rendered width in px (also drives the srcset). */
  width?: number;
  /** Rendered height in px. Derived from asset aspect ratio if omitted. */
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Override the alt text from the CMS (e.g. decorative → ""). */
  alt?: string;
};

/**
 * Renders a Sanity image via next/image + the custom CDN loader.
 * Reconstructs the asset ref so hotspot/crop are respected by the URL builder.
 */
export function SanityImage({
  value,
  width = 1200,
  height,
  sizes,
  priority,
  className,
  alt,
}: SanityImageProps) {
  const assetId = value?.asset?._id;
  if (!value || !assetId) return null;

  const dims = value.asset?.metadata?.dimensions;
  const aspect = dims?.width && dims?.height ? dims.height / dims.width : 2 / 3;
  const resolvedHeight = height ?? Math.round(width * aspect);

  // Base CDN URL only (keeps hotspot/crop). Width/quality/format are appended by
  // the custom loader so next/image can emit a responsive srcset.
  const src = urlFor({
    asset: { _ref: assetId },
    hotspot: value.hotspot ?? undefined,
    crop: value.crop ?? undefined,
  }).url();

  const lqip = value.asset?.metadata?.lqip ?? undefined;

  return (
    <Image
      className={className}
      src={src}
      alt={alt ?? value.alt ?? ''}
      width={width}
      height={resolvedHeight}
      sizes={sizes}
      priority={priority}
      placeholder={lqip ? 'blur' : 'empty'}
      blurDataURL={lqip}
    />
  );
}
