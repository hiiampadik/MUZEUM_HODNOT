import type { SanityImageValue } from '../SanityImage/SanityImage';
import { Dither } from '../Dither/Dither';
import { urlFor } from '@/sanity/lib/image';
import styles from './CoverImage.module.css';

type CoverImageProps = {
  value: SanityImageValue;
  /** top = fades downward (page header) · bottom = fades upward (above footer). */
  placement?: 'top' | 'bottom';
  priority?: boolean;
  /** Render as an absolutely-positioned background layer behind page content. */
  background?: boolean;
  className?: string;
};

/**
 * Cover image with a fade-out gradient + dithering (Blok 6).
 * `Dither` renders the plain <img> (instant fallback) and a dithered <canvas>
 * over it, both driven by the same single image request. With `background` the
 * whole cover sits behind page content (blended, non-interactive).
 */
export function CoverImage({
  value,
  placement = 'top',
  priority,
  background,
  className,
}: CoverImageProps) {
  const assetId = value?.asset?._id;
  if (!assetId) return null;

  const src = urlFor({
    asset: { _ref: assetId },
    hotspot: value?.hotspot ?? undefined,
    crop: value?.crop ?? undefined,
  })
    .width(1800)
    .auto('format')
    .url();

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
      data-dither
    >
      <Dither
        src={src}
        alt={background ? '' : (value?.alt ?? '')}
        priority={priority}
        placement={placement}
        imgClassName={styles.image}
        canvasClassName={styles.ditherCanvas}
      />
      <div className={styles.gradient} aria-hidden="true" />
    </div>
  );
}
