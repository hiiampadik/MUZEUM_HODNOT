import type { CSSProperties } from 'react';
import { Container } from '../Container/Container';
import { Title } from '../Typography/Typography';
import type { ExhibitionSummary } from '@/lib/exhibitions';
import { accents } from '@/lib/routes';
import { ExhibitionCard } from './ExhibitionCard';
import { ExhibitionRow } from './ExhibitionRow';
import styles from './Exhibitions.module.css';

type ExhibitionSectionProps = {
  title: string;
  exhibitions: ExhibitionSummary[];
  /**
   * cards = every exhibition as a card · mixed = cards only for exhibitions
   * with a detail page, the rest as plain rows separated by dashed lines.
   */
  layout?: 'cards' | 'mixed';
  /** Anchor target for in-page links. */
  id?: string;
};

/**
 * Titled list of exhibitions in the exhibition accent. Renders nothing when
 * the list is empty.
 */
export function ExhibitionSection({
  title,
  exhibitions,
  layout = 'cards',
  id,
}: ExhibitionSectionProps) {
  if (exhibitions.length === 0) return null;

  return (
    <Container
      as="section"
      id={id}
      className={styles.section}
      style={{ '--accent': accents.exhibition } as CSSProperties}
    >
      <Title as="h2" underline className={`${styles.sectionTitle} reveal`}>
        {title}
      </Title>
      <div className={layout === 'mixed' ? styles.mixedList : styles.cardList}>
        {exhibitions.map((exhibition) =>
          layout === 'cards' || (exhibition.canOpenDetail && exhibition.slug) ? (
            <ExhibitionCard key={exhibition._id} exhibition={exhibition} />
          ) : (
            <ExhibitionRow key={exhibition._id} exhibition={exhibition} />
          ),
        )}
      </div>
    </Container>
  );
}
