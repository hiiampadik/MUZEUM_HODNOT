'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PENDING = 'reveal-pending';
const MEDIA_PENDING = 'media-pending';
/** Cap on the stagger within one batch, so a long list never lags behind. */
const MAX_ORDER = 5;

/**
 * Scroll half of the reveal system (see `.reveal` in globals.css). Blocks that
 * are on screen when the page mounts keep their first-paint animation; blocks
 * below the fold are hidden and revealed as they scroll into view. Blocks
 * entering together are staggered in DOM order. Images in `.reveal-media` that
 * are still loading are held back until they arrive, then dither in. Re-runs on
 * every route change because client navigation mounts a new page.
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

    // Still loading: hold the dither dissolve (and the image) until it arrives,
    // so it never plays out over an empty frame.
    document.querySelectorAll<HTMLImageElement>('.reveal-media img').forEach((img) => {
      if (img.complete) return;
      img.classList.add(MEDIA_PENDING);
      const done = () => img.classList.remove(MEDIA_PENDING);
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });

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
