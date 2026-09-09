'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { RichText } from '../RichText/RichText';
import { Button } from '../Button/Button';
import { common } from '@/lib/strings';
import styles from './IntroBubble.module.css';

type IntroBubbleProps = {
  value?: readonly unknown[] | null;
};

/**
 * Project description: a single rich-text block. Collapsed it shows ~15 lines
 * that fade out at the bottom; a button expands it to the full text — only
 * shown when the text is actually long enough to be clipped.
 */
export function IntroBubble({ value }: IntroBubbleProps) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const regionId = useId();

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    // scrollHeight reflects the full content regardless of the clamp's
    // overflow:hidden, so this stays accurate whether or not open is true.
    setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [value]);

  if (!value || value.length === 0) return null;

  return (
    <div className={styles.root}>
      <div
        ref={textRef}
        id={regionId}
        className={`${styles.text} ${open ? '' : styles.clamped}`}
      >
        <RichText value={value} />
      </div>
      {overflows && (
        <Button
          variant="primary"
          emoji={open ? '⬆️' : '⬇️'}
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? common.collapse : common.readMore}
        </Button>
      )}
    </div>
  );
}
