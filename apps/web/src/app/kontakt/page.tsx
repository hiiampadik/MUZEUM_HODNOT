import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { CONTACT_QUERY } from '@/sanity/queries';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { SanityImage } from '@/components/SanityImage/SanityImage';
import { RichText } from '@/components/RichText/RichText';
import { Pill } from '@/components/Pill/Pill';
import { Heading, Title, Label, Text } from '@/components/Typography/Typography';
import { accents, routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/metadata';
import { pages, contact as contactStrings } from '@/lib/strings';
import { ogImageUrl } from '@/sanity/lib/og';
import styles from './contact.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const contact = await client.fetch(CONTACT_QUERY);
  return pageMetadata({
    title: pages.contact,
    image: ogImageUrl(contact?.cover),
    path: routes.contact,
  });
}

export default async function ContactPage() {
  const contact = await client.fetch(CONTACT_QUERY);

  return (
    <main className="page-main" style={{ '--accent': accents.contact } as CSSProperties}>
      {contact?.topCover && (
        <CoverImage value={contact.topCover} placement="top" priority background className="cover-bg-top" />
      )}

      <Container width="narrow">
        <Heading className={styles.headerTitle}>{pages.contact}</Heading>

        <div className={styles.details}>
          {contact?.phone && (
            <div className={styles.detailItem}>
              <Label>{contactStrings.phone}</Label>
              <Pill href={`tel:${contact.phone}`} color="#904646" emoji="☎️">
                {contact.phone}
              </Pill>
            </div>
          )}
          {contact?.email && (
            <div className={styles.detailItem}>
              <Label>{contactStrings.email}</Label>
              <Pill href={`mailto:${contact.email}`} color="#2b2b2b" emoji="💌">
                {contact.email}
              </Pill>
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

      {contact?.bottomCover && (
        <CoverImage value={contact.bottomCover} placement="bottom" background className="cover-bg-bottom" />
      )}
    </main>
  );
}
