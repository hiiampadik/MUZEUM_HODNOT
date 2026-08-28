'use client';

import { usePathname } from 'next/navigation';
import { Pill } from '../Pill/Pill';
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
          <Pill href={routes.home} size="lg" emoji="✨">
            Múzeum hodnôt
          </Pill>

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
