'use client';

import { Fragment, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Pill } from '../Pill/Pill';
import { Link } from '../Link/Link';
import { Container } from '../Container/Container';
import { routes } from '@/lib/routes';
import { nav } from '@/lib/strings';
import styles from './Nav.module.css';

type NavProps = {
  donateLink?: { label?: string | null; href?: string | null } | null;
};

const items = [
  { href: routes.contact, label: nav.contact, emoji: '🤹' },
  { href: routes.valueGenerator, label: nav.valueGenerator, emoji: '🔮' },
  { href: routes.experientialEducation, label: nav.experientialEducation, emoji: '👻' },
];

// The brand pill collapses to its initials on scroll down and expands on scroll
// up. Each word keeps its first letter visible; the rest (and the inter-word
// space) sit in collapsible spans that animate width + opacity.
type BrandSegment = { collapsible: boolean; text: string };

const brandSegments: BrandSegment[] = nav.brandName
  .split(' ')
  .flatMap((word, i) => {
    const segs: BrandSegment[] = [];
    if (i > 0) segs.push({ collapsible: true, text: ' ' });
    segs.push({ collapsible: false, text: word.slice(0, 1) });
    if (word.length > 1) segs.push({ collapsible: true, text: word.slice(1) });
    return segs;
  });

// Only flip the collapsed state after a meaningful move in one direction, so a
// one-pixel scroll (or jitter) never triggers the animation.
const SCROLL_THRESHOLD = 200;

export function Nav({ donateLink }: NavProps) {
  const pathname = usePathname();

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

  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let acc = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      // Near the very top the pill is always expanded.
      if (y <= 4) {
        acc = 0;
        setCollapsed(false);
        return;
      }
      // Reset the accumulator whenever the scroll direction flips.
      if ((delta > 0 && acc < 0) || (delta < 0 && acc > 0)) acc = 0;
      acc += delta;
      if (acc > SCROLL_THRESHOLD) setCollapsed(true);
      else if (acc < -SCROLL_THRESHOLD) setCollapsed(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={styles.nav} aria-label={nav.ariaLabel}>
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

      <div className={styles.column}>
        <Link
          href={routes.home}
          className={`${styles.brand} ${collapsed ? styles.collapsed : ''}`}
          aria-label={nav.homeAriaLabel}
        >
          <span className={styles.brandInner} aria-hidden="true">
            {brandSegments.map((seg, i) =>
              seg.collapsible ? (
                <span key={i} className={styles.brandRest}>
                  <span>{seg.text}</span>
                </span>
              ) : (
                <Fragment key={i}>{seg.text}</Fragment>
              )
            )}
          </span>
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
    </nav>
  );
}
