import type { SanityImageValue } from '../SanityImage/SanityImage';
import { Dither } from '../Dither/Dither';
import styles from './CoverImage.module.css';

type PreviewCover = { src: string; aspectRatio: string };

/**
 * TEMP: every page uses these shared covers (photos fading to white — the top
 * one downward, the bottom one upward, in public/covers/) instead of the ones
 * from Sanity. Set to null to use the CMS covers again; those then need the
 * site's origin on the Sanity CORS allow-list, or Dither falls back to the
 * plain image.
 */
const PREVIEW_COVERS: Record<'top' | 'bottom', PreviewCover> | null = {
  top: { src: '/covers/top.jpg', aspectRatio: '1800 / 1055' },
  bottom: { src: '/covers/bottom.jpg', aspectRatio: '1800 / 1055' },
};

type CoverImageProps = {
  value: SanityImageValue;
  /** top = header cover · bottom = cover above the footer. */
  placement?: 'top' | 'bottom';
  priority?: boolean;
  /** Render as an absolutely-positioned background layer behind page content. */
  background?: boolean;
  /** Pointer trail on the dither (desktop only, see Dither). */
  interactive?: boolean;
  className?: string;
};

/**
 * Full-bleed cover image at the top / bottom of a page, dithered live in the
 * browser (see Dither) and melting into the page background. The source is the
 * original, unscaled asset — it's resampled to the dither grid anyway. Top
 * covers fade out at their bottom edge, bottom covers at their top edge.
 */
export function CoverImage({
  value,
  placement = 'top',
  priority,
  background,
  interactive,
  className,
}: CoverImageProps) {
  // Original, unscaled asset URL — do not run it through the resizing loader.
  const preview = PREVIEW_COVERS?.[placement];
  const src = preview?.src ?? value?.asset?.url;
  if (!src) return null;
  const dimensions = value?.asset?.metadata?.dimensions;
  const aspectRatio =
    preview?.aspectRatio ??
    (dimensions?.width && dimensions?.height
      ? `${dimensions.width} / ${dimensions.height}`
      : undefined);

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
