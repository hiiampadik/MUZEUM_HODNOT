import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { VALUE_GENERATOR_QUERY } from '@/sanity/queries';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { PageBuilder } from '@/components/pagebuilder/PageBuilder';
import { ValueMap } from '@/components/ValueMap/ValueMap';
import { Heading, Title } from '@/components/Typography/Typography';
import { accents } from '@/lib/routes';

export const metadata: Metadata = { title: 'Generátor hodnôt' };

export default async function ValueGeneratorPage() {
  const page = await client.fetch(VALUE_GENERATOR_QUERY);
  const points = page?.mapPoints ?? [];

  return (
    <main style={{ '--accent': accents.valueGenerator } as CSSProperties}>
      {page?.cover && <CoverImage value={page.cover} placement="top" priority />}

      <Container width="narrow">
        <Heading>Generátor hodnôt</Heading>
        <PageBuilder content={page?.content} />
      </Container>

      {points.length > 0 && (
        <Container>
          <Title as="h2" underline>
            Mapa
          </Title>
          <ValueMap points={points} />
        </Container>
      )}

      {page?.cover && <CoverImage value={page.cover} placement="bottom" />}
    </main>
  );
}
