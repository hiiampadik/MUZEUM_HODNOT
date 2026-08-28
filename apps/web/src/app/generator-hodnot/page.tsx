import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { VALUE_GENERATOR_QUERY } from '@/sanity/queries';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { PageBuilder } from '@/components/pagebuilder/PageBuilder';
import { ValueMap } from '@/components/ValueMap/ValueMap';
import { Heading, Title } from '@/components/Typography/Typography';
import { accents, routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/metadata';
import { pages } from '@/lib/strings';
import { ogImageUrl } from '@/sanity/lib/og';
import builder from '@/components/pagebuilder/builderPage.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(VALUE_GENERATOR_QUERY);
  return pageMetadata({
    title: pages.valueGenerator,
    image: ogImageUrl(page?.cover),
    path: routes.valueGenerator,
  });
}

export default async function ValueGeneratorPage() {
  const page = await client.fetch(VALUE_GENERATOR_QUERY);
  const points = page?.mapPoints ?? [];

  return (
    <main className="page-main" style={{ '--accent': accents.valueGenerator } as CSSProperties}>
      {page?.topCover && (
        <CoverImage value={page.topCover} placement="top" priority background className="cover-bg-top" />
      )}

      <Container width="narrow">
        <Heading className={builder.title}>{pages.valueGenerator}</Heading>
        <PageBuilder content={page?.content} />
      </Container>

      {points.length > 0 && (
        <Container>
          <ValueMap points={points} />
        </Container>
      )}

      {page?.bottomCover && (
        <CoverImage value={page.bottomCover} placement="bottom" background className="cover-bg-bottom" />
      )}
    </main>
  );
}
