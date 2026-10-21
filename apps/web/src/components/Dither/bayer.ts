/**
 * Dithering algorithm: ordered (Bayer threshold matrix, per pixel — computed
 * in the shader) or Atkinson error diffusion (sequential — computed on the CPU).
 */
export type DitherMode = 'bayer' | 'atkinson';

/** Side of the Bayer threshold matrix: 2×2, 4×4 or 8×8. */
export type BayerSize = 2 | 4 | 8;

export type RGB = [number, number, number];

/**
 * Bayer matrix of side n, row-major, as thresholds in 0…1 (exclusive):
 * (rank + 0.5) / n². Built recursively: M(2s) = [[4M, 4M+2], [4M+3, 4M+1]].
 */
export function bayerMatrix(n: BayerSize): Float32Array {
  let m = [[0]];
  while (m.length < n) {
    const s = m.length;
    const next = Array.from({ length: 2 * s }, () => new Array<number>(2 * s));
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const v = 4 * m[y][x];
        next[y][x] = v;
        next[y][x + s] = v + 2;
        next[y + s][x] = v + 3;
        next[y + s][x + s] = v + 1;
      }
    }
    m = next;
  }
  const out = new Float32Array(n * n);
  m.flat().forEach((v, i) => (out[i] = (v + 0.5) / (n * n)));
  return out;
}

let probe: CanvasRenderingContext2D | null = null;

/** Resolves any CSS colour to RGB (0–255) through a 1×1 canvas. */
export function parseColor(color: string): RGB {
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe) return [0, 0, 0];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#000';
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

/**
 * The `--dither-palette` token: a comma-separated list of palette entries
 * (see parsePaletteEntry).
 */
export function readPalette(el: Element): string[] {
  return getComputedStyle(el)
    .getPropertyValue('--dither-palette')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

/**
 * A palette entry: a CSS colour, optionally followed by a weight ("#ff00dc 1.2").
 * The weight scales how far the colour reaches: > 1 makes it win pixels that
 * are farther away (used more), < 1 the opposite. Default 1. Colours share the
 * greys about evenly, so small steps (±0.05) already shift the balance a lot.
 */
export function parsePaletteEntry(entry: string): { color: string; weight: number } {
  const match = /^(.*\S)\s+(\d*\.?\d+)$/.exec(entry.trim());
  return match ? { color: match[1], weight: Number(match[2]) } : { color: entry.trim(), weight: 1 };
}

/**
 * Per-channel weights of the squared RGB distance used to pick the nearest
 * palette colour. [1, 1, 1] = plain RGB distance; Rec. 601 luma weights
 * (0.299, 0.587, 0.114) match by brightness instead — then every dark tone
 * lands on the palette's darkest colour.
 */
export type ColorWeights = readonly [number, number, number];

/**
 * Palette colour closest to (r, g, b) by the weighted distance, divided by the
 * square of the colour's own weight.
 */
function nearestColor(
  palette: readonly RGB[],
  paletteWeights: readonly number[],
  [wr, wg, wb]: ColorWeights,
  r: number,
  g: number,
  b: number,
): RGB {
  let best = palette[0];
  let bestDist = Infinity;
  palette.forEach((p, i) => {
    const dr = r - p[0];
    const dg = g - p[1];
    const db = b - p[2];
    const w = paletteWeights[i] ?? 1;
    const dist = (wr * dr * dr + wg * dg * dg + wb * db * db) / (w * w);
    if (dist < bestDist) {
      bestDist = dist;
      best = p;
    }
  });
  return best;
}

/**
 * Ordered dithering of `data` in place (CPU fallback of the shader): each
 * pixel is offset by its Bayer threshold and snapped to the nearest palette
 * colour.
 */
export function ditherBayer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  palette: readonly RGB[],
  paletteWeights: readonly number[],
  weights: ColorWeights,
  matrixSize: BayerSize,
  spread: number,
) {
  const matrix = bayerMatrix(matrixSize);
  const amount = spread * 255;
  for (let y = 0; y < height; y++) {
    const row = (y % matrixSize) * matrixSize;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const t = (matrix[row + (x % matrixSize)] - 0.5) * amount;
      const best = nearestColor(
        palette,
        paletteWeights,
        weights,
        data[i] + t,
        data[i + 1] + t,
        data[i + 2] + t,
      );
      data[i] = best[0];
      data[i + 1] = best[1];
      data[i + 2] = best[2];
      data[i + 3] = 255;
    }
  }
}

/**
 * Neighbours that receive 1/8 of a pixel's error each, as [dx, dy]. The
 * remaining 2/8 is dropped, which keeps highlights and shadows clean.
 */
const ATKINSON: readonly (readonly [number, number])[] = [
  [1, 0],
  [2, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [0, 2],
];

/**
 * Atkinson error diffusion of `data` in place: each pixel snaps to the nearest
 * palette colour and passes its error on to the not-yet-visited neighbours.
 * Sequential, so it can't run in the shader.
 */
export function ditherAtkinson(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  palette: readonly RGB[],
  paletteWeights: readonly number[],
  weights: ColorWeights,
) {
  // Unclamped working copy: accumulated error may overshoot 0–255.
  const work = Float32Array.from(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = work[i];
      const g = work[i + 1];
      const b = work[i + 2];
      const best = nearestColor(palette, paletteWeights, weights, r, g, b);
      data[i] = best[0];
      data[i + 1] = best[1];
      data[i + 2] = best[2];
      data[i + 3] = 255;

      const er = (r - best[0]) / 8;
      const eg = (g - best[1]) / 8;
      const eb = (b - best[2]) / 8;
      for (const [dx, dy] of ATKINSON) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny >= height) continue;
        const j = (ny * width + nx) * 4;
        work[j] += er;
        work[j + 1] += eg;
        work[j + 2] += eb;
      }
    }
  }
}
