import { SanityImage, type SanityImageValue } from '../SanityImage/SanityImage';
import styles from './CoverImage.module.css';

type CoverImageProps = {
  value: SanityImageValue;
  /** top = fades downward (page header) · bottom = fades upward (above footer). */
  placement?: 'top' | 'bottom';
  priority?: boolean;
  className?: string;
};

/**
 * Cover image with a fade-out gradient. Used at the top and bottom of pages.
 * The dithering effect (Blok 6) will attach to the `data-dither` element.
 */
export function CoverImage({
  value,
  placement = 'top',
  priority,
  className,
}: CoverImageProps) {
  if (!value?.asset?._id) return null;

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
      <div className={styles.gradient} aria-hidden="true" />
    </div>
  );
}
