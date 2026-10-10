import type { MapPointData } from '@/components/ValueMap/ValueMap';
import { Label, Title, Underline } from '@/components/Typography/Typography';
import { RichText } from '@/components/RichText/RichText';
import { Pill } from '@/components/Pill/Pill';
import { schoolList } from '@/lib/strings';
import type { DonationAmounts } from '@/lib/donations';
import { SchoolFunding } from './SchoolFunding';
import styles from './SchoolList.module.css';

/**
 * List of all schools (the value-generator map points) shown under the map:
 * donated vs. goal amount, a progress bar once something has been donated,
 * the donation link and an optional note. Styled like the homepage's
 * upcoming-exhibition rows (dashed dividers). `initialAmounts` are the
 * build-time raised amounts; SchoolFunding refreshes them in the browser.
 */
export function SchoolList({
  schools,
  initialAmounts,
}: {
  schools: readonly MapPointData[];
  initialAmounts: DonationAmounts | null;
}) {
  if (schools.length === 0) return null;

  return (
    <section className={styles.section}>
      <Title as="h2" underline className={styles.title}>
        {schoolList.title}
      </Title>
      <ul className={styles.list}>
        {schools.map((school) => (
          <SchoolRow key={school._key} school={school} initialAmounts={initialAmounts} />
        ))}
      </ul>
    </section>
  );
}

function SchoolRow({
  school,
  initialAmounts,
}: {
  school: MapPointData;
  initialAmounts: DonationAmounts | null;
}) {
  const { title, text, link } = school;
  const goal = typeof school.goal === 'number' && school.goal > 0 ? school.goal : null;

  return (
    <li className={styles.row}>
      {title && (
        <Title as="h3">
          <Underline>{title}</Underline>
        </Title>
      )}

      <div className={styles.grid}>
        <SchoolFunding schoolKey={school._key} goal={goal} initialAmounts={initialAmounts} />

        {link?.href && (
          <div className={styles.join}>
            <Label as="p">{schoolList.joinOn}</Label>
            <Pill
              href={link.href}
              target={link.newTab === false ? '_self' : '_blank'}
              color="var(--accent)"
              emoji={link.emoji || '↗'}
            >
              {link.label || link.href}
            </Pill>
          </div>
        )}
      </div>

      {text && <RichText value={text} className={styles.text} />}
    </li>
  );
}
