import type { SanityImageValue } from '../SanityImage/SanityImage';
// Dithering is disabled — covers are uploaded as ready-made images (any fade is
// baked into the file). Kept for easy re-enable. See Dither.tsx.
// import { Dither } from '../Dither/Dither';
import styles from './CoverImage.module.css';

type CoverImageProps = {
  value: SanityImageValue;
  /** top = header cover · bottom = cover above the footer. */
  placement?: 'top' | 'bottom';
  priority?: boolean;
  /** Render as an absolutely-positioned background layer behind page content. */
  background?: boolean;
  className?: string;
};

/**
 * Full-bleed cover image at the top / bottom of a page.
 *
 * The image is served in its ORIGINAL size (the raw asset URL — no CDN resizing
 * or re-encoding) and stretched to the container's edges via CSS. Covers are
 * prepared and uploaded manually, so no gradient or dithering is applied here.
 */
export function CoverImage({
  value,
  placement = 'top',
  priority,
  background,
  className,
}: CoverImageProps) {
  // Original, unscaled asset URL — do not run it through the resizing loader.
  const src = value?.asset?.url;
  if (!src) return null;

  return (
    <div
      className={[
        styles.cover,
        styles[placement],
        background && styles.background,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={background ? '' : (value?.alt ?? '')}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={styles.image}
      />
      {/*
      <Dither
        src={src}
        alt={background ? '' : (value?.alt ?? '')}
        priority={priority}
        placement={placement}
        imgClassName={styles.image}
        canvasClassName={styles.ditherCanvas}
      />
      <div className={styles.gradient} aria-hidden="true" />
      */}
    </div>
  );
}
