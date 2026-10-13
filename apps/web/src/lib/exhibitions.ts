import type { EXHIBITIONS_QUERYResult } from '@/sanity/types.generated';

export type ExhibitionCard = EXHIBITIONS_QUERYResult[number];

export type ExhibitionCategory = 'active' | 'upcoming' | 'past';

/**
 * Category of an exhibition — set manually in the CMS (`status`):
 *  - upcoming: not yet running
 *  - active:   currently running (gets the "Aktuálne" tag)
 *  - past:     already ended
 * Documents without a status (not yet migrated) fall back to their date range
 * relative to `today`.
 */
export function categorize(
  exhibition: Pick<ExhibitionCard, 'status' | 'startDate' | 'endDate'>,
  today: Date = new Date(),
): ExhibitionCategory {
  const { status, startDate, endDate } = exhibition;
  if (status) return status;

  const now = today.toISOString().slice(0, 10); // YYYY-MM-DD

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

  // The query orders by end date, newest first; upcoming ones read the other
  // way round: the nearest start on top, undated ones last.
  upcoming.sort((a, b) =>
    (a.startDate ?? '9999').localeCompare(b.startDate ?? '9999'),
  );

  return { active, upcoming, past };
}
