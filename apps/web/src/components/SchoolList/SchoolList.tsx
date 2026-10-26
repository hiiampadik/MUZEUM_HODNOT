'use client';

import { useId, useMemo, useRef, useState } from 'react';
import type { MapPointData } from '@/components/ValueMap/ValueMap';
import { Label, Text, Title } from '@/components/Typography/Typography';
import { Link } from '@/components/Link/Link';
import { Pill } from '@/components/Pill/Pill';
import { schoolList } from '@/lib/strings';
// import type { DonationAmounts } from '@/lib/donations';
// import { SchoolFunding } from './SchoolFunding';
import styles from './SchoolList.module.css';

/** Rows shown before the list is expanded. */
const INITIAL_COUNT = 10;

/** Lowercase, without diacritics ("Žilina" → "zilina") and with collapsed spaces. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * List of all schools (the value-generator map points) shown under the map as
 * a table: name and address. A school with a campaign URL makes
 * its whole row a link (underlined texts + a chevron on the right). Rows are
 * separated by dashed dividers; on narrow screens each row stacks and the
 * column names are hidden.
 *
 * A search field filters the rows by name and address (case- and
 * diacritics-insensitive). Only the first INITIAL_COUNT matches are shown until
 * the list is expanded; it can be collapsed again.
 *
 * TODO: funding (donated vs. goal + progress bar) is temporarily hidden — see
 * the commented-out SchoolFunding below.
 */
export function SchoolList({
  schools,
  // initialAmounts,
}: {
  schools: readonly MapPointData[];
  // initialAmounts: DonationAmounts | null;
}) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const searchId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Name + address, normalized once per school.
  const haystacks = useMemo(
    () => schools.map((school) => normalize(`${school.title ?? ''} ${school.address ?? ''}`)),
    [schools],
  );

  // Every word of the query has to appear somewhere in the name or address.
  const words = normalize(query).split(' ').filter(Boolean);
  const matches = words.length
    ? schools.filter((_, i) => words.every((word) => haystacks[i].includes(word)))
    : schools;
  const visible = expanded ? matches : matches.slice(0, INITIAL_COUNT);
  const hiddenCount = matches.length - visible.length;

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
    // Collapsing removes the rows above the toggle; keep it on screen.
    if (expanded) requestAnimationFrame(() => moreRef.current?.scrollIntoView({ block: 'center' }));
  };

  if (schools.length === 0) return null;

  return (
    <section className={styles.section}>
      <Title as="h2" underline className={styles.title}>
        {schoolList.title}
      </Title>
      <div className={styles.search}>
        <label htmlFor={searchId} className={styles.searchLabel}>
          {schoolList.searchLabel}
        </label>
        <svg
          className={`${styles.searchIcon} ${styles.searchLens}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <circle cx="6.5" cy="6.5" r="4.5" vectorEffect="non-scaling-stroke" />
          <path d="M10 10l4.5 4.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <input
          ref={inputRef}
          id={searchId}
          type="search"
          className={styles.searchInput}
          placeholder={schoolList.searchPlaceholder}
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={clearSearch}
            aria-label={schoolList.searchClear}
          >
            <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" vectorEffect="non-scaling-stroke" />
            </svg>
          </button>
        )}
      </div>
      <div className={styles.table}>
        {/* Visual header only; every cell carries its own column label.
            Dropped when a search leaves no rows. */}
        {matches.length > 0 && (
          <div className={`${styles.line} ${styles.head}`} aria-hidden="true">
            <div className={styles.cells}>
              <Label>{schoolList.school}</Label>
              <Label>{schoolList.address}</Label>
            </div>
            {/* Keeps the columns aligned with the rows' chevron. */}
            <span className={styles.chevron} />
          </div>
        )}
        <ul className={styles.list}>
          {visible.map((school) => (
            <SchoolRow key={school._key} school={school} />
          ))}
        </ul>
        {/* Announced to screen readers when a search leaves no rows. */}
        <p role="status" className={styles.empty}>
          {matches.length === 0 && <Text as="span">{schoolList.noResults}</Text>}
        </p>
      </div>
      {matches.length > INITIAL_COUNT && (
        <div ref={moreRef} className={styles.more}>
          <Pill color="var(--accent)" aria-expanded={expanded} onClick={toggleExpanded}>
            {expanded ? schoolList.showLess : schoolList.showAll(hiddenCount)}
          </Pill>
        </div>
      )}
    </section>
  );
}

function SchoolRow({ school }: { school: MapPointData }) {
  const { title, address, url } = school;

  return (
    <li className={`${styles.line} ${styles.row} ${url ? styles.linked : ''}`}>
      <div className={styles.cells}>
        <div className={styles.cell}>
          <Label className={styles.cellLabel}>{schoolList.school}</Label>
          {title && (
            <Text as="h3" className={styles.value}>
              {/* Stretched over the whole row (see .rowLink::after). */}
              {url ? (
                <Link href={url} target="_blank" className={styles.rowLink}>
                  {title}
                </Link>
              ) : (
                title
              )}
            </Text>
          )}
        </div>

        <div className={styles.cell}>
          <Label className={styles.cellLabel}>{schoolList.address}</Label>
          {address && <Text className={styles.value}>{address}</Text>}
        </div>
      </div>

      {/* Without a URL an empty slot keeps the columns aligned across rows. */}
      {url ? (
        <svg
          className={styles.chevron}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeLinecap="square"
          strokeLinejoin="miter"
          aria-hidden="true"
        >
          <path d="M6 3l5 5-5 5" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <span className={styles.chevron} />
      )}

      {/* Funding is temporarily hidden; the goal is fixed at 350 € for now.
      <SchoolFunding schoolKey={school._key} goal={350} initialAmounts={initialAmounts} />
      */}
    </li>
  );
}
