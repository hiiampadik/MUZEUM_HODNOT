import { Label, Text, Title, Underline } from '../Typography/Typography';
import type { ExhibitionSummary } from '@/lib/exhibitions';
import styles from './Exhibitions.module.css';

/** Plain exhibition row (year, place, title, summary) for one without a detail page. */
export function ExhibitionRow({ exhibition }: { exhibition: ExhibitionSummary }) {
  const year = exhibition.startDate?.slice(0, 4);
  const { place, summary } = exhibition;
  return (
    <div className={`${styles.row} reveal`}>
      <div>
        {year && <Label as="p">{year}</Label>}
        {place && <Label as="p">{place}</Label>}
        <Title as="h3">
          <Underline>{exhibition.title}</Underline>
        </Title>
      </div>
      {summary && <Text className={styles.excerpt}>{summary}</Text>}
    </div>
  );
}
