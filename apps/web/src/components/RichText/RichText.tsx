import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { Link } from '../Link/Link';
import styles from './RichText.module.css';

const components: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => (
      <Link href={(value as { href: string })?.href ?? '#'}>{children}</Link>
    ),
  },
};

type RichTextProps = {
  // Accepts the generated Portable Text array shapes from any query.
  value?: readonly unknown[] | null;
  className?: string;
};

/** Renders richTextBasic / richTextFull portable text with shared styling. */
export function RichText({ value, className }: RichTextProps) {
  if (!value || value.length === 0) return null;
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <PortableText value={value as PortableTextBlock[]} components={components} />
    </div>
  );
}
