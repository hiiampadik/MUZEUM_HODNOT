import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { HOME_QUERY, EXHIBITIONS_QUERY } from '@/sanity/queries';
import { ogImageUrl } from '@/sanity/lib/og';
import { siteUrl } from '@/sanity/env';
import { pageMetadata } from '@/lib/metadata';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { SanityImage } from '@/components/SanityImage/SanityImage';
import { Button } from '@/components/Button/Button';
import { IntroBubble } from '@/components/IntroBubble/IntroBubble';
import { Link } from '@/components/Link/Link';
import { Title, Label, Text } from '@/components/Typography/Typography';
import { groupExhibitions, type ExhibitionCard } from '@/lib/exhibitions';
import { routes, accents, accentPalette } from '@/lib/routes';
import { formatDateRange } from '@/lib/format';
import styles from './home.module.css';

type TargetPreset = {
  eyebrow: string;
  cta: string;
  emoji: string;
  accent: string;
  href: string;
};

function tilePreset(target: string | null | undefined, exhibitionsHref: string): TargetPreset {
  switch (target) {
    case 'exhibitions':
      return { eyebrow: 'Aktuálne výstavy', cta: 'Zobraziť viac', emoji: '👀', accent: accents.exhibition, href: exhibitionsHref };
    case 'valueGenerator':
      return { eyebrow: 'Pre školy', cta: 'Otvoriť', emoji: '🔮', accent: accents.valueGenerator, href: routes.valueGenerator };
    case 'experientialEducation':
      return { eyebrow: 'Pre učiteľov', cta: 'Otvoriť', emoji: '👻', accent: accents.experientialEducation, href: routes.experientialEducation };
    default:
      return { eyebrow: '', cta: 'Otvoriť', emoji: '➡️', accent: accents.home, href: '#' };
  }
}

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

  const activeOpenable = active.find((e) => e.canOpenDetail && e.slug);
  const exhibitionsHref = activeOpenable?.slug
    ? routes.exhibition(activeOpenable.slug)
    : '#vystavy';

  const tiles = (home?.heroTiles ?? []).filter((tile) =>
    tile.target === 'exhibitions' ? active.length > 0 : true,
  );

  return (
    <main style={{ '--accent': accents.home } as CSSProperties}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="sr-only">Múzeum hodnôt</h1>

      {home?.cover && (
        <div className={styles.hero}>
          <CoverImage
            value={home.cover}
            placement="top"
            priority
            className={styles.heroCover}
          />
        </div>
      )}

      {/* Hero tiles */}
      {tiles.length > 0 && (
        <Container className={`${styles.tilesWrap} ${home?.cover ? styles.tilesOverlap : ''}`}>
          <div className={styles.tiles}>
            {tiles.map((tile) => {
              const preset = tilePreset(tile.target, exhibitionsHref);
              const href =
                tile.target === 'custom' ? tile.customLink?.href ?? '#' : preset.href;
              const cta =
                tile.target === 'custom' ? tile.customLink?.label ?? preset.cta : preset.cta;
              const title =
                tile.title ||
                (tile.target === 'exhibitions' ? active[0]?.title : '') ||
                '';
              return (
                <article
                  key={tile._key}
                  className={styles.tile}
                  style={{ '--accent': preset.accent } as CSSProperties}
                >
                  <div className={styles.tileHead}>
                    {preset.eyebrow && <Label>{preset.eyebrow}</Label>}
                    <Title as="h2" underline>
                      {title}
                    </Title>
                    <Button href={href} className={styles.tileButton}>
                      <span aria-hidden="true">{preset.emoji}</span>
                      {cta}
                    </Button>
                  </div>
                  {tile.image?.asset?._id && (
                    <div className={styles.tileMedia}>
                      <SanityImage
                        value={tile.image}
                        width={700}
                        sizes="(max-width: 900px) 100vw, 400px"
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </Container>
      )}

      {/* Project intro bubble */}
      {(home?.introTitle || home?.introExcerpt) && (
        <Container>
          <div className={styles.bubble} style={{ '--accent': accents.home } as CSSProperties}>
            <div className={styles.bubbleBody}>
              {home?.introTitle && (
                <Title as="h2" underline>
                  {home.introTitle}
                </Title>
              )}
              <IntroBubble excerpt={home?.introExcerpt} rest={home?.introRest} />
            </div>
            {home?.introImage?.asset?._id && (
              <div className={styles.bubbleAside}>
                <SanityImage value={home.introImage} width={800} sizes="(max-width: 768px) 100vw, 600px" />
              </div>
            )}
          </div>
        </Container>
      )}

      {/* Upcoming exhibitions */}
      {upcoming.length > 0 && (
        <Container as="section" className={styles.section}>
          <Title as="h2" underline className={styles.sectionTitle}>
            Chystané výstavy
          </Title>
          <div className={styles.upcomingList}>
            {upcoming.map((ex, i) => (
              <UpcomingRow key={ex._id} exhibition={ex} accent={accentPalette[i % accentPalette.length]} />
            ))}
          </div>
        </Container>
      )}

      {/* Past exhibitions */}
      {past.length > 0 && (
        <Container as="section" className={styles.section}>
          <div id="vystavy" />
          <Title as="h2" underline className={styles.sectionTitle}>
            Uplynulé
          </Title>
          <div className={styles.pastList}>
            {past.map((ex, i) => (
              <PastCard key={ex._id} exhibition={ex} accent={accentPalette[i % accentPalette.length]} />
            ))}
          </div>
        </Container>
      )}

      {home?.cover && (
        <CoverImage value={home.cover} placement="bottom" className={styles.footerCover} />
      )}
    </main>
  );
}

function UpcomingRow({ exhibition, accent }: { exhibition: ExhibitionCard; accent: string }) {
  const year = exhibition.startDate?.slice(0, 4);
  return (
    <div className={styles.upcomingRow} style={{ '--accent': accent } as CSSProperties}>
      <div>
        {year && <Label as="p">{year}</Label>}
        <Title as="h3" underline>
          {exhibition.title}
        </Title>
      </div>
      {exhibition.excerpt && (
        <Text className={styles.rowExcerpt}>{exhibition.excerpt}</Text>
      )}
    </div>
  );
}

function PastCard({ exhibition, accent }: { exhibition: ExhibitionCard; accent: string }) {
  const { title, slug, startDate, endDate, canOpenDetail, cover, excerpt } = exhibition;
  const body = (
    <>
      <div className={styles.pastBody}>
        <Label as="p">{formatDateRange(startDate, endDate)}</Label>
        <Title as="h3" underline>
          {title}
        </Title>
        {excerpt && <Text className={styles.rowExcerpt}>{excerpt}</Text>}
      </div>
      {cover?.asset?._id && (
        <div className={styles.pastMedia}>
          <SanityImage value={cover} width={800} sizes="(max-width: 640px) 100vw, 50vw" />
        </div>
      )}
    </>
  );

  const style = { '--accent': accent } as CSSProperties;

  if (canOpenDetail && slug) {
    return (
      <Link href={routes.exhibition(slug)} className={styles.pastCard} style={style}>
        {body}
      </Link>
    );
  }
  return (
    <div className={styles.pastCard} style={style}>
      {body}
    </div>
  );
}
