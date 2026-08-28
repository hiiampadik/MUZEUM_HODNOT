import { Link } from '../Link/Link';
import { SanityImage } from '../SanityImage/SanityImage';
import { Title, Text } from '../Typography/Typography';
import { routes } from '@/lib/routes';
import { formatDateRange } from '@/lib/format';
import type { ExhibitionCard as ExhibitionCardData } from '@/lib/exhibitions';
import { common } from '@/lib/strings';
import styles from './ExhibitionCard.module.css';

type Props = {
  exhibition: ExhibitionCardData;
  /** Show the "Aktuálne" tag (active exhibitions). */
  active?: boolean;
  /** Compact = upcoming/past (basic info only). */
  compact?: boolean;
};

export function ExhibitionCard({ exhibition, active, compact }: Props) {
  const { title, place, slug, startDate, endDate, canOpenDetail, cover } = exhibition;
  const linkable = canOpenDetail && slug;

  const inner = (
    <article className={styles.card}>
      {active && <span className={styles.tag}>{common.currentTag}</span>}
      {!compact && cover?.asset?._id && (
        <div className={styles.media}>
          <SanityImage value={cover} width={800} sizes="(max-width: 768px) 100vw, 400px" />
        </div>
      )}
      <div>
        <Title as="h3">{title}</Title>
        {place && <Text className={styles.meta}>{place}</Text>}
        <Text className={styles.meta}>{formatDateRange(startDate, endDate)}</Text>
      </div>
    </article>
  );

  if (linkable) {
    return <Link href={routes.exhibition(slug)}>{inner}</Link>;
  }
  return inner;
}
