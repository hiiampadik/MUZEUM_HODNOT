'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  { href: routes.aboutPlatform, label: nav.aboutPlatform, emoji: '👻' },
  { href: routes.valueGenerator, label: nav.valueGenerator, emoji: '🔮' },
  { href: routes.methodicalMaterials, label: nav.methodicalMaterials, emoji: '📚' },
  { href: routes.contact, label: nav.contact, emoji: '🤹' },
];

export function Nav({ donateLink }: NavProps) {
  const pathname = usePathname();

  // Publish the nav's height as --nav-height so pages can start their content
  // right below it (the homepage hero does). The nav is fixed at the top and
  // never moves, so this is a plain measurement.
  const columnRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = columnRef.current;
    if (!el) return;
    const publish = () => {
      document.documentElement.style.setProperty('--nav-height', `${el.offsetHeight}px`);
      // Lets the homepage hero (home.module.css) stay hidden until this first
      // real measurement lands, instead of briefly showing a hardcoded guess
      // and then jumping — see that file's .hero rule.
      if (el.offsetHeight > 0) document.documentElement.classList.add('nav-measured');
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      <nav className={styles.nav} aria-label={nav.ariaLabel}>
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

      {/* Rendered as a sibling of <nav> so the overlay is measured against the
          viewport, independent of the nav's own box. */}
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
