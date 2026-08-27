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
import { accents } from '@/lib/routes';
import styles from './contact.module.css';

export const metadata: Metadata = { title: 'Kontakt' };

export default async function ContactPage() {
  const contact = await client.fetch(CONTACT_QUERY);

  return (
    <main style={{ '--accent': accents.contact } as CSSProperties}>
      {contact?.cover && <CoverImage value={contact.cover} placement="top" priority />}

      <Container width="narrow">
        <Heading>Kontakt</Heading>

        <div className={styles.details}>
          {contact?.phone && (
            <p>
              <Label>Telefón</Label>
              <br />
              <Link href={`tel:${contact.phone}`}>{contact.phone}</Link>
            </p>
          )}
          {contact?.email && (
            <p>
              <Label>E-mail</Label>
              <br />
              <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
            </p>
          )}
          {contact?.address && (
            <div>
              <Label>Adresa</Label>
              <RichText value={contact.address} />
            </div>
          )}
          {contact?.administrativeInfo && (
            <div>
              <Label>Administratívne údaje</Label>
              <RichText value={contact.administrativeInfo} />
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
                    <SanityImage value={person.image} width={320} sizes="160px" />
                  </div>
                )}
                <Text as="span" className={styles.name}>
                  {person.name}
                </Text>
                {person.position && (
                  <Text as="span" className={styles.position}>
                    {person.position}
                  </Text>
                )}
              </li>
            ))}
          </ul>
        </Container>
      )}

      {contact?.cover && <CoverImage value={contact.cover} placement="bottom" />}
    </main>
  );
}
