'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PENDING = 'reveal-pending';
/** Cap on the stagger within one batch, so a long list never lags behind. */
const MAX_ORDER = 5;

/**
 * Scroll half of the reveal system (see `.reveal` in globals.css). Blocks that
 * are on screen when the page mounts keep their first-paint animation; blocks
 * below the fold are hidden and revealed as they scroll into view. Blocks
 * entering together are staggered in DOM order. Re-runs on every route change
 * because client navigation mounts a new page.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.setProperty('--reveal-order', String(Math.min(order++, MAX_ORDER)));
          el.classList.remove(PENDING);
          observer.unobserve(el);
        }
      },
      // Reveal a little after the block's top edge crosses the bottom of the
      // viewport, so the motion happens where the eye is.
      { rootMargin: '0px 0px -8% 0px' },
    );

    const fold = window.innerHeight;
    document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
      // Already visible (or scrolled past): hiding it now would flicker.
      if (el.getBoundingClientRect().top < fold) return;
      el.classList.add(PENDING);
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      document.querySelectorAll(`.${PENDING}`).forEach((el) => el.classList.remove(PENDING));
    };
  }, [pathname]);

  return null;
}
