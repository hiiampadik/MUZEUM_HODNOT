import type { CSSProperties } from 'react';

/**
 * Inline style placing a `.reveal` block in the first-paint sequence
 * (0 = with the nav, then one --reveal-stagger step per order).
 */
export function revealOrder(order: number): CSSProperties {
  return { '--reveal-order': order } as CSSProperties;
}
