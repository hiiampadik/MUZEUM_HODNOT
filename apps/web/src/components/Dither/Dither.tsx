'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { type BayerSize, parseColor, readPalette } from './bayer';
import { createRenderer, type DitherParams, type DitherRenderer } from './renderers';
import { Trail } from './trail';
import styles from './Dither.module.css';

export type { BayerSize } from './bayer';

/** Dithering algorithm. Only ordered (Bayer) for now; error diffusion may follow. */
export type DitherMode = 'bayer';

/** On-screen size of one dithered pixel, in CSS px. */
export const DITHER_CELL_SIZE = 1;
/**
 * How far the Bayer threshold pushes a pixel before it snaps to the nearest
 * palette colour (fraction of the full 0–255 range). Higher = more mixing
 * between palette colours, lower = flatter posterized areas.
 */
export const DITHER_SPREAD = 0.9;
/** Extra spread under the pointer trail — the dither "boils" where the mouse passes. */
export const DITHER_TRAIL_BOOST = 1.25;
/** Radius of the pointer trail, in CSS px. */
export const DITHER_TRAIL_RADIUS = 140;
/** Roughly how long the trail takes to fade out, in seconds. */
export const DITHER_TRAIL_DURATION = 1.2;
/** Side of the Bayer matrix. */
export const DITHER_MATRIX_SIZE: BayerSize = 4;
/**
 * Bottom share of the image over which the trail fades to nothing, so the
 * pointer never lights up the image's lower edge where it melts into the page.
 */
export const DITHER_TRAIL_FADE_BOTTOM = 0.5;

type DitherProps = {
  /** Source image URL. Must be same-origin or served with CORS (canvas reads its pixels). */
  src: string;
  alt?: string;
  priority?: boolean;
  mode?: DitherMode;
  matrixSize?: BayerSize;
  /** On-screen size of one dithered pixel, in CSS px. */
  cellSize?: number;
  spread?: number;
  /** Palette as CSS colours. Defaults to the `--dither-palette` token. */
  palette?: readonly string[];
  /**
   * React to the mouse: it leaves a fading trail where the spread rises. Only
   * on devices with a fine hovering pointer (off on phones/tablets), only with
   * WebGL, and never with prefers-reduced-motion.
   */
  interactive?: boolean;
  trailBoost?: number;
  trailRadius?: number;
  trailDuration?: number;
  /** Bottom share of the image (0–1) over which the trail fades out. */
  trailFadeBottom?: number;
  /**
   * Edge where the image melts into the page: the trail fades out toward it,
   * and a cover-fit crop keeps the opposite edge anchored. Defaults to bottom
   * (top cover); a bottom cover fades out at the top.
   */
  fadeEdge?: 'top' | 'bottom';
  /** Reserves the box before the image loads (e.g. "1800 / 1055"). */
  aspectRatio?: string;
  className?: string;
};

/**
 * Image scaled to the dither grid (1 px per cell, smoothed by the browser),
 * cover-fitted: when the box is taller than the image's aspect ratio (a CSS
 * min-height), it is cropped on the sides, anchored at the top — or at the
 * bottom with `anchorBottom`.
 */
function scaleImage(
  source: HTMLImageElement,
  width: number,
  height: number,
  anchorBottom: boolean,
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (ctx) {
    const scale = Math.max(width / source.naturalWidth, height / source.naturalHeight);
    const w = source.naturalWidth * scale;
    const h = source.naturalHeight * scale;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, (width - w) / 2, anchorBottom ? height - h : 0, w, h);
  }
  return canvas;
}

function canAnimatePointer() {
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Live dithering: the image is dithered to a fixed palette in the browser (no
 * pre-processing) — in a WebGL shader, or once on the CPU as a fallback. The
 * result is multiplied onto the page background (`--color-bg`) in the shader
 * itself, so the palette's white becomes the page colour: an image that fades
 * to white fades out into the page. No CSS blend modes involved.
 *
 * The pixels come from a separate crossOrigin request so reading them isn't
 * blocked by canvas tainting. If that fails (origin not on the CDN's CORS
 * allow-list) the plain image is shown instead; without JS, <noscript> shows it.
 */
export function Dither({
  src,
  alt = '',
  priority,
  mode = 'bayer',
  matrixSize = DITHER_MATRIX_SIZE,
  cellSize = DITHER_CELL_SIZE,
  spread = DITHER_SPREAD,
  palette,
  interactive = false,
  trailBoost = DITHER_TRAIL_BOOST,
  trailRadius = DITHER_TRAIL_RADIUS,
  trailDuration = DITHER_TRAIL_DURATION,
  trailFadeBottom = DITHER_TRAIL_FADE_BOTTOM,
  fadeEdge = 'bottom',
  aspectRatio,
  className,
}: DitherProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<DitherRenderer | null>(null);
  const paramsRef = useRef<DitherParams | null>(null);
  const trailRef = useRef<Trail | null>(null);
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  // Renderer for the lifetime of the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createRenderer(canvas);
    if (!renderer) {
      setFailed(true);
      return;
    }
    rendererRef.current = renderer;
    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  // Load the pixel source.
  useEffect(() => {
    const img = new globalThis.Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    if (priority) img.setAttribute('fetchpriority', 'high');
    img.onload = () => setSource(img);
    img.onerror = () => setFailed(true);
    img.src = src;
    setSource(null);
    setReady(false);
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, priority]);

  // Dither parameters. `palette` is tracked by value (a new array each render is fine).
  const paletteKey = palette?.join(',');
  useEffect(() => {
    const root = rootRef.current;
    const renderer = rendererRef.current;
    if (!root || !renderer) return;
    const params: DitherParams = {
      matrixSize: mode === 'bayer' ? matrixSize : DITHER_MATRIX_SIZE,
      spread,
      trailBoost,
      trailFadeBottom,
      trailFadeTop: fadeEdge === 'top',
      palette: (palette ?? readPalette(root)).map(parseColor),
      background: parseColor(getComputedStyle(root).getPropertyValue('--color-bg')),
    };
    paramsRef.current = params;
    renderer.setParams(params);
    renderer.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, matrixSize, spread, trailBoost, trailFadeBottom, fadeEdge, paletteKey]);

  // Lay the image out on the dither grid — again whenever the box resizes.
  useEffect(() => {
    const root = rootRef.current;
    const renderer = rendererRef.current;
    if (!source || !root || !renderer) return;

    const layout = () => {
      // The box follows the image's aspect ratio, unless CSS makes it taller.
      const width = Math.max(1, Math.round(root.clientWidth / cellSize));
      const height = Math.max(1, Math.round(root.clientHeight / cellSize));
      try {
        renderer.setImage(scaleImage(source, width, height, fadeEdge === 'top'));
      } catch {
        setFailed(true); // tainted: CORS headers missing
        return;
      }
      trailRef.current?.resize(root.clientWidth, root.clientHeight);
      renderer.render();
      setReady(true);
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(root);
    return () => ro.disconnect();
  }, [source, cellSize, fadeEdge]);

  // Pointer trail: redraw every frame while it's fading, idle otherwise.
  useEffect(() => {
    const root = rootRef.current;
    const renderer = rendererRef.current;
    if (!interactive || !root || !renderer?.interactive || !canAnimatePointer()) return;

    const trail = new Trail();
    trail.resize(root.clientWidth, root.clientHeight);
    trailRef.current = trail;

    let raf = 0;
    let lastFrame = 0;
    let lastMove = -Infinity;

    const tick = (now: number) => {
      trail.fade(lastFrame ? (now - lastFrame) / 1000 : 0, trailDuration);
      lastFrame = now;
      if (now - lastMove < trailDuration * 1000) {
        renderer.setTrail(trail.canvas);
        renderer.render();
        raf = requestAnimationFrame(tick);
      } else {
        // Faded out: drop the residue and stop the loop.
        trail.clear();
        renderer.setTrail(null);
        renderer.render();
        raf = 0;
        lastFrame = 0;
      }
    };

    // The image usually sits behind the content (pointer-events: none), so
    // listen on the window and map the pointer into the image box.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = root.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const outside =
        x < -trailRadius ||
        y < -trailRadius ||
        x > rect.width + trailRadius ||
        y > rect.height + trailRadius;
      if (outside) {
        trail.lift();
        return;
      }
      trail.move(x, y, trailRadius);
      lastMove = performance.now();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) trail.lift();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onLeave);
      cancelAnimationFrame(raf);
      trailRef.current = null;
      renderer.setTrail(null);
      renderer.render();
    };
  }, [interactive, trailRadius, trailDuration]);

  const style: CSSProperties = {
    aspectRatio: source ? `${source.naturalWidth} / ${source.naturalHeight}` : aspectRatio,
  };

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={style}
      data-ready={ready || undefined}
      data-fallback={failed || undefined}
      data-fade-edge={fadeEdge}
    >
      {failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={styles.fallback} />
      ) : (
        <>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className={styles.fallback} />
          </noscript>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            role={alt ? 'img' : undefined}
            aria-label={alt || undefined}
            aria-hidden={alt ? undefined : true}
          />
        </>
      )}
    </div>
  );
}
