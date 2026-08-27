import type { CSSProperties } from 'react';
import { RichText } from '../RichText/RichText';
import { SanityImage, type SanityImageValue } from '../SanityImage/SanityImage';
import { Title } from '../Typography/Typography';
import { accentPalette } from '@/lib/routes';
import styles from './PageBuilder.module.css';

type MaterialItem = {
  _key: string;
  title: string | null;
  url: string | null;
};

type Block = {
  _key: string;
  _type: string;
  content?: unknown;
  text?: string | null;
  level?: string | null;
  image?: SanityImageValue;
  alt?: string | null;
  materials?: MaterialItem[] | null;
};

function MaterialPills({ items }: { items: readonly MaterialItem[] }) {
  return (
    <div className={styles.pills}>
      {items.map((m) =>
        m.url ? (
          <a key={m._key} href={m.url} download className={styles.pill}>
            <span aria-hidden="true">📁</span>
            {m.title || 'Súbor'}
          </a>
        ) : null,
      )}
    </div>
  );
}

function renderBlock(block: Block, index: number) {
  const accent = accentPalette[index % accentPalette.length];

  switch (block._type) {
    case 'textBlock':
      return (
        <RichText key={block._key} value={block.content as unknown[]} className={styles.block} />
      );

    case 'headingBlock': {
      const level = block.level === 'h3' ? 'h3' : 'h2';
      return (
        <Title
          key={block._key}
          as={level}
          underline
          className={styles.heading}
          // Vary the underline accent per heading, matching the design.
          style={{ '--accent': accent } as CSSProperties}
        >
          {block.text}
        </Title>
      );
    }

    case 'decorativeImage':
      return (
        <div key={block._key} className={styles.decorative} data-decorative>
          <SanityImage value={block.image ?? null} alt={block.alt ?? ''} width={768} />
        </div>
      );

    case 'materialsBlock':
      return (
        <MaterialPills key={block._key} items={block.materials ?? []} />
      );

    case 'tileBlock': {
      const inner = Array.isArray(block.content) ? (block.content as Block[]) : [];
      return (
        <div key={block._key} className={styles.card}>
          {inner.map((b, i) => renderBlock(b, i))}
        </div>
      );
    }

    default:
      return null;
  }
}

export function PageBuilder({ content }: { content?: readonly Block[] | null }) {
  if (!content || content.length === 0) return null;
  return <div className={styles.builder}>{content.map((b, i) => renderBlock(b, i))}</div>;
}
