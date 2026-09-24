'use client';

import { RichText } from '../RichText/RichText';
import styles from './IntroBubble.module.css';

type IntroBubbleProps = {
  value?: readonly unknown[] | null;
};

/** Project description: a single rich-text block, always rendered in full. */
export function IntroBubble({ value }: IntroBubbleProps) {
  if (!value || value.length === 0) return null;

  return (
    <div className={styles.root}>
      <div className={styles.text}>
        <RichText value={value} />
      </div>
    </div>
  );
}
