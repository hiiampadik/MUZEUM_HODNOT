'use client';

import { useCallback, useEffect, useRef, useState, useId } from 'react';
import { RichText } from '../RichText/RichText';
import { common } from '@/lib/strings';
import styles from './IntroBubble.module.css';

type IntroBubbleProps = {
  value?: readonly unknown[] | null;
};

/**
 * Project description: a single rich-text block. Collapsed it shows ~15 lines
 * that fade out at the bottom; a button expands it to the full text — only
 * shown when the text is actually long enough to be clipped.
 *
 * Expanding animates `max-height` between the two measured pixel heights, so
 * the block grows gradually and everything below it slides along in flow. The
 * clamp lives in CSS (so the first paint is clipped before JS runs) and is only
 * overridden by the measured inline value once we know both heights. While
 * open the cap is dropped to `none`, so reflows (resize, late fonts) are never
 * clipped by a stale pixel value.
 */
export function IntroBubble({ value }: IntroBubbleProps) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string | undefined>(undefined);
  const textRef = useRef<HTMLDivElement>(null);
  const sizes = useRef<{ collapsed: number; full: number } | null>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const regionId = useId();

  // Measure both ends of the animation by briefly forcing the clamp on and off.
  // It is one synchronous pass, so the browser never paints an intermediate
  // state — and it keeps the collapsed height defined in CSS alone.
  const measure = useCallback(() => {
    const el = textRef.current;
    if (!el) return null;
    const hadClamp = el.classList.contains(styles.clamped);
    const prevInline = el.style.maxHeight;

    el.style.maxHeight = '';
    el.classList.add(styles.clamped);
    const collapsed = el.clientHeight;

    el.classList.remove(styles.clamped);
    el.style.maxHeight = 'none';
    const full = el.scrollHeight;

    if (hadClamp) el.classList.add(styles.clamped);
    el.style.maxHeight = prevInline;

    sizes.current = { collapsed, full };
    return sizes.current;
  }, []);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const sync = () => {
      const next = measure();
      if (!next) return;
      setOverflows(next.full > next.collapsed + 1);
      setMaxHeight(openRef.current ? 'none' : `${next.collapsed}px`);
    };
    sync();
    // Body text is a webfont: remeasure once it lands, or both heights are off.
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) sync();
    });
    window.addEventListener('resize', sync);
    return () => {
      alive = false;
      window.removeEventListener('resize', sync);
    };
  }, [value, measure]);

  const toggle = () => {
    const el = textRef.current;
    const next = sizes.current ?? measure();
    if (!el || !next) {
      setOpen((v) => !v);
      return;
    }
    if (!open) {
      setMaxHeight(`${next.full}px`);
      setOpen(true);
      return;
    }
    // Collapsing has to start from a concrete height: while open the cap is
    // `none`, and `none → Npx` does not animate. Pin the current height first,
    // then clamp on the next frame.
    setMaxHeight(`${el.scrollHeight}px`);
    requestAnimationFrame(() => {
      setOpen(false);
      setMaxHeight(`${next.collapsed}px`);
    });
  };

  if (!value || value.length === 0) return null;

  return (
    <div className={styles.root}>
      <div
        ref={textRef}
        id={regionId}
        className={`${styles.text} ${open ? '' : styles.clamped}`}
        style={{ maxHeight }}
        onTransitionEnd={(e) => {
          // Drop the pixel cap once fully open so later reflows can grow it.
          if (e.target === e.currentTarget && e.propertyName === 'max-height' && open) {
            setMaxHeight('none');
          }
        }}
      >
        <RichText value={value} />
      </div>
      {overflows && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={regionId}
          onClick={toggle}
        >
          <span aria-hidden="true">{open ? '↑' : '↓'}</span>
          {open ? common.collapse : common.readMore}
        </button>
      )}
    </div>
  );
}
