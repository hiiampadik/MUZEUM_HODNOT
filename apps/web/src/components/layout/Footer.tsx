import { Container } from '../Container/Container';
import { Link } from '../Link/Link';
import { RichText } from '../RichText/RichText';
import { Label } from '../Typography/Typography';
import type { SETTINGS_QUERYResult, CONTACT_QUERYResult } from '@/sanity/types.generated';
import styles from './Footer.module.css';

type FooterProps = {
  settings: SETTINGS_QUERYResult;
  contact: CONTACT_QUERYResult;
};

export function Footer({ settings, contact }: FooterProps) {
  const social = settings?.socialLinks ?? [];

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          {/* Contact — sourced from the Contact page */}
          <div>
            <Label as="h2" className={styles.heading}>
              Kontakt
            </Label>
            {contact?.phone && (
              <p>
                <Link href={`tel:${contact.phone}`}>{contact.phone}</Link>
              </p>
            )}
            {contact?.email && (
              <p>
                <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
              </p>
            )}
            <RichText value={contact?.address} />
          </div>

          {/* Administrative info — also from the Contact page */}
          {contact?.administrativeInfo && (
            <div>
              <Label as="h2" className={styles.heading}>
                Administratívne údaje
              </Label>
              <RichText value={contact.administrativeInfo} />
            </div>
          )}

          {/* Partners */}
          {settings?.partners && (
            <div>
              <Label as="h2" className={styles.heading}>
                Partneri projektu
              </Label>
              <RichText value={settings.partners} />
            </div>
          )}

          {/* Social networks */}
          {social.length > 0 && (
            <div>
              <Label as="h2" className={styles.heading}>
                Sledujte nás
              </Label>
              <ul className={styles.social}>
                {social.map((item) => (
                  <li key={item._key}>
                    <a
                      href={item.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={item.name ?? undefined}
                      dangerouslySetInnerHTML={{ __html: item.icon ?? '' }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </footer>
  );
}
