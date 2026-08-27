import { SanityImage, type SanityImageValue } from '../SanityImage/SanityImage';
import { Dither } from '../Dither/Dither';
import { urlFor } from '@/sanity/lib/image';
import styles from './CoverImage.module.css';

type CoverImageProps = {
  value: SanityImageValue;
  /** top = fades downward (page header) · bottom = fades upward (above footer). */
  placement?: 'top' | 'bottom';
  priority?: boolean;
  className?: string;
};

/**
 * Cover image with a fade-out gradient + dithering (Blok 6).
 * The plain <img> is the SSR/no-JS fallback; the dithered <canvas> layers on top.
 */
export function CoverImage({
  value,
  placement = 'top',
  priority,
  className,
}: CoverImageProps) {
  const assetId = value?.asset?._id;
  if (!assetId) return null;

  const ditherSrc = urlFor({
    asset: { _ref: assetId },
    hotspot: value?.hotspot ?? undefined,
    crop: value?.crop ?? undefined,
  })
    .width(1400)
    .auto('format')
    .url();

  return (
    <div
      className={[styles.cover, styles[placement], className]
        .filter(Boolean)
        .join(' ')}
      data-dither
    >
      <SanityImage
        value={value}
        width={2000}
        sizes="100vw"
        priority={priority}
        className={styles.image}
      />
      <Dither src={ditherSrc} className={styles.ditherCanvas} />
      <div className={styles.gradient} aria-hidden="true" />
    </div>
  );
}
