import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { EXHIBITION_QUERY, EXHIBITION_SLUGS_QUERY } from '@/sanity/queries';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { SanityImage } from '@/components/SanityImage/SanityImage';
import { RichText } from '@/components/RichText/RichText';
import { Pill } from '@/components/Pill/Pill';
import { Heading, Title, Label, Text } from '@/components/Typography/Typography';
import { accents, routes, accentPalette } from '@/lib/routes';
import { pageMetadata } from '@/lib/metadata';
import { ogImageUrl } from '@/sanity/lib/og';
import { formatDate, formatDateRange } from '@/lib/format';
import { categorize } from '@/lib/exhibitions';
import { getExhibitionStrings, type Locale } from '@/lib/strings';
import styles from './exhibition.module.css';

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await client.fetch(EXHIBITION_SLUGS_QUERY);
  const params = slugs
    .map((s) => s.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
  return params.length > 0 ? params : [{ slug: '_none' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exhibition = await client.fetch(EXHIBITION_QUERY, { slug });
  const locale: Locale = exhibition?.foreignLanguage ? 'en' : 'sk';
  return pageMetadata({
    title: exhibition?.title ?? getExhibitionStrings(locale).fallbackTitle,
    description: exhibition?.metaDescription,
    image: ogImageUrl(exhibition?.cover),
    path: routes.exhibition(slug),
  });
}

export default async function ExhibitionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const exhibition = await client.fetch(EXHIBITION_QUERY, { slug });

  if (!exhibition || !exhibition.canOpenDetail) notFound();

  const {
    title,
    place,
    openingDate,
    startDate,
    endDate,
    roles,
    cover,
    topCover,
    bottomCover,
    gallery,
    abstract,
    materials,
    links,
    contributors,
  } = exhibition;

  const locale: Locale = exhibition.foreignLanguage ? 'en' : 'sk';
  const t = getExhibitionStrings(locale);
  const isActive = categorize({ startDate, endDate }) === 'active';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ExhibitionEvent',
    name: title,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(place && { location: { '@type': 'Place', name: place } }),
    ...(exhibition.metaDescription && { description: exhibition.metaDescription }),
    ...(ogImageUrl(cover) && { image: ogImageUrl(cover) }),
  };

  return (
    <main
      className="page-main"
      lang={locale}
      style={{ '--accent': accents.exhibition } as CSSProperties}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {topCover && (
        <CoverImage value={topCover} placement="top" priority background className="cover-bg-top" />
      )}

      <Container width="content">
        <header className={styles.header}>
          {place && <Label>{place}</Label>}
          <Heading className={styles.headerTitle}>{title}</Heading>
          {isActive && <span className={styles.tag}>{t.current}</span>}
        </header>

        <dl className={styles.meta}>
          {(startDate || endDate) && (
            <div className={styles.metaItem}>
              <Label as="dt">{t.duration}</Label>
              <Text as="dd" className={styles.metaValue}>
                {formatDateRange(startDate, endDate)}
              </Text>
            </div>
          )}
          {openingDate && (
            <div className={styles.metaItem}>
              <Label as="dt">{t.opening}</Label>
              <Text as="dd" className={styles.metaValue}>
                {formatDate(openingDate)}
              </Text>
            </div>
          )}
          {roles?.map((role) => (
            <div className={styles.metaItem} key={role._key}>
              <Label as="dt">{role.role}</Label>
              <Text as="dd" className={styles.metaValue}>
                {role.people}
              </Text>
            </div>
          ))}
        </dl>
      </Container>

      {gallery && gallery.length > 0 && (
        <Container width="content">
          <ul className={styles.gallery}>
            {gallery.map((photo) => (
              <li key={photo.asset?._id} className={styles.photo}>
                <SanityImage value={photo} width={1000} sizes="80vw" />
              </li>
            ))}
          </ul>
        </Container>
      )}

      <Container width="narrow">
        {abstract && <RichText value={abstract} className={styles.abstract} />}

        {((materials && materials.length > 0) || (links && links.length > 0)) && (
          <div className={styles.attachments}>
            {materials && materials.length > 0 && (
              <div>
                <Title as="h2" className={styles.attachTitle}>
                  {t.materials}
                </Title>
                <div className={styles.pills}>
                  {materials.map((m) =>
                    m.url ? (
                      <Pill
                        key={m._key}
                        href={m.url}
                        download
                        color="#272727"
                        emoji={m.emoji || '📁'}
                      >
                        {m.title || t.fileFallback}
                      </Pill>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {links && links.length > 0 && (
              <div>
                <Title as="h2" className={styles.attachTitle}>
                  {t.links}
                </Title>
                <div className={styles.pills}>
                  {links.map((link, i) => (
                    <Pill
                      key={link._key}
                      href={link.href ?? '#'}
                      color={accentPalette[i % accentPalette.length]}
                      emoji={link.emoji || '↗'}
                    >
                      {link.label}
                    </Pill>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {contributors && contributors.length > 0 && (
          <section className={styles.credits}>
            <Title as="h2" className={styles.creditsTitle}>
              {t.contributors}
            </Title>
            <div className={styles.creditsList}>
              {contributors.map((c) => (
                <div className={styles.creditRole} key={c._key}>
                  <Label as="p">{c.role}</Label>
                  <Text as="p" className={styles.metaValue}>
                    {c.people}
                  </Text>
                </div>
              ))}
            </div>
          </section>
        )}
      </Container>

      {bottomCover && (
        <CoverImage value={bottomCover} placement="bottom" background className="cover-bg-bottom" />
      )}
    </main>
  );
}
