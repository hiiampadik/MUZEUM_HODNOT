import type {CSSProperties, ReactNode} from 'react';
import type {Metadata} from 'next';
import {client} from '@/sanity/lib/client';
import {EXHIBITIONS_QUERY, HOME_QUERY, HOME_TILE_COVERS_QUERY} from '@/sanity/queries';
import {ogImageUrl} from '@/sanity/lib/og';
import type {SanityImageValue} from '@/components/SanityImage/SanityImage';
import {SanityImage} from '@/components/SanityImage/SanityImage';
import {siteUrl} from '@/sanity/env';
import {pageMetadata} from '@/lib/metadata';
import {Container} from '@/components/Container/Container';
import {CoverImage} from '@/components/CoverImage/CoverImage';
import {Button} from '@/components/Button/Button';
import {Link} from '@/components/Link/Link';
import {Label, Text, Title, Underline} from '@/components/Typography/Typography';
import {type ExhibitionCard, groupExhibitions} from '@/lib/exhibitions';
import {accentPalette, accents, routes} from '@/lib/routes';
import {formatDateRange} from '@/lib/format';
import {home as homeStrings, site} from '@/lib/strings';
import hover from '@/components/shared/emojiHover.module.css';
import styles from './home.module.css';

/** One clickable line inside a hero tile: accented title + its own button. */
type TileEntry = {
  key: string;
  title: ReactNode;
  cta: string;
  emoji: string;
  accent: string;
  href: string;
};

type Tile = {
  key: string;
  eyebrow: ReactNode;
  entries: TileEntry[];
  image?: SanityImageValue;
  /** Single-destination tiles stay one big hit area; multi-entry ones don't. */
  stretch?: boolean;
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

  // Fixed hero tiles. The first lists every currently running exhibition, one
  // under another, and only appears when there is at least one. Each gets its
  // own accent from the cycling palette; the cover comes from the first one.
  const tiles: Tile[] = [];
  if (active.length > 0) {
    tiles.push({
      key: 'exhibitions',
      eyebrow: homeStrings.currentExhibitions,
      entries: active.map((exhibition, i) => ({
        key: exhibition._id,
        title: <Underline>{exhibition.title ?? homeStrings.currentExhibitions}</Underline>,
        cta: homeStrings.showMore,
        emoji: '👀',
        accent: accentPalette[i % accentPalette.length],
        href:
          exhibition.canOpenDetail && exhibition.slug
            ? routes.exhibition(exhibition.slug)
            : '#vystavy',
      })),
      image: active[0].cover,
      // With a single exhibition there is nothing to disambiguate, so the tile
      // behaves like the other two: the whole card is one hit area.
      stretch: active.length === 1,
    });
  }
  tiles.push({
    key: 'valueGenerator',
    eyebrow: (
      <>
        {homeStrings.forSchoolsLead}
        <br />
        {homeStrings.forSchoolsSuffix}
      </>
    ),
    entries: [
      {
        key: 'valueGenerator',
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
      },
    ],
    image: tileCovers?.valueGenerator,
    stretch: true,
  });
  tiles.push({
    key: 'experientialEducation',
    eyebrow: (
      <>
        {homeStrings.forTeachersLead}
        <br />
        {homeStrings.forTeachersSuffix}
      </>
    ),
    entries: [
      {
        key: 'experientialEducation',
        title: <Underline>{homeStrings.experientialEducationTitle}</Underline>,
        cta: homeStrings.open,
        emoji: '📚',
        accent: accents.experientialEducation,
        href: routes.experientialEducation,
      },
    ],
    image: tileCovers?.experientialEducation,
    stretch: true,
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

      <h1 className={'sr-only'}>{site.name}</h1>

      <div className={styles.hero}>
        {/* Hero tiles */}
        {tiles.length > 0 && (
          <Container className={styles.tilesWrap}>
            <div className={styles.tiles}>
              {tiles.map((tile) => (
                <article
                  key={tile.key}
                  className={`${styles.tile} ${tile.stretch ? styles.tileStretch : ''}`}
                >
                  <div className={styles.tileHead}>
                    <Label>{tile.eyebrow}</Label>
                    {tile.entries.map((entry) => (
                      <div
                        key={entry.key}
                        className={`${styles.tileEntry} ${hover.group}`}
                        style={{ '--accent': entry.accent } as CSSProperties}
                      >
                        <Title as="h2">
                          <Link
                            href={entry.href}
                            className={`${styles.tileTitleLink} ${hover.groupTrigger}`}
                          >
                            {entry.title}
                          </Link>
                        </Title>
                        <Button href={entry.href} className={styles.tileButton} emoji={entry.emoji}>
                          {entry.cta}
                        </Button>
                      </div>
                    ))}
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
      </div>

      <div className={styles.spacer} />

      {/* Upcoming exhibitions */}
      {upcoming.length > 0 && (
        <Container as="section" className={styles.section}>
          <Title
            as="h2"
            underline
            className={styles.sectionTitle}
            style={{ '--accent': accents.exhibition } as CSSProperties}
          >
            {homeStrings.upcoming}
          </Title>
          <div className={styles.upcomingList}>
            {upcoming.map((ex) => (
              <UpcomingRow key={ex._id} exhibition={ex} accent={accents.exhibition} />
            ))}
          </div>
        </Container>
      )}

      {/* Past exhibitions */}
      {past.length > 0 && (
        <Container as="section" className={styles.section}>
          <div id="vystavy" />
          <Title
            as="h2"
            underline
            className={styles.sectionTitle}
            style={{ '--accent': accents.exhibition } as CSSProperties}
          >
            {homeStrings.past}
          </Title>
          <div className={styles.pastList}>
            {past.map((ex) => (
              <PastCard key={ex._id} exhibition={ex} accent={accents.exhibition} />
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
      <div className={styles.upcomingRowTop}>
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
