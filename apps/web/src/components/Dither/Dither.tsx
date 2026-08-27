'use client';

import { useEffect, useRef } from 'react';

type DitherProps = {
  /** Source image URL (Sanity CDN, CORS-enabled). */
  src: string;
  className?: string;
  /** Quantization levels per channel (lower = stronger effect). */
  levels?: number;
};

// 4×4 Bayer ordered-dither threshold matrix, normalized to [0,1).
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => v / 16 - 0.5,
);

/**
 * Progressive-enhancement dithering overlay: draws the image to a canvas and
 * applies ordered (Bayer) dithering. Rendered on top of a plain <img> fallback,
 * so if canvas/CORS fails or JS is off, the original image still shows.
 */
export function Dither({ src, className, levels = 4 }: DitherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    let cancelled = false;

    function render() {
      if (cancelled || !canvas || !ctx || !img.naturalWidth) return;
      const parent = canvas.parentElement;
      if (!parent) return;

      // Cap resolution for a one-time CPU pass; CSS scales the canvas to fill.
      const maxW = 1400;
      const cw = Math.min(parent.clientWidth || img.naturalWidth, maxW);
      const scale = cw / img.naturalWidth;
      const ch = Math.round(img.naturalHeight * scale);
      canvas.width = cw;
      canvas.height = ch;

      ctx.drawImage(img, 0, 0, cw, ch);

      let image: ImageData;
      try {
        image = ctx.getImageData(0, 0, cw, ch);
      } catch {
        // Tainted canvas (CORS) — leave the fallback <img> visible.
        canvas.style.opacity = '0';
        return;
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
      canvas.style.opacity = '1';
    }

    img.onload = render;
    img.onerror = () => {
      if (canvas) canvas.style.opacity = '0';
    };
    img.src = src;

    const ro = new ResizeObserver(() => render());
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [src, levels]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} style={{ opacity: 0 }} />;
}
