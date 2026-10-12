import type { SanityImageValue } from '../SanityImage/SanityImage';
import { Dither } from '../Dither/Dither';
import styles from './CoverImage.module.css';

type Placement = 'top' | 'bottom';

/**
 * Shared covers (photos fading to white — the top one downward, the bottom one
 * upward) used when a page has no cover of its own in Sanity.
 */
const FALLBACK_COVERS: Record<Placement, { src: string; aspectRatio: string }> = {
  top: { src: '/covers/top.webp', aspectRatio: '1600 / 938' },
  bottom: { src: '/covers/bottom.webp', aspectRatio: '1600 / 938' },
};

/**
 * Width requested from the Sanity CDN, in px. Dither resamples the image to its
 * grid (viewport width / DITHER_CELL_SIZE), so with 2px cells this stays 1:1 up
 * to a 3200px-wide viewport. Raise it if the cell size goes down.
 */
const COVER_SOURCE_WIDTH = 1600;
/** Above the CDN default: dithering makes compression artefacts in the fade visible. */
const COVER_SOURCE_QUALITY = 85;

type CoverImageProps = {
  /** Cover from Sanity; the shared fallback cover is used when it has no image. */
  value?: SanityImageValue;
  /** top = header cover · bottom = cover above the footer. */
  placement?: Placement;
  priority?: boolean;
  /** Render as an absolutely-positioned background layer behind page content. */
  background?: boolean;
  /** Pointer trail on the dither (desktop only, see Dither). On by default. */
  interactive?: boolean;
  className?: string;
};

/**
 * Full-bleed cover image at the top / bottom of a page, dithered live in the
 * browser (see Dither) and melting into the page background. The Sanity
 * asset is capped at COVER_SOURCE_WIDTH by the CDN (never upscaled) — it's
 * resampled to the dither grid anyway. Top covers fade out at their bottom edge, bottom covers at their top
 * edge. Pages without a cover in Sanity get the shared one from public/covers/.
 * The site's origin must be on the Sanity CORS allow-list, or Dither shows the
 * plain image instead of dithering a Sanity cover.
 */
export function CoverImage({
  value,
  placement = 'top',
  priority,
  background,
  interactive = true,
  className,
}: CoverImageProps) {
  const fallback = FALLBACK_COVERS[placement];
  const assetUrl = value?.asset?.url;
  // One fixed size straight from the CDN — not the responsive next/image loader.
  const src = assetUrl
    ? `${assetUrl}?w=${COVER_SOURCE_WIDTH}&q=${COVER_SOURCE_QUALITY}&auto=format&fit=max`
    : fallback.src;
  const dimensions = value?.asset?.metadata?.dimensions;
  const aspectRatio =
    assetUrl && dimensions?.width && dimensions?.height
      ? `${dimensions.width} / ${dimensions.height}`
      : assetUrl
        ? undefined
        : fallback.aspectRatio;

  return (
    <div
      className={[
        styles.cover,
        styles[placement],
        background && styles.background,
        // The bottom cover sits far down the page: fade it in when it scrolls
        // into view instead of on load (see `.reveal` in globals.css).
        placement === 'bottom' && 'reveal reveal--fade',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Dither
        src={src}
        alt={background ? '' : (value?.alt ?? '')}
        priority={priority}
        aspectRatio={aspectRatio}
        fadeEdge={placement === 'bottom' ? 'top' : 'bottom'}
        interactive={interactive}
        className="cover-media"
      />
    </div>
  );
}
