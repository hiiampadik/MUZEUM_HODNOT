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
const SCROLL_THRESHOLD = 48;

export function Nav({ donateLink }: NavProps) {
  const pathname = usePathname();

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
        </Container>


      </div>
    </nav>
  );
}
