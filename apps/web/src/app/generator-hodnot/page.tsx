import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { VALUE_GENERATOR_QUERY } from '@/sanity/queries';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { PageBuilder } from '@/components/pagebuilder/PageBuilder';
import { ValueMap } from '@/components/ValueMap/ValueMap';
import { SchoolList } from '@/components/SchoolList/SchoolList';
// import { fetchDonationAmounts } from '@/lib/donations';
import { Heading, Title } from '@/components/Typography/Typography';
import { accents, routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/metadata';
import { revealOrder } from '@/lib/motion';
import { breadcrumbSchema } from '@/lib/schema';
import { JsonLd } from '@/components/JsonLd/JsonLd';
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
  // Unset value means "show".
  const showMap = page?.showMap !== false;
  // Funding is temporarily hidden in SchoolList, so the amounts are not fetched.
  // Last known raised amounts, baked into the HTML; refreshed in the browser.
  // const amounts = showMap && points.length > 0 ? await fetchDonationAmounts() : null;

  return (
    <main className="page-main" style={{ '--accent': accents.valueGenerator } as CSSProperties}>
      <JsonLd data={breadcrumbSchema({ name: pages.valueGenerator, path: routes.valueGenerator })} />

      <CoverImage value={page?.topCover} placement="top" priority background className="cover-bg-top" />

      <Container width="narrow">
        <Heading className={`${builder.titleCenter} reveal`} style={revealOrder(1)}>{pages.valueGenerator}</Heading>
      </Container>

      {showMap && points.length > 0 && (
        <>
          <Container width="narrow" className="reveal">
            <ValueMap points={points} />
          </Container>
          <Container className="reveal">
            <SchoolList schools={points} />
          </Container>
        </>
      )}

      {/* Full width: the builder constrains each block to its own layout width. */}
      <PageBuilder content={page?.content} />



      <CoverImage value={page?.bottomCover} placement="bottom" background className="cover-bg-bottom" />
    </main>
  );
}
