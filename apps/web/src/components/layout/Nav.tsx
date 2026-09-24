'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Pill } from '../Pill/Pill';
import { Link } from '../Link/Link';
import { Container } from '../Container/Container';
import { IntroBubble } from '../IntroBubble/IntroBubble';
import { routes } from '@/lib/routes';
import { nav } from '@/lib/strings';
import styles from './Nav.module.css';

type NavProps = {
  donateLink?: { label?: string | null; href?: string | null } | null;
  /** Homepage project intro — rendered as the nav's own top bubble there. */
  homeIntro?: readonly unknown[] | null;
};

const items = [
  { href: routes.aboutPlatform, label: nav.aboutPlatform, emoji: '👻' },
  { href: routes.valueGenerator, label: nav.valueGenerator, emoji: '🔮' },
  { href: routes.methodicalMaterials, label: nav.methodicalMaterials, emoji: '📚' },
  { href: routes.contact, label: nav.contact, emoji: '🤹' },
];

export function Nav({ donateLink, homeIntro }: NavProps) {
  const pathname = usePathname();
  const isHome = pathname === routes.home;
  const hasIntro = !!homeIntro?.length;

  const navRef = useRef<HTMLElement>(null);

  // The pill row's own height (stable — it never animates). Measured
  // separately from the bubble on purpose: see the --nav-height effect below.
  const columnRef = useRef<HTMLDivElement>(null);
  const [columnHeight, setColumnHeight] = useState(0);
  useLayoutEffect(() => {
    const el = columnRef.current;
    if (!el) return;
    const publish = () => setColumnHeight(el.offsetHeight);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The intro bubble sits above the pill row, as the nav's own top edge — but
  // only on the homepage. Once shown, it stays mounted across routes (the
  // layout persists between client-side navigations) so navigating away from
  // the homepage can animate it sliding out — hiding is the same translateY
  // the scroll effect below already uses, not a height clip, so its rounded
  // corners are never squeezed.
  //
  // It must NOT be mounted on a hard load that lands directly on a non-home
  // route, though: this is a static export, so that route's prerendered HTML
  // has no JS-driven transform yet, and nothing in CSS hides the bubble by
  // default — it would flash visible until the layout effect below snaps it
  // away after hydration. `hasBeenHome` starts at the initial isHome value
  // (false on such a hard load, so the bubble never renders at all — no
  // flash, no layout shift) and latches true the first time isHome is,
  // covering the animate-away case for the rest of this mount's lifetime.
  const [hasBeenHome, setHasBeenHome] = useState(isHome);
  useEffect(() => {
    if (isHome) setHasBeenHome(true);
  }, [isHome]);
  const showBubble = hasIntro && hasBeenHome;

  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubbleHeight, setBubbleHeight] = useState(0);
  useLayoutEffect(() => {
    const el = bubbleRef.current;
    if (!el) {
      setBubbleHeight(0);
      return;
    }
    const publish = () => setBubbleHeight(el.offsetHeight);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showBubble]);

  // Publish the nav's resting height as --nav-height so pages can start their
  // content right below it (the homepage hero does). Built from the column's
  // and bubble's own heights directly (not measured off the animating nav
  // element) so it jumps straight to its final value instead of tracking the
  // translateY transition frame by frame — otherwise the hero content
  // underneath would visibly scroll along with the animation instead of
  // staying put while the bubble slides over it.
  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      '--nav-height',
      `${columnHeight + (isHome ? bubbleHeight : 0)}px`
    );
    // Lets the homepage hero (home.module.css) stay hidden until this first
    // real measurement lands, instead of briefly showing a hardcoded guess
    // and then jumping — see that file's .hero rule. columnHeight is 0 only
    // before the very first measurement, never again afterwards.
    if (columnHeight > 0) {
      document.documentElement.classList.add('nav-measured');
    }
  }, [columnHeight, isHome, bubbleHeight]);

  // The whole nav (bubble + pill row) slides up on translateY, exactly like a
  // scroll: on the homepage it tracks the scroll position 1:1 (capped at the
  // bubble's height, at which point the pill row is flush with the top, the
  // bubble tucked away above the viewport); off the homepage it's pinned at
  // that same fully-scrolled position permanently. A CSS transition is turned
  // on only for the route-driven jump between those two states — not for
  // scroll tracking itself, which must stay perfectly instant — and only
  // after the first paint, so a hard page load never animates, only an
  // actual client-side navigation does.
  const didMountRef = useRef(false);
  // The transition should only ever play for an actual isHome flip (a
  // client-side navigation to/from the homepage) — not for a bubbleHeight
  // remeasure (e.g. the async ResizeObserver reading the real height after
  // an initial 0) that happens to land on a later render of this effect.
  // Without tracking isHome separately, landing straight on a non-home page
  // would animate the bubble hiding itself, even though it was never shown.
  const isHomeRef = useRef(isHome);
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el || !showBubble) return;

    const scrollTarget = () => Math.min(window.scrollY, bubbleHeight);
    const routeTarget = isHome ? scrollTarget() : bubbleHeight;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const routeChanged = didMountRef.current && isHomeRef.current !== isHome;
    if (routeChanged && !reduceMotion) {
      el.style.transition = 'transform 0.4s ease';
    }
    didMountRef.current = true;
    isHomeRef.current = isHome;
    el.style.transform = `translateY(-${routeTarget}px)`;

    const clearTransition = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName === 'transform') el.style.transition = '';
    };
    el.addEventListener('transitionend', clearTransition);

    let rafId = 0;
    const onScroll = () => {
      if (!isHome || rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        // In case a scroll starts mid route-transition: drop the transition
        // so tracking resumes instant instead of fighting it.
        el.style.transition = '';
        el.style.transform = `translateY(-${scrollTarget()}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      el.removeEventListener('transitionend', clearTransition);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isHome, bubbleHeight, showBubble]);

  // Mobile: the pill row collapses into a single Menu button that opens a
  // full-screen overlay with the links stacked in a centered column.
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the overlay on route change (a link was followed).
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // While the overlay is open: lock scrolling on the page below and allow Esc
  // to close it.
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <nav ref={navRef} className={styles.nav} aria-label={nav.ariaLabel}>
      {showBubble && (
        <div
          id="o-muzeu"
          ref={bubbleRef}
          className={styles.bubbleBar}
          aria-hidden={!isHome}
          inert={!isHome}
        >
          <Container>
            <div className={styles.bubbleInner}>
              <IntroBubble value={homeIntro} />
            </div>
          </Container>
        </div>
      )}

      {/* Scroll-reveal home icon — replaced by the always-visible brand pill below.
      const offHome = pathname !== routes.home;
      // On the homepage the home button is hidden at the top and revealed once the
      // user scrolls past the hero; off the homepage it is always visible.
      const [scrolled, setScrolled] = useState(false);
      useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
      }, []);
      const showHome = offHome || scrolled;

      <Link
        href={routes.home}
        className={`${styles.home} ${showHome ? styles.homeVisible : ''}`}
        aria-label={nav.homeAriaLabel}
        aria-hidden={!showHome}
        tabIndex={showHome ? undefined : -1}
      >
        <span className={styles.homeName}>{nav.brandAbbr}</span>
        <span className={styles.homeIcon} aria-hidden="true" />
      </Link>
      */}

      <div ref={columnRef} className={styles.column}>
        <Link href={routes.home} className={styles.brand} aria-label={nav.homeAriaLabel}>
          <span aria-hidden="true">{nav.brandName}</span>
        </Link>

        <Container>
          {/* Desktop: full pill row. Hidden on phones (see .inner media query). */}
          <div className={styles.inner}>
            {items.map((item) => (
              <Pill
                key={item.href}
                href={item.href}
                variant="surface"
                size="lg"
                emoji={item.emoji}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Pill>
            ))}

            {donateLink?.href && (
              <Pill href={donateLink.href} variant="surface" size="lg" emoji="💝">
                {donateLink.label || nav.donateFallback}
              </Pill>
            )}
          </div>

          {/* Phones: single Menu button that opens the overlay below. */}
          <div className={styles.mobileMenu}>
            <Pill
              variant="surface"
              size="lg"
              emoji="🍽️"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-label={nav.menuOpenAriaLabel}
            >
              {nav.menu}
            </Pill>
          </div>
        </Container>
      </div>
      </nav>

      {/* Rendered as a sibling of <nav>, not inside it: the nav's scroll
          transform (see the scrollOffset effect above) makes it a containing
          block for `position: fixed` descendants, which would shrink this
          overlay down to the nav's own box instead of the full viewport. */}
      {menuOpen && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={nav.menu}
          onClick={(e) => {
            // Click on the backdrop (not the links column) closes the overlay.
            if (e.target === e.currentTarget) setMenuOpen(false);
          }}
        >
          <button
            type="button"
            className={styles.close}
            onClick={() => setMenuOpen(false)}
            aria-label={nav.menuClose}
          >
            <span aria-hidden="true">×</span>
          </button>

          <div className={styles.overlayLinks}>
            {items.map((item) => (
              <Pill
                key={item.href}
                href={item.href}
                variant="surface"
                size="lg"
                emoji={item.emoji}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Pill>
            ))}

            {donateLink?.href && (
              <Pill href={donateLink.href} variant="surface" size="lg" emoji="💝">
                {donateLink.label || nav.donateFallback}
              </Pill>
            )}
          </div>
        </div>
      )}
    </>
  );
}
