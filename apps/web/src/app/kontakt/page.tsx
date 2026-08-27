import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { CONTACT_QUERY } from '@/sanity/queries';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { SanityImage } from '@/components/SanityImage/SanityImage';
import { RichText } from '@/components/RichText/RichText';
import { Link } from '@/components/Link/Link';
import { Heading, Title, Label, Text } from '@/components/Typography/Typography';
import { accents, routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/metadata';
import { ogImageUrl } from '@/sanity/lib/og';
import styles from './contact.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const contact = await client.fetch(CONTACT_QUERY);
  return pageMetadata({
    title: 'Kontakt',
    image: ogImageUrl(contact?.cover),
    path: routes.contact,
  });
}

export default async function ContactPage() {
  const contact = await client.fetch(CONTACT_QUERY);

  return (
    <main style={{ '--accent': accents.contact } as CSSProperties}>
      {contact?.cover && (
        <CoverImage value={contact.cover} placement="top" priority className={styles.footerCover} />
      )}

      <Container width="narrow">
        <Heading className={styles.headerTitle}>Kontakt</Heading>

        <div className={styles.details}>
          {contact?.phone && (
            <div className={styles.detailItem}>
              <Label>Telefón</Label>
              <Link href={`tel:${contact.phone}`} className={`${styles.pill} ${styles.pillPhone}`}>
                <span aria-hidden="true">☎️</span>
                {contact.phone}
              </Link>
            </div>
          )}
          {contact?.email && (
            <div className={styles.detailItem}>
              <Label>E-mail</Label>
              <Link
                href={`mailto:${contact.email}`}
                className={`${styles.pill} ${styles.pillEmail}`}
              >
                <span aria-hidden="true">💌</span>
                {contact.email}
              </Link>
            </div>
          )}
          {contact?.address && (
            <div className={styles.detailItem}>
              <RichText value={contact.address} className={styles.detailText} />
            </div>
          )}
          {contact?.administrativeInfo && (
            <div className={styles.detailItem}>
              <RichText value={contact.administrativeInfo} className={styles.detailText} />
            </div>
          )}
        </div>
      </Container>

      {contact?.people && contact.people.length > 0 && (
        <Container>
          <Title as="h2" underline className={styles.peopleTitle}>
            Ľudia v projekte
          </Title>
          <ul className={styles.people}>
            {contact.people.map((person) => (
              <li key={person._key} className={styles.person}>
                {person.image?.asset?._id && (
                  <div className={styles.avatar}>
                    <SanityImage value={person.image} width={448} sizes="224px" />
                  </div>
                )}
                <div className={styles.personCard}>
                  <Title as="h3">{person.name}</Title>
                  {person.position && <Text>{person.position}</Text>}
                </div>
              </li>
            ))}
          </ul>
        </Container>
      )}

      {contact?.cover && (
        <CoverImage value={contact.cover} placement="bottom" className={styles.footerCover} />
      )}
    </main>
  );
}
