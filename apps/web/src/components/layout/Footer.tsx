import { Container } from '../Container/Container';
import { Link } from '../Link/Link';
import { RichText } from '../RichText/RichText';
import { SanityImage } from '../SanityImage/SanityImage';
import { Title } from '../Typography/Typography';
import type {
  SETTINGS_QUERYResult,
  CONTACT_QUERYResult,
} from '@/sanity/types.generated';
import { footer } from '@/lib/strings';
import styles from './Footer.module.css';

type FooterProps = {
  settings: SETTINGS_QUERYResult;
  contact: CONTACT_QUERYResult;
};

type PartnerLogo = NonNullable<SETTINGS_QUERYResult>['partnerLogos'] extends
  | Array<infer T>
  | null
  ? T
  : never;

/**
 * Rendered image resolution (for a sharp srcset) — the visible size is capped
 * by the fixed `.logoBox` in CSS, which centers each logo via object-fit so
 * logos cropped tightly to their own artwork still sit at a consistent size.
 */
const LOGO_HEIGHT = 64;

function PartnerLogos({ logos }: { logos: PartnerLogo[] }) {
  if (logos.length === 0) return null;

  return (
    <ul className={styles.logos}>
      {logos.map((logo) => {
        const dims = logo.asset?.metadata?.dimensions;
        const aspect = dims?.width && dims?.height ? dims.width / dims.height : 160 / 50;
        const width = Math.round(LOGO_HEIGHT * aspect);

        const image = (
          <span className={styles.logoBox}>
            <SanityImage
              value={logo}
              width={width}
              height={LOGO_HEIGHT}
              className={styles.logo}
              alt={logo.alt ?? logo.name ?? ''}
            />
          </span>
        );
        return (
          <li key={logo._key}>
            {logo.url ? (
              <a href={logo.url} target="_blank" rel="noopener noreferrer">
                {image}
              </a>
            ) : (
              image
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Footer({ settings, contact }: FooterProps) {
  const social = settings?.socialLinks ?? [];
  const museumPartnerLogos = settings?.partnerLogos ?? [];
  const valuesPartnerLogos = settings?.valuesPartnerLogos ?? [];

  const hasMuseumPartners = Boolean(settings?.partners) || museumPartnerLogos.length > 0;
  const hasValuesPartners =
    Boolean(settings?.valuesPartnersText) || valuesPartnerLogos.length > 0;

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          {/* Contact, social links + administrative info — sourced from the Contact page */}
          <div className={styles.column}>
            <div>
              <Title as="h2" className={styles.heading}>
                {footer.contact}
              </Title>
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

            {social.length > 0 && (
              <div>
                <Title as="h2" className={styles.heading}>
                  {footer.social}
                </Title>
                <ul className={styles.social}>
                  {social.map((item) => (
                    <li key={item._key}>
                      <a
                        href={item.url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                        aria-label={item.name ?? undefined}
                      >
                        <SanityImage
                          value={item.icon}
                          width={24}
                          height={24}
                          alt=""
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {contact?.administrativeInfo && (
              <div>
                <Title as="h2" className={styles.heading}>
                  {footer.administrative}
                </Title>
                <RichText value={contact.administrativeInfo} />
              </div>
            )}
          </div>

          {/* Partners — Múzeum hodnôt */}
          {hasMuseumPartners && (
            <div className={styles.column}>
              <Title as="h2" className={styles.heading}>
                {footer.partners}
              </Title>
              <RichText value={settings?.partners} />
              <PartnerLogos logos={museumPartnerLogos} />
            </div>
          )}

          {/* Partners — Generátor hodnôt */}
          {hasValuesPartners && (
            <div className={styles.column}>
              <Title as="h2" className={styles.heading}>
                {footer.valuesPartners}
              </Title>
              <RichText value={settings?.valuesPartnersText} />
              <PartnerLogos logos={valuesPartnerLogos} />
            </div>
          )}
        </div>
      </Container>
    </footer>
  );
}
