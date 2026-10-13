import type { MapPointData } from '@/components/ValueMap/ValueMap';
import { Label, Text, Title } from '@/components/Typography/Typography';
import { Link } from '@/components/Link/Link';
import { schoolList } from '@/lib/strings';
// import type { DonationAmounts } from '@/lib/donations';
// import { SchoolFunding } from './SchoolFunding';
import styles from './SchoolList.module.css';

/**
 * List of all schools (the value-generator map points) shown under the map as
 * a table: name and address. A school with a campaign URL makes
 * its whole row a link (underlined texts + a chevron on the right). Rows are
 * separated by dashed dividers; on narrow screens each row stacks and the
 * column names are hidden.
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
  if (schools.length === 0) return null;

  return (
    <section className={styles.section}>
      <Title as="h2" underline className={styles.title}>
        {schoolList.title}
      </Title>
      <div className={styles.table}>
        {/* Visual header only; every cell carries its own column label. */}
        <div className={`${styles.line} ${styles.head}`} aria-hidden="true">
          <div className={styles.cells}>
            <Label>{schoolList.school}</Label>
            <Label>{schoolList.address}</Label>
          </div>
          {/* Keeps the columns aligned with the rows' chevron. */}
          <span className={styles.chevron} />
        </div>
        <ul className={styles.list}>
          {schools.map((school) => (
            <SchoolRow key={school._key} school={school} />
          ))}
        </ul>
      </div>
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
