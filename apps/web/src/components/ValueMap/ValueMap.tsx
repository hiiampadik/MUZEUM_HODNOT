import { SanityImage, type SanityImageValue } from '../SanityImage/SanityImage';
import { RichText } from '../RichText/RichText';
import { Link } from '../Link/Link';
import { Title } from '../Typography/Typography';
import styles from './ValueMap.module.css';

export type MapPointData = {
  _key: string;
  title: string | null;
  location?: { lat?: number | null; lng?: number | null } | null;
  image?: SanityImageValue;
  text?: readonly unknown[] | null;
  link?: { label?: string | null; href?: string | null } | null;
};

/**
 * Placeholder for the interactive map (real MapLibre + clustering lands in Blok 6).
 * For now it renders the points as an accessible list, which also serves as the
 * no-JS / reduced-motion fallback.
 */
export function ValueMap({ points }: { points: readonly MapPointData[] }) {
  if (!points || points.length === 0) return null;

  return (
    <div className={styles.wrap} data-map-points>
      <ul className={styles.list}>
        {points.map((point) => (
          <li key={point._key} className={styles.point}>
            {point.image?.asset?._id && (
              <div className={styles.media}>
                <SanityImage value={point.image} width={480} sizes="240px" />
              </div>
            )}
            <div>
              <Title as="h3">{point.title}</Title>
              <RichText value={point.text} />
              {point.link?.href && (
                <Link href={point.link.href}>{point.link.label || 'Viac'}</Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
