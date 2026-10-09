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

/** The `--dither-palette` token: a comma-separated list of colours. */
export function readPalette(el: Element): string[] {
  return getComputedStyle(el)
    .getPropertyValue('--dither-palette')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

// Perceptual weights for the colour distance (Rec. 601 luma), so e.g. black
// lands on the darkest palette colour (blue) rather than an arbitrary one.
// Mirrored in the shader (renderers.ts).
const WR = 0.299;
const WG = 0.587;
const WB = 0.114;

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
      const r = data[i] + t;
      const g = data[i + 1] + t;
      const b = data[i + 2] + t;

      let best = palette[0];
      let bestDist = Infinity;
      for (const p of palette) {
        const dr = r - p[0];
        const dg = g - p[1];
        const db = b - p[2];
        const dist = WR * dr * dr + WG * dg * dg + WB * db * db;
        if (dist < bestDist) {
          bestDist = dist;
          best = p;
        }
      }
      data[i] = best[0];
      data[i + 1] = best[1];
      data[i + 2] = best[2];
      data[i + 3] = 255;
    }
  }
}
