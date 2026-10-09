import type { CSSProperties } from 'react';
import type { MapPointData } from '@/components/ValueMap/ValueMap';
import { Label, Title, Underline } from '@/components/Typography/Typography';
import { RichText } from '@/components/RichText/RichText';
import { Pill } from '@/components/Pill/Pill';
import { schoolList } from '@/lib/strings';
import styles from './SchoolList.module.css';

const eur = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

// TODO: donated amounts will come from the donation API; not available yet.
function donatedFor(_school: MapPointData): number {
  return 0;
}

/**
 * List of all schools (the value-generator map points) shown under the map:
 * donated vs. goal amount, a progress bar once something has been donated,
 * the donation link and an optional note. Styled like the homepage's
 * upcoming-exhibition rows (dashed dividers).
 */
export function SchoolList({ schools }: { schools: readonly MapPointData[] }) {
  if (schools.length === 0) return null;

  return (
    <section className={styles.section}>
      <Title as="h2" underline className={styles.title}>
        {schoolList.title}
      </Title>
      <ul className={styles.list}>
        {schools.map((school) => (
          <SchoolRow key={school._key} school={school} />
        ))}
      </ul>
    </section>
  );
}

function SchoolRow({ school }: { school: MapPointData }) {
  const { title, text, link } = school;
  const goal = typeof school.goal === 'number' && school.goal > 0 ? school.goal : null;
  const donated = donatedFor(school);
  const percent = goal ? Math.min(100, (donated / goal) * 100) : 0;

  return (
    <li className={styles.row}>
      {title && (
        <Title as="h3">
          <Underline>{title}</Underline>
        </Title>
      )}

      <div className={styles.grid}>
        <div className={styles.funding}>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <Label as="dt">{schoolList.donated}</Label>
              <Title as="dd" className={styles.amount}>
                {eur.format(donated)}
              </Title>
            </div>
            {goal && (
              <div className={styles.stat}>
                <Label as="dt">{schoolList.goal}</Label>
                <Title as="dd" className={styles.amount}>
                  {eur.format(goal)}
                </Title>
              </div>
            )}
          </dl>
          {goal && donated > 0 && (
            <div
              className={styles.track}
              role="progressbar"
              aria-label={schoolList.progress}
              aria-valuemin={0}
              aria-valuemax={goal}
              aria-valuenow={Math.min(donated, goal)}
              aria-valuetext={`${eur.format(donated)} / ${eur.format(goal)}`}
            >
              <div className={styles.fill} style={{ '--progress': `${percent}%` } as CSSProperties} />
            </div>
          )}
        </div>

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
