import { DragScrollbar } from '../DragScrollbar/DragScrollbar';
import { SanityImage, type SanityImageValue } from '../SanityImage/SanityImage';
import type { CSSProperties } from 'react';
import styles from './Gallery.module.css';

export type GalleryPhoto = SanityImageValue & { _key: string };

type GalleryProps = {
  images?: readonly GalleryPhoto[] | null;
  /** Extra class on the scroll wrapper (spacing overrides). */
  className?: string;
};

/**
 * Full-bleed horizontally scrollable photo strip with the shared drag scrollbar.
 * Used by the exhibition page and by the page-builder gallery block; both render
 * it inside a full-width container without inner padding.
 */
export function Gallery({ images, className }: GalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <DragScrollbar
      className={[styles.galleryBlock, 'reveal-media', className].filter(Boolean).join(' ')}
    >
      <ul className={styles.list}>
        {images.map((photo, i) => (
          // Photos dither in one after another, left to right.
          <li
            key={photo._key}
            className={styles.photo}
            style={{ '--media-order': Math.min(i, 5) } as CSSProperties}
          >
            {/* Width is intrinsic (height-driven), so the sizes hint is the widest
                a photo can get: strip height × a wide landscape ratio. */}
            <SanityImage value={photo} width={1000} sizes="(max-width: 700px) 90vw, 960px" />
          </li>
        ))}
      </ul>
    </DragScrollbar>
  );
}
