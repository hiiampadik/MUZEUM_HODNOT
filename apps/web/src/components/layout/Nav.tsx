'use client';

import { usePathname } from 'next/navigation';
import { Pill } from '../Pill/Pill';
import { Link } from '../Link/Link';
import { Container } from '../Container/Container';
import { routes } from '@/lib/routes';
import styles from './Nav.module.css';

type NavProps = {
  donateLink?: { label?: string | null; href?: string | null } | null;
};

const items = [
  { href: routes.contact, label: 'Kontakt', emoji: '🤹' },
  { href: routes.experientialEducation, label: 'Zážitkové vzdelávanie', emoji: '👻' },
  { href: routes.valueGenerator, label: 'Generátor hodnôt', emoji: '🔮' },
];

export function Nav({ donateLink }: NavProps) {
  const pathname = usePathname();
  const offHome = pathname !== routes.home;

  return (
    <nav className={styles.nav} aria-label="Hlavná navigácia">
      {offHome && (
        <Link href={routes.home} className={styles.home} aria-label="Domov">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
          </svg>
        </Link>
      )}

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
              {donateLink.label || 'Darovať'}
            </Pill>
          )}
        </div>
      </Container>
    </nav>
  );
}
