'use client';

import { useEffect, useRef } from 'react';

type DitherProps = {
  /** Source image URL (Sanity CDN, CORS-enabled). */
  src: string;
  alt?: string;
  priority?: boolean;
  /** Fade direction baked into the canvas: top fades down, bottom fades up. */
  placement?: 'top' | 'bottom';
  imgClassName?: string;
  canvasClassName?: string;
  /** Dither pixel size (Figma "Size"). Higher = chunkier. */
  size?: number;
  /** Quantization levels per channel (Figma "Levels"). */
  levels?: number;
};

// 4×4 Bayer ordered-dither threshold matrix, normalized to [-0.5, 0.5).
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => v / 16 - 0.5,
);

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
 * Renders the plain <img> (instant, SSR/no-JS fallback) plus a <canvas> that
 * composites a fade gradient onto the same image and then applies ordered
 * (Bayer) dithering — so the fade dissolves in dithered dots, matching Figma.
 */
export function Dither({
  src,
  alt = '',
  priority,
  placement = 'top',
  imgClassName,
  canvasClassName,
  size = 2,
  levels = 3,
}: DitherProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    function draw() {
      if (!img || !canvas || !container || !img.naturalWidth) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const cw = Math.max(1, Math.round(rect.width / size));
      const ch = Math.max(1, Math.round(rect.height / size));
      if (cw < 2 || ch < 2) return;
      canvas.width = cw;
      canvas.height = ch;

      // Cover-fit the image into the canvas.
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);

      // Bake the fade gradient (toward the page background) onto the image.
      const [r, g, b] = readBg(container);
      const c = (a: number) => `rgba(${r},${g},${b},${a})`;
      const grad = ctx.createLinearGradient(0, 0, 0, ch);
      // Long, gradual ramp so the dithered dots thin out slowly toward the fade.
      const stops: [number, number][] =
        placement === 'top'
          ? [
              [0, 0],
              [0.3, 0.05],
              [0.6, 0.25],
              [0.85, 0.7],
              [1, 1],
            ]
          : [
              [0, 1],
              [0.15, 0.7],
              [0.4, 0.25],
              [0.7, 0.05],
              [1, 0],
            ];
      stops.forEach(([pos, a]) => grad.addColorStop(pos, c(a)));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);

      // Ordered dithering over the composited pixels.
      let image: ImageData;
      try {
        image = ctx.getImageData(0, 0, cw, ch);
      } catch {
        return; // tainted — keep the <img> visible
      }
      const d = image.data;
      const step = levels - 1;
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const i = (y * cw + x) * 4;
          const t = BAYER[(y & 3) * 4 + (x & 3)];
          for (let c = 0; c < 3; c++) {
            const v = d[i + c] / 255;
            const q = Math.round(v * step + t) / step;
            d[i + c] = Math.max(0, Math.min(1, q)) * 255;
          }
        }
      }
      ctx.putImageData(image, 0, 0);
      canvas.classList.add('is-ready');
    }

    if (img.complete) draw();
    img.addEventListener('load', draw);
    const ro = new ResizeObserver(() => draw());
    ro.observe(container);

    return () => {
      img.removeEventListener('load', draw);
      ro.disconnect();
    };
  }, [src, size, levels, placement]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={imgClassName}
      />
      <canvas ref={canvasRef} aria-hidden="true" className={canvasClassName} />
    </>
  );
}
