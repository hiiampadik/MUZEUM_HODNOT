'use client';

import { useEffect, useState } from 'react';
import { fetchDonationAmounts, type DonationAmounts } from '@/lib/donations';

// One request per page load, shared by every school row.
let pending: Promise<DonationAmounts | null> | null = null;

/**
 * Fresh raised amounts from the donations Worker. Starts from the build-time
 * amounts and keeps them when the refresh fails.
 */
export function useDonationAmounts(initial: DonationAmounts | null): DonationAmounts | null {
  const [amounts, setAmounts] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    pending ??= fetchDonationAmounts();
    void pending.then((fresh) => {
      if (!cancelled && fresh) setAmounts({ ...initial, ...fresh });
    });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  return amounts;
}
