'use client';

import type { CSSProperties } from 'react';
import { Label, Title } from '@/components/Typography/Typography';
import { schoolList } from '@/lib/strings';
import type { DonationAmounts } from '@/lib/donations';
import { useDonationAmounts } from './useDonationAmounts';
import styles from './SchoolList.module.css';

const eur = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/**
 * Donated vs. goal amount of one school, plus a progress bar once something
 * has been donated. The donated amount refreshes client-side from the
 * donations Worker; it is hidden when unknown (no feed / Worker unavailable).
 */
export function SchoolFunding({
  schoolKey,
  goal,
  initialAmounts,
}: {
  schoolKey: string;
  goal: number | null;
  initialAmounts: DonationAmounts | null;
}) {
  const amounts = useDonationAmounts(initialAmounts);
  const donated = amounts?.[schoolKey] ?? null;
  if (donated === null && goal === null) return null;

  const percent = goal && donated ? Math.min(100, (donated / goal) * 100) : 0;

  return (
    <div className={styles.funding}>
      <dl className={styles.stats}>
        {donated !== null && (
          <div className={styles.stat}>
            <Label as="dt">{schoolList.donated}</Label>
            <Title as="dd" className={styles.amount}>
              {eur.format(donated)}
            </Title>
          </div>
        )}
        {goal !== null && (
          <div className={styles.stat}>
            <Label as="dt">{schoolList.goal}</Label>
            <Title as="dd" className={styles.amount}>
              {eur.format(goal)}
            </Title>
          </div>
        )}
      </dl>
      {goal !== null && donated !== null && donated > 0 && (
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
  );
}
