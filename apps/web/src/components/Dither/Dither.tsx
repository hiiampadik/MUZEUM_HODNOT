'use client';

import { useEffect, useRef } from 'react';

type DitherProps = {
  /** Source image URL (Sanity CDN). */
  src: string;
  alt?: string;
  priority?: boolean;
  /** Fade direction: top dissolves downward, bottom dissolves upward. */
  placement?: 'top' | 'bottom';
  imgClassName?: string;
  canvasClassName?: string;
  /** Dither cell size in CSS px (Figma "Size"). Higher = chunkier dots. */
  size?: number;
  /** Quantization levels per channel (Figma "Levels"). */
  levels?: number;
};

/** Dither cell size in CSS px — the on-screen size of one dithered square. */
export const DITHER_CELL_SIZE = 2;
/** Quantization levels per colour channel. */
export const DITHER_LEVELS = 3;
/**
 * How strongly a pixel's distance from the page background turns into dot
 * density. Higher = darker/more-saturated pixels fill in sooner; pixels close
 * to the background stay (almost) empty, so light areas dissolve to nothing.
 */
export const DITHER_INK_GAIN = 1.4;

// 4×4 Bayer ordered-dither matrix (raw 0..15).
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function readBg(el: Element): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue('--color-bg').trim() || '#ececf0';
  const hex = raw.replace('#', '');
  const n = parseInt(
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Coverage ramp along the fade axis: 1 = full image (dense dots), 0 = pure
 * background (no dots). The dither dissolves by *density* — dots thin out but
 * never lose opacity — so the cover melts into the page background (Figma).
 * Coverage never reaches 1, so background always shows *between* dots (airy
 * halftone), and it thins early so plain body text below sits on near-clean bg.
 */
function coverageStops(placement: 'top' | 'bottom'): [number, number][] {
  const top: [number, number][] = [
    [0, 1],
    [0.12, 0.88],
    [0.32, 0.58],
    [0.52, 0.1],
    [1, 0],
  ];
  if (placement === 'top') return top;
  // bottom = vertical mirror
  return top.map(([p, c]) => [1 - p, c]).reverse() as [number, number][];
}

function coverageAt(stops: [number, number][], p: number): number {
  if (p <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (p >= last[0]) return last[1];
  for (let i = 1; i < stops.length; i++) {
    const [p1, c1] = stops[i];
    if (p <= p1) {
      const [p0, c0] = stops[i - 1];
      const t = (p - p0) / (p1 - p0);
      return c0 + (c1 - c0) * t;
    }
  }
  return last[1];
}

/**
 * Renders the plain <img> (instant, SSR/no-JS fallback with a CSS gradient) and,
 * on top of it, a <canvas> that ordered-dithers the image and dissolves it into
 * the page background by thinning dot density toward the fade edge.
 *
 * The canvas is drawn from a *separate*, crossOrigin image request so that
 * `getImageData` isn't blocked by canvas tainting. The visible <img> keeps NO
 * crossOrigin, so if the Sanity CDN rejects the cross-origin request (origin not
 * on the project's CORS allow-list) the cover still shows via that fallback —
 * the dither is a progressive enhancement, never a hard dependency.
 */
export function Dither({
  src,
  alt = '',
  priority,
  placement = 'top',
  imgClassName,
  canvasClassName,
  size = DITHER_CELL_SIZE,
  levels = DITHER_LEVELS,
}: DitherProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    // Dedicated crossOrigin source for the dither. If CORS is blocked this
    // errors and we reveal the plain <img> as a last-resort fallback.
    const source = new globalThis.Image();
    source.crossOrigin = 'anonymous';
    source.decoding = 'async';
    let loaded = false;

    function draw() {
      if (!loaded || !canvas || !container || !source.naturalWidth) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const cw = Math.max(1, Math.round(rect.width / size));
      const ch = Math.max(1, Math.round(rect.height / size));
      if (cw < 2 || ch < 2) return;
      canvas.width = cw;
      canvas.height = ch;

      // Cover-fit the image into the canvas.
      const s = Math.max(cw / source.naturalWidth, ch / source.naturalHeight);
      const dw = source.naturalWidth * s;
      const dh = source.naturalHeight * s;
      ctx.drawImage(source, (cw - dw) / 2, (ch - dh) / 2, dw, dh);

      let image: ImageData;
      try {
        image = ctx.getImageData(0, 0, cw, ch);
      } catch {
        return; // tainted (unexpected) — keep the <img> fallback visible
      }

      const [br, bg, bb] = readBg(container);
      const stops = coverageStops(placement);
      const d = image.data;
      const step = levels - 1;

      for (let y = 0; y < ch; y++) {
        // Image opacity along the fade axis (1 = full image, 0 = pure bg);
        // `fade` is how far this row is blended toward the background.
        const fade = 1 - coverageAt(stops, y / (ch - 1));
        for (let x = 0; x < cw; x++) {
          const i = (y * cw + x) * 4;

          // 1) Bake the fade gradient onto the pixel (blend toward background).
          const fr = d[i] + (br - d[i]) * fade;
          const fg = d[i + 1] + (bg - d[i + 1]) * fade;
          const fb = d[i + 2] + (bb - d[i + 2]) * fade;

          // 2) Dot density = how far the (faded) pixel sits from the background.
          //    Pixels near the bg — light walls, or the faded lower edge — get
          //    almost no dots and dissolve to nothing; dark/saturated pixels
          //    fill in densely. This is what makes the dots follow the image.
          const dist =
            (Math.abs(fr - br) + Math.abs(fg - bg) + Math.abs(fb - bb)) / 765;
          const density = Math.min(1, dist * DITHER_INK_GAIN);

          const bi = BAYER[(y & 3) * 4 + (x & 3)];
          const threshold = (bi + 0.5) / 16;
          if (density > threshold) {
            // Posterized image colour — the retro dot look.
            d[i] = (Math.round((fr / 255) * step) / step) * 255;
            d[i + 1] = (Math.round((fg / 255) * step) / step) * 255;
            d[i + 2] = (Math.round((fb / 255) * step) / step) * 255;
            d[i + 3] = 255;
          } else {
            // Background dot — opaque, so gaps read as the page background.
            d[i] = br;
            d[i + 1] = bg;
            d[i + 2] = bb;
            d[i + 3] = 255;
          }
        }
      }

      ctx.putImageData(image, 0, 0);
      canvas.classList.add('is-ready');
    }

    source.onload = () => {
      loaded = true;
      draw();
    };
    // CORS-blocked or missing: reveal the plain <img> so the cover isn't blank.
    // (Only loaded on demand, so the success path stays a single download.)
    source.onerror = () => {
      const img = imgRef.current;
      if (img) {
        img.src = src;
        img.dataset.fallback = 'true';
      }
    };
    source.src = src;

    const ro = new ResizeObserver(() => draw());
    ro.observe(container);

    return () => {
      source.onload = null;
      source.onerror = null;
      ro.disconnect();
    };
  }, [src, size, levels, placement]);

  return (
    <>
      {/* The raw image is hidden by default (CSS): only the dithered canvas is
          ever shown. It's revealed (data-fallback) only if the dither can't run
          (CORS), and rendered plainly for no-JS via <noscript>. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={imgClassName}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imgClassName} style={{ opacity: 1 }} />
      </noscript>
      <canvas ref={canvasRef} aria-hidden="true" className={canvasClassName} />
    </>
  );
}
