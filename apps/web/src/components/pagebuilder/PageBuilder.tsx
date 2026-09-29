import type { ReactNode } from 'react';
import { RichText } from '../RichText/RichText';
import { SanityImage, type SanityImageValue } from '../SanityImage/SanityImage';
import { Gallery, type GalleryPhoto } from '../Gallery/Gallery';
import { Title } from '../Typography/Typography';
import { Pill } from '../Pill/Pill';
import { common } from '@/lib/strings';
import styles from './PageBuilder.module.css';

type MaterialItem = {
  _key: string;
  title: string | null;
  emoji?: string | null;
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
  size?: string | null;
  images?: readonly GalleryPhoto[] | null;
  materials?: MaterialItem[] | null;
};

/** Image width options (schema: decorativeImage.size). */
type ImageSize = 'center' | 'text' | 'page';

function imageSize(value?: string | null): ImageSize {
  return value === 'text' || value === 'page' ? value : 'center';
}

/** Layout width a top-level block occupies. */
type Slot = 'narrow' | 'pageWide' | 'fullBleed';

function MaterialPills({ items }: { items: readonly MaterialItem[] }) {
  return (
    <div className={styles.pills}>
      {items.map((m) =>
        m.url ? (
          <Pill key={m._key} href={m.url} download color="#272727" emoji={m.emoji || '📁'}>
            {m.title || common.fileFallback}
          </Pill>
        ) : null,
      )}
    </div>
  );
}

/**
 * Wraps a top-level block in its layout width. Nested blocks (inside a tile)
 * skip the wrapper — the tile already constrains them. The data attributes
 * drive the sibling spacing rules in the stylesheet.
 */
function BlockSlot({
  slot,
  type,
  sub,
  className,
  children,
}: {
  slot: Slot;
  type: string;
  sub?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const classNames = [styles[slot], className].filter(Boolean).join(' ');
  return (
    <div className={classNames} data-block={type} data-sub={sub ? '' : undefined}>
      {children}
    </div>
  );
}

function renderBlock(block: Block, nested = false) {
  switch (block._type) {
    case 'textBlock': {
      const body = (
        <RichText key={block._key} value={block.content as unknown[]} className={styles.block} />
      );
      return nested ? (
        body
      ) : (
        <BlockSlot key={block._key} slot="narrow" type={block._type}>
          {body}
        </BlockSlot>
      );
    }

    case 'headingBlock': {
      const level = block.level === 'h3' ? 'h3' : 'h2';
      const isSub = level === 'h3';
      const heading = (
        <Title
          key={block._key}
          as={level}
          // Page-builder sub-headings are smaller and never underlined; only
          // section titles (h2) carry the accent underline.
          underline={!isSub}
          className={`${styles.heading} ${isSub ? styles.heading3 : ''}`}
        >
          {block.text}
        </Title>
      );
      return nested ? (
        heading
      ) : (
        <BlockSlot key={block._key} slot="narrow" type={block._type} sub={isSub}>
          {heading}
        </BlockSlot>
      );
    }

    case 'decorativeImage': {
      const size = imageSize(block.size);
      const isCenter = size === 'center';
      // Centered images keep the decorative (multiply / pixelated) treatment;
      // the wider ones are plain photos with the card radius.
      const image = (
        <div
          key={block._key}
          className={isCenter ? styles.decorative : styles.imageWide}
          data-decorative={isCenter ? '' : undefined}
        >
          <SanityImage
            value={block.image ?? null}
            alt={block.alt ?? ''}
            width={isCenter ? 768 : size === 'page' ? 2000 : 1200}
            sizes={isCenter ? undefined : size === 'page' ? '100vw' : '(max-width: 648px) 100vw, 600px'}
          />
        </div>
      );
      if (nested) return image;
      return (
        <BlockSlot
          key={block._key}
          slot={size === 'page' ? 'pageWide' : 'narrow'}
          type={block._type}
        >
          {image}
        </BlockSlot>
      );
    }

    case 'galleryBlock':
      // Nested galleries are not offered in the Studio (tiles exclude the block).
      return (
        <BlockSlot key={block._key} slot="fullBleed" type={block._type}>
          <Gallery images={block.images} />
        </BlockSlot>
      );

    case 'materialsBlock': {
      const pills = <MaterialPills key={block._key} items={block.materials ?? []} />;
      return nested ? (
        pills
      ) : (
        <BlockSlot key={block._key} slot="narrow" type={block._type} className={styles.pillsSlot}>
          {pills}
        </BlockSlot>
      );
    }

    case 'tileBlock': {
      const inner = Array.isArray(block.content) ? (block.content as Block[]) : [];
      return (
        <BlockSlot key={block._key} slot="narrow" type={block._type}>
          <div className={styles.card}>{inner.map((b) => renderBlock(b, true))}</div>
        </BlockSlot>
      );
    }

    default:
      return null;
  }
}

export function PageBuilder({ content }: { content?: readonly Block[] | null }) {
  if (!content || content.length === 0) return null;
  return <div className={styles.builder}>{content.map((b) => renderBlock(b))}</div>;
}
