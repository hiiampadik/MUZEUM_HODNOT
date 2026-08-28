import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { HOME_QUERY, HOME_TILE_COVERS_QUERY, EXHIBITIONS_QUERY } from '@/sanity/queries';
import { ogImageUrl } from '@/sanity/lib/og';
import type { SanityImageValue } from '@/components/SanityImage/SanityImage';
import { siteUrl } from '@/sanity/env';
import { pageMetadata } from '@/lib/metadata';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { SanityImage } from '@/components/SanityImage/SanityImage';
import { Button } from '@/components/Button/Button';
import { IntroBubble } from '@/components/IntroBubble/IntroBubble';
import { Link } from '@/components/Link/Link';
import {Title, Label, Text, Underline, Heading} from '@/components/Typography/Typography';
import { groupExhibitions, type ExhibitionCard } from '@/lib/exhibitions';
import { routes, accents, accentPalette } from '@/lib/routes';
import { formatDateRange } from '@/lib/format';
import {site, home as homeStrings, pages} from '@/lib/strings';
import styles from './home.module.css';

type Tile = {
  key: string;
  eyebrow: string;
  title: ReactNode;
  cta: string;
  emoji: string;
  accent: string;
  href: string;
  image?: SanityImageValue;
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
  name: site.name,
  url: siteUrl,
};

export default async function HomePage() {
  const [home, tileCovers, exhibitions] = await Promise.all([
    client.fetch(HOME_QUERY),
    client.fetch(HOME_TILE_COVERS_QUERY),
    client.fetch(EXHIBITIONS_QUERY),
  ]);

  const { active, upcoming, past } = groupExhibitions(exhibitions);

  // Fixed hero tiles. The first (current exhibitions) only appears when some exist.
  const activeExhibition = active[0];
  const tiles: Tile[] = [];
  if (activeExhibition) {
    tiles.push({
      key: 'exhibitions',
      eyebrow: homeStrings.currentExhibitions,
      title: <Underline>{activeExhibition.title ?? homeStrings.currentExhibitions}</Underline>,
      cta: homeStrings.showMore,
      emoji: '👀',
      accent: accents.exhibition,
      href:
        activeExhibition.canOpenDetail && activeExhibition.slug
          ? routes.exhibition(activeExhibition.slug)
          : '#vystavy',
      image: activeExhibition.cover,
    });
  }
  tiles.push({
    key: 'valueGenerator',
    eyebrow: homeStrings.forSchools,
    title: (
      <>
        <Underline>{homeStrings.valueGeneratorLead}</Underline>
        {homeStrings.valueGeneratorSuffix}
      </>
    ),
    cta: homeStrings.open,
    emoji: '🔮',
    accent: accents.valueGenerator,
    href: routes.valueGenerator,
    image: tileCovers?.valueGenerator,
  });
  tiles.push({
    key: 'experientialEducation',
    eyebrow: homeStrings.forTeachers,
    title: <Underline>{homeStrings.experientialEducationTitle}</Underline>,
    cta: homeStrings.open,
    emoji: '👻',
    accent: accents.experientialEducation,
    href: routes.experientialEducation,
    image: tileCovers?.experientialEducation,
  });

  return (
    <main className="page-main page-main--home" style={{ '--accent': accents.home } as CSSProperties}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {home?.topCover && (
        <CoverImage value={home.topCover} placement="top" priority background className="cover-bg-top" />
      )}

      {/* Hero tiles */}
      {tiles.length > 0 && (
        <Container>
          <h1 className={styles.siteTitle}>{site.name}</h1>
          <div className={styles.tiles}>
            {tiles.map((tile) => (
              <article
                key={tile.key}
                className={styles.tile}
                style={{ '--accent': tile.accent } as CSSProperties}
              >
                <div className={styles.tileHead}>
                  <Label>{tile.eyebrow}</Label>
                  <Title as="h2">
                    {tile.title}
                  </Title>
                  <Button href={tile.href} className={styles.tileButton} emoji={tile.emoji}>
                    {tile.cta}
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
            ))}
          </div>
        </Container>
      )}

      <div className={styles.spacer} />

      {/* Project intro bubble */}
      {home?.intro && (
        <Container>
          <div className={styles.bubble} style={{ '--accent': accents.home } as CSSProperties}>
            <div className={styles.bubbleBody}>
              <Title as="h2">
                <Underline>{homeStrings.introTitleLead}</Underline>
                {homeStrings.introTitleSuffix}
              </Title>
              <IntroBubble value={home?.intro} />
            </div>
            {home?.introImage?.asset?._id && (
              <div className={styles.bubbleAside}>
                <SanityImage value={home.introImage} width={800} sizes="(max-width: 768px) 100vw, 600px" />
              </div>
            )}
          </div>
        </Container>
      )}

      <div className={styles.spacer} />

      {/* Upcoming exhibitions */}
      {upcoming.length > 0 && (
        <Container as="section" className={styles.section}>
          <Title as="h2" underline className={styles.sectionTitle}>
            {homeStrings.upcoming}
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
            {homeStrings.past}
          </Title>
          <div className={styles.pastList}>
            {past.map((ex, i) => (
              <PastCard key={ex._id} exhibition={ex} accent={accentPalette[i % accentPalette.length]} />
            ))}
          </div>
        </Container>
      )}

      {home?.bottomCover && (
        <CoverImage value={home.bottomCover} placement="bottom" background className="cover-bg-bottom" />
      )}
    </main>
  );
}

function UpcomingRow({ exhibition, accent }: { exhibition: ExhibitionCard; accent: string }) {
  const year = exhibition.startDate?.slice(0, 4);
  const place = exhibition.place;
  const blurb = exhibition.summary;
  return (
    <div className={styles.upcomingRow} style={{ '--accent': accent } as CSSProperties}>
      <div>
        {year && <Label as="p">{year}</Label>}
        {place && <Label as="p">{place}</Label>}
        <Title as="h3">
          <Underline>{exhibition.title}</Underline>
        </Title>
      </div>
      {blurb && (
        <Text className={styles.rowExcerpt}>{blurb}</Text>
      )}
    </div>
  );
}

function PastCard({ exhibition, accent }: { exhibition: ExhibitionCard; accent: string }) {
  const { title, slug, startDate, endDate, canOpenDetail, cover, summary, roles, place } = exhibition;
  const roleList = roles ?? [];
  const body = (
    <>
      <div className={styles.pastBody}>
        <div className={styles.pastSection}>
          <div>
            <Label as="p">{formatDateRange(startDate, endDate)}</Label>
            {place && <Label as="p">{place}</Label>}
          </div>
          <Title as="h3">
            <Underline className={styles.pastCardUnderline}>{title}</Underline>
          </Title>
        </div>
        {roleList.length > 0 && (
          <>
            <hr className={styles.pastDivider} />
            <dl className={styles.pastRoles}>
              {roleList.map((r) => (
                <div key={r._key} className={styles.pastRole}>
                  <dt className={styles.pastRoleLabel}>{r.role}</dt>
                  <dd className={styles.pastRolePeople}>{r.people}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {summary && (
          <>
            <hr className={styles.pastDivider} />
            <div className={styles.pastSection}>
              <Text className={styles.rowExcerpt}>{summary}</Text>
            </div>
          </>
        )}
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
