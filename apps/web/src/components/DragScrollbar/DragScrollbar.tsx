'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import styles from './DragScrollbar.module.css';

type DragScrollbarProps = {
  /** The horizontally-scrolling content (rendered inside a native scroll viewport). */
  children: ReactNode;
  /** Applied to the outer wrapper (viewport + scrollbar). */
  className?: string;
  /** Applied to the scroll viewport — put the flex row / gap here. */
  viewportClassName?: string;
  /** Accessible name for the scrollbar control (Slovak UI copy). */
  label?: string;
  /** How far arrow keys nudge the scroll, in px. */
  keyStep?: number;
};

/**
 * A horizontal scroll container with a custom, draggable scrollbar rendered
 * below it. The native scroll is preserved (wheel, trackpad, touch, keyboard on
 * the viewport) — the custom bar is a progressive enhancement that also acts as
 * a visible position indicator. Hidden when the content fits.
 */
export function DragScrollbar({
  children,
  className,
  viewportClassName,
  label = 'Posuvník galérie',
  keyStep = 200,
}: DragScrollbarProps) {
  const viewportId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startScroll: number } | null>(null);

  const [metrics, setMetrics] = useState({ scrollLeft: 0, scrollWidth: 0, clientWidth: 0 });
  const scrollable = metrics.scrollWidth > metrics.clientWidth + 1;

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setMetrics({
      scrollLeft: el.scrollLeft,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    });
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
    };
  }, [measure]);

  // Thumb geometry as fractions of the track (which spans the same width as the viewport).
  const maxScroll = Math.max(1, metrics.scrollWidth - metrics.clientWidth);
  const visibleFraction = metrics.scrollWidth > 0 ? metrics.clientWidth / metrics.scrollWidth : 1;
  const scrollFraction = metrics.scrollLeft / maxScroll;

  const setScroll = useCallback((next: number) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, Math.min(next, el.scrollWidth - el.clientWidth));
  }, []);

  const onThumbPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = viewportRef.current;
      if (!el) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft };
    },
    [],
  );

  const onThumbPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const track = trackRef.current;
      if (!drag || !track) return;
      const trackWidth = track.clientWidth;
      if (trackWidth <= 0) return;
      // Map thumb travel (px along the track) back to content scroll (px).
      const scrollPerTrackPx = maxScroll / (trackWidth * (1 - visibleFraction) || 1);
      setScroll(drag.startScroll + (e.clientX - drag.startX) * scrollPerTrackPx);
    },
    [maxScroll, visibleFraction, setScroll],
  );

  const endDrag = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onTrackPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      // Ignore clicks that land on the thumb itself (handled by the thumb).
      if (e.target !== e.currentTarget) return;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const clickFraction = (e.clientX - rect.left) / rect.width;
      // Center the thumb on the click point.
      setScroll((clickFraction - visibleFraction / 2) * maxScroll / (1 - visibleFraction || 1));
    },
    [visibleFraction, maxScroll, setScroll],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const el = viewportRef.current;
      if (!el) return;
      const page = el.clientWidth * 0.9;
      const handlers: Record<string, () => void> = {
        ArrowLeft: () => setScroll(el.scrollLeft - keyStep),
        ArrowRight: () => setScroll(el.scrollLeft + keyStep),
        PageUp: () => setScroll(el.scrollLeft - page),
        PageDown: () => setScroll(el.scrollLeft + page),
        Home: () => setScroll(0),
        End: () => setScroll(el.scrollWidth),
      };
      const handler = handlers[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    },
    [keyStep, setScroll],
  );

  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      <div
        id={viewportId}
        ref={viewportRef}
        className={`${styles.viewport} ${viewportClassName ?? ''}`}
      >
        {children}
      </div>

      <div className={styles.trackWrap} data-visible={scrollable || undefined}>
        <div ref={trackRef} className={styles.track} onPointerDown={onTrackPointerDown}>
          <div
            role="scrollbar"
            aria-label={label}
            aria-orientation="horizontal"
            aria-controls={viewportId}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(scrollFraction * 100) || 0}
            tabIndex={scrollable ? 0 : -1}
            className={styles.thumb}
            style={{
              width: `${visibleFraction * 100}%`,
              left: `${scrollFraction * (1 - visibleFraction) * 100}%`,
            }}
            onPointerDown={onThumbPointerDown}
            onPointerMove={onThumbPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
    </div>
  );
}
