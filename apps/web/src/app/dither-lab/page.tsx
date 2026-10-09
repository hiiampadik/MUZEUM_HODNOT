import type { Metadata } from 'next';
import { DitherLab } from './DitherLab';

// Dev playground for the live Dither component — not linked, not indexed.
// TODO: remove (with public/dither-lab/) once the dither settings are final.
export const metadata: Metadata = {
  title: 'Dither lab',
  robots: { index: false, follow: false },
};

export default function DitherLabPage() {
  return <DitherLab src="/dither-lab/frame-181.jpg" aspectRatio="1800 / 1055" />;
}
