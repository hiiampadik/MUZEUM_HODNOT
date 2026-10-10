/**
 * Raised amounts per school (value-generator map point `_key` → EUR), served by
 * the donations Worker (apps/donations). The Worker hides the Darujme.sk feed
 * IDs, which would otherwise expose donor names and e-mails.
 *
 * Fetched twice: at build time (baked into the HTML, so the page shows the last
 * known amount even without JS) and in the browser (fresh amounts without a
 * rebuild).
 */

export type DonationAmounts = Record<string, number>;

/** Worker origin; optional — without it no raised amounts are shown. */
export const donationsApiUrl =
  process.env.NEXT_PUBLIC_DONATIONS_API_URL?.replace(/\/+$/, '') || null;

const TIMEOUT_MS = 8000;

/** Returns the amounts, or null when the Worker is not configured or fails. */
export async function fetchDonationAmounts(): Promise<DonationAmounts | null> {
  if (!donationsApiUrl) return null;
  try {
    const res = await fetch(`${donationsApiUrl}/amounts`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { amounts?: unknown };
    return isAmounts(data.amounts) ? data.amounts : null;
  } catch {
    return null;
  }
}

function isAmounts(value: unknown): value is DonationAmounts {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((v) => typeof v === 'number' && Number.isFinite(v))
  );
}
