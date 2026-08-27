import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import {
  EXHIBITION_QUERY,
  EXHIBITION_SLUGS_QUERY,
} from '@/sanity/queries';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { SanityImage } from '@/components/SanityImage/SanityImage';
import { RichText } from '@/components/RichText/RichText';
import { Materials } from '@/components/Materials/Materials';
import { Link } from '@/components/Link/Link';
import { Heading, Title, Label, Text } from '@/components/Typography/Typography';
import { accents, routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/metadata';
import { ogImageUrl } from '@/sanity/lib/og';
import { formatDate, formatDateRange } from '@/lib/format';
import styles from './exhibition.module.css';

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await client.fetch(EXHIBITION_SLUGS_QUERY);
  const params = slugs
    .map((s) => s.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));

  // `output: export` rejects an empty param list for a dynamic route. When there
  // are no openable exhibitions, emit a single placeholder that renders a 404.
  return params.length > 0 ? params : [{ slug: '_none' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exhibition = await client.fetch(EXHIBITION_QUERY, { slug });
  return pageMetadata({
    title: exhibition?.title ?? 'Výstava',
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
    gallery,
    abstract,
    materials,
    links,
    contributors,
  } = exhibition;

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
    <main style={{ '--accent': accents.exhibition } as CSSProperties}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {cover && <CoverImage value={cover} placement="top" priority />}

      <Container width="narrow">
        <Heading>{title}</Heading>

        <dl className={styles.meta}>
          {place && (
            <div className={styles.metaRow}>
              <Label as="dt">Miesto</Label>
              <Text as="dd">{place}</Text>
            </div>
          )}
          {openingDate && (
            <div className={styles.metaRow}>
              <Label as="dt">Vernisáž</Label>
              <Text as="dd">{formatDate(openingDate)}</Text>
            </div>
          )}
          {(startDate || endDate) && (
            <div className={styles.metaRow}>
              <Label as="dt">Trvanie</Label>
              <Text as="dd">{formatDateRange(startDate, endDate)}</Text>
            </div>
          )}
          {roles?.map((role) => (
            <div className={styles.metaRow} key={role._key}>
              <Label as="dt">{role.role}</Label>
              <Text as="dd">{role.people}</Text>
            </div>
          ))}
        </dl>

        {abstract && <RichText value={abstract} className={styles.abstract} />}
      </Container>

      {gallery && gallery.length > 0 && (
        <Container width="full" className={styles.gallerySection}>
          <ul className={styles.gallery}>
            {gallery.map((photo) => (
              <li key={photo.asset?._id} className={styles.photo}>
                <SanityImage value={photo} width={1000} sizes="(max-width: 768px) 100vw, 50vw" />
                {photo.photographer && (
                  <Text as="figcaption" className={styles.credit}>
                    Foto: {photo.photographer}
                  </Text>
                )}
              </li>
            ))}
          </ul>
        </Container>
      )}

      <Container width="narrow">
        {materials && materials.length > 0 && (
          <section className={styles.block}>
            <Title as="h2" underline>
              Materiály
            </Title>
            <Materials items={materials} />
          </section>
        )}

        {links && links.length > 0 && (
          <section className={styles.block}>
            <Title as="h2" underline>
              Odkazy
            </Title>
            <ul className={styles.links}>
              {links.map((link) => (
                <li key={link._key}>
                  <Link href={link.href ?? '#'}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {contributors && contributors.length > 0 && (
          <section className={styles.block}>
            <Title as="h2" underline>
              Ďalej sa podieľali
            </Title>
            <dl className={styles.meta}>
              {contributors.map((c) => (
                <div className={styles.metaRow} key={c._key}>
                  <Label as="dt">{c.role}</Label>
                  <Text as="dd">{c.people}</Text>
                </div>
              ))}
            </dl>
          </section>
        )}
      </Container>

      {cover && <CoverImage value={cover} placement="bottom" />}
    </main>
  );
}
