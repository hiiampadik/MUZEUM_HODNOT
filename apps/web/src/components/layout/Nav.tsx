'use client';

import { usePathname } from 'next/navigation';
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

  return (
    <nav className={styles.nav} aria-label="Hlavná navigácia">
      <Container>
        <div className={styles.inner}>
          <Link href={routes.home} className={`${styles.pill} ${styles.brand}`}>
            <span aria-hidden="true">✨</span>
            <span>Múzeum hodnôt</span>
          </Link>

          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.pill} ${styles.link}`}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <span aria-hidden="true">{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          {donateLink?.href && (
            <Link href={donateLink.href} className={`${styles.pill} ${styles.link}`}>
              <span aria-hidden="true">💝</span>
              <span>{donateLink.label || 'Darovať'}</span>
            </Link>
          )}
        </div>
      </Container>
    </nav>
  );
}
