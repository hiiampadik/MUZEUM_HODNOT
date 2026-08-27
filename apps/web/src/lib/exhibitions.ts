import type { EXHIBITIONS_QUERYResult } from '@/sanity/types.generated';

export type ExhibitionCard = EXHIBITIONS_QUERYResult[number];

export type ExhibitionCategory = 'active' | 'upcoming' | 'past';

/**
 * Categorize an exhibition by its date range relative to `today`:
 *  - upcoming: starts in the future
 *  - active:   currently running (gets the "Aktuálne" tag)
 *  - past:     already ended
 */
export function categorize(
  exhibition: Pick<ExhibitionCard, 'startDate' | 'endDate'>,
  today: Date = new Date(),
): ExhibitionCategory {
  const now = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const { startDate, endDate } = exhibition;

  if (endDate && endDate < now) return 'past';
  if (startDate && startDate > now) return 'upcoming';
  return 'active';
}

/** Split a list of exhibitions into the three homepage groups. */
export function groupExhibitions(
  exhibitions: EXHIBITIONS_QUERYResult,
  today: Date = new Date(),
) {
  const active: ExhibitionCard[] = [];
  const upcoming: ExhibitionCard[] = [];
  const past: ExhibitionCard[] = [];

  for (const ex of exhibitions) {
    const category = categorize(ex, today);
    if (category === 'active') active.push(ex);
    else if (category === 'upcoming') upcoming.push(ex);
    else past.push(ex);
  }

  return { active, upcoming, past };
}
