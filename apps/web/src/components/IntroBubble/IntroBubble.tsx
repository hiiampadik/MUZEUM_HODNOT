'use client';

import { useState, useId } from 'react';
import { RichText } from '../RichText/RichText';
import { Button } from '../Button/Button';
import { common } from '@/lib/strings';
import styles from './IntroBubble.module.css';

type IntroBubbleProps = {
  value?: readonly unknown[] | null;
};

/**
 * Project description: a single rich-text block. Collapsed it shows ~15 lines
 * that fade out at the bottom; a button expands it to the full text.
 */
export function IntroBubble({ value }: IntroBubbleProps) {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  if (!value || value.length === 0) return null;

  return (
    <div className={styles.root}>
      <div
        id={regionId}
        className={`${styles.text} ${open ? '' : styles.clamped}`}
      >
        <RichText value={value} />
      </div>
      <Button
        variant="primary"
        emoji={open ? '⬆️' : '⬇️'}
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? common.collapse : common.readMore}
      </Button>
    </div>
  );
}
