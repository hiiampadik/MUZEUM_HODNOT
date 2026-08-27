/** Format an ISO date (YYYY-MM-DD) as DD.MM.YYYY. Returns '' for missing input. */
export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${Number(d)}.${Number(m)}.${y}`;
}

/** Format a date range; falls back gracefully if one end is missing. */
export function formatDateRange(start?: string | null, end?: string | null): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s} – ${e}`;
  return s || e;
}
