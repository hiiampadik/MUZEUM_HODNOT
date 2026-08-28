'use client';

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

export function Nav({ donateLink }: NavProps) {
  const pathname = usePathname();

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
          className={styles.brand}
          aria-label={nav.homeAriaLabel}
        >
          {nav.brandName}
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
