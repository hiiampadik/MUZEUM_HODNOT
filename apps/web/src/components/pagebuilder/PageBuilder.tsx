import { RichText } from '../RichText/RichText';
import { SanityImage, type SanityImageValue } from '../SanityImage/SanityImage';
import { Title } from '../Typography/Typography';
import { Materials, type MaterialItem } from '../Materials/Materials';
import styles from './PageBuilder.module.css';

/**
 * Permissive block shape for the dynamic renderer. The page-builder content is a
 * discriminated union in the generated types; we narrow on `_type` here.
 */
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

function renderBlock(block: Block) {
  switch (block._type) {
    case 'textBlock':
      return <RichText key={block._key} value={block.content as unknown[]} />;

    case 'headingBlock': {
      const level = block.level === 'h3' ? 'h3' : 'h2';
      return (
        <Title key={block._key} as={level} underline className={styles.heading}>
          {block.text}
        </Title>
      );
    }

    case 'decorativeImage':
      return (
        <div key={block._key} className={styles.decorative} data-decorative>
          <SanityImage value={block.image ?? null} alt={block.alt ?? ''} width={1200} />
        </div>
      );

    case 'materialsBlock':
      return <Materials key={block._key} items={block.materials ?? []} />;

    case 'tileBlock': {
      const inner = Array.isArray(block.content) ? (block.content as Block[]) : [];
      return (
        <div key={block._key} className={styles.tile}>
          {inner.map(renderBlock)}
        </div>
      );
    }

    default:
      return null;
  }
}

export function PageBuilder({ content }: { content?: readonly Block[] | null }) {
  if (!content || content.length === 0) return null;
  return <div className={styles.builder}>{content.map(renderBlock)}</div>;
}
