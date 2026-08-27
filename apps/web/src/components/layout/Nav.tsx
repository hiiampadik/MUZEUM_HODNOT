'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '../Link/Link';
import { Container } from '../Container/Container';
import { routes } from '@/lib/routes';
import styles from './Nav.module.css';

type NavProps = {
  donateLink?: { label?: string | null; href?: string | null } | null;
};

const items = [
  { href: routes.contact, label: 'Kontakt' },
  { href: routes.experientialEducation, label: 'Zážitkové vzdelávanie' },
  { href: routes.valueGenerator, label: 'Generátor hodnôt' },
];

export function Nav({ donateLink }: NavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Hlavná navigácia">
      <Container>
        <div className={styles.inner}>
          <Link href={routes.home} className={styles.brand}>
            Múzeum hodnôt
          </Link>

          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden="true">{open ? '✕' : '☰'}</span>
          </button>

          <ul
            id="nav-menu"
            className={[styles.list, open ? styles.open : ''].join(' ')}
          >
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {donateLink?.href && (
              <li>
                <Link href={donateLink.href} className={styles.link}>
                  {donateLink.label || 'Darovať'}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </Container>
    </nav>
  );
}
