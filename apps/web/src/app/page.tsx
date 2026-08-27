import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { HOME_QUERY, EXHIBITIONS_QUERY } from '@/sanity/queries';
import { ogImageUrl } from '@/sanity/lib/og';
import { siteUrl } from '@/sanity/env';
import { pageMetadata } from '@/lib/metadata';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { Tile } from '@/components/Tile/Tile';
import { IntroBubble } from '@/components/IntroBubble/IntroBubble';
import { ExhibitionCard } from '@/components/ExhibitionCard/ExhibitionCard';
import { Heading, Title } from '@/components/Typography/Typography';
import { groupExhibitions } from '@/lib/exhibitions';
import { routes, accents } from '@/lib/routes';
import styles from './home.module.css';

const tileHref: Record<string, string> = {
  valueGenerator: routes.valueGenerator,
  experientialEducation: routes.experientialEducation,
  exhibitions: '#vystavy',
};

export async function generateMetadata(): Promise<Metadata> {
  const home = await client.fetch(HOME_QUERY);
  return pageMetadata({
    description: home?.metaDescription,
    image: ogImageUrl(home?.cover),
    path: routes.home,
  });
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Múzeum hodnôt',
  url: siteUrl,
};

export default async function HomePage() {
  const [home, exhibitions] = await Promise.all([
    client.fetch(HOME_QUERY),
    client.fetch(EXHIBITIONS_QUERY),
  ]);

  const { active, upcoming, past } = groupExhibitions(exhibitions);

  const tiles = (home?.heroTiles ?? []).filter((tile) => {
    // Hide the "current exhibitions" tile when there are none.
    if (tile.target === 'exhibitions') return active.length > 0;
    return true;
  });

  return (
    <main style={{ '--accent': accents.home } as CSSProperties}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {home?.cover && <CoverImage value={home.cover} placement="top" priority />}

      <Container>
        <Heading>Múzeum hodnôt</Heading>

        {tiles.length > 0 && (
          <div className={styles.tiles}>
            {tiles.map((tile) => {
              const href =
                tile.target === 'custom'
                  ? tile.customLink?.href ?? '#'
                  : tileHref[tile.target ?? ''] ?? '#';
              return (
                <Tile
                  key={tile._key}
                  title={tile.title ?? ''}
                  href={href}
                  image={tile.image}
                />
              );
            })}
          </div>
        )}

        {(home?.introExcerpt || home?.introRest) && (
          <div className={styles.intro}>
            <IntroBubble excerpt={home?.introExcerpt} rest={home?.introRest} />
          </div>
        )}
      </Container>

      <Container as="section" className={styles.section}>
        <div id="vystavy" />

        {active.length > 0 && (
          <div className={styles.section}>
            <Title as="h2" underline className={styles.sectionTitle}>
              Aktuálne výstavy
            </Title>
            <div className={styles.grid}>
              {active.map((ex) => (
                <ExhibitionCard key={ex._id} exhibition={ex} active />
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className={styles.section}>
            <Title as="h2" underline className={styles.sectionTitle}>
              Chystané výstavy
            </Title>
            <div className={styles.grid}>
              {upcoming.map((ex) => (
                <ExhibitionCard key={ex._id} exhibition={ex} compact />
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div className={styles.section}>
            <Title as="h2" underline className={styles.sectionTitle}>
              Uplynulé výstavy
            </Title>
            <div className={styles.grid}>
              {past.map((ex) => (
                <ExhibitionCard key={ex._id} exhibition={ex} compact />
              ))}
            </div>
          </div>
        )}
      </Container>

      {home?.cover && <CoverImage value={home.cover} placement="bottom" />}
    </main>
  );
}
