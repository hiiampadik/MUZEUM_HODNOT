'use client';

import { useEffect, useState } from 'react';
import {
  type BayerSize,
  Dither,
  DITHER_CELL_SIZE,
  DITHER_MATRIX_SIZE,
  DITHER_SPREAD,
  DITHER_TRAIL_BOOST,
  DITHER_TRAIL_DURATION,
  DITHER_TRAIL_FADE_BOTTOM,
  DITHER_TRAIL_RADIUS,
  type DitherMode,
} from '@/components/Dither/Dither';
import { Container } from '@/components/Container/Container';
import { Label } from '@/components/Typography/Typography';
import styles from './lab.module.css';

/**
 * Live controls for the Dither component, over a top cover laid out like the
 * real pages. Dev-only copy, hence not in lib/strings.
 */
export function DitherLab({ src, aspectRatio }: { src: string; aspectRatio: string }) {
  const [mode, setMode] = useState<DitherMode>('bayer');
  const [matrixSize, setMatrixSize] = useState<BayerSize>(DITHER_MATRIX_SIZE);
  const [cellSize, setCellSize] = useState(DITHER_CELL_SIZE);
  const [spread, setSpread] = useState(DITHER_SPREAD);
  const [palette, setPalette] = useState<string[]>([]);
  const [interactive, setInteractive] = useState(true);
  const [trailBoost, setTrailBoost] = useState(DITHER_TRAIL_BOOST);
  const [trailRadius, setTrailRadius] = useState(DITHER_TRAIL_RADIUS);
  const [trailDuration, setTrailDuration] = useState(DITHER_TRAIL_DURATION);
  const [trailFadeBottom, setTrailFadeBottom] = useState(DITHER_TRAIL_FADE_BOTTOM);

  // Start from the --dither-palette token.
  useEffect(() => {
    const token = getComputedStyle(document.documentElement).getPropertyValue('--dither-palette');
    setPalette(
      token
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
    );
  }, []);

  return (
    <main className="page-main">
      <div className={styles.cover}>
        <Dither
          src={src}
          aspectRatio={aspectRatio}
          priority
          mode={mode}
          matrixSize={matrixSize}
          cellSize={cellSize}
          spread={spread}
          palette={palette.length > 0 ? palette : undefined}
          interactive={interactive}
          trailBoost={trailBoost}
          trailRadius={trailRadius}
          trailDuration={trailDuration}
          trailFadeBottom={trailFadeBottom}
        />
      </div>

      <Container width="narrow">
        <form className={styles.panel} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.field}>
            <Label>Režim</Label>
            <select value={mode} onChange={(e) => setMode(e.target.value as DitherMode)}>
              <option value="bayer">Bayer (ordered)</option>
            </select>
          </label>

          <label className={styles.field}>
            <Label>Matica</Label>
            <select
              value={matrixSize}
              onChange={(e) => setMatrixSize(Number(e.target.value) as BayerSize)}
            >
              <option value={2}>2 × 2</option>
              <option value={4}>4 × 4</option>
              <option value={8}>8 × 8</option>
            </select>
          </label>

          <label className={styles.field}>
            <Label>Veľkosť bodu: {cellSize} px</Label>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={cellSize}
              onChange={(e) => setCellSize(Number(e.target.value))}
            />
          </label>

          <label className={styles.field}>
            <Label>Rozptyl: {spread.toFixed(2)}</Label>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={spread}
              onChange={(e) => setSpread(Number(e.target.value))}
            />
          </label>

          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={interactive}
              onChange={(e) => setInteractive(e.target.checked)}
            />
            <Label>Stopa myši (len s myšou, nie na telefóne)</Label>
          </label>

          <label className={styles.field}>
            <Label>Zosilnenie rozptylu v stope: {trailBoost.toFixed(2)}</Label>
            <input
              type="range"
              min={0}
              max={3}
              step={0.05}
              value={trailBoost}
              disabled={!interactive}
              onChange={(e) => setTrailBoost(Number(e.target.value))}
            />
          </label>

          <label className={styles.field}>
            <Label>Polomer stopy: {trailRadius} px</Label>
            <input
              type="range"
              min={40}
              max={320}
              step={10}
              value={trailRadius}
              disabled={!interactive}
              onChange={(e) => setTrailRadius(Number(e.target.value))}
            />
          </label>

          <label className={styles.field}>
            <Label>Dĺžka stopy: {trailDuration.toFixed(1)} s</Label>
            <input
              type="range"
              min={0.3}
              max={4}
              step={0.1}
              value={trailDuration}
              disabled={!interactive}
              onChange={(e) => setTrailDuration(Number(e.target.value))}
            />
          </label>

          <label className={styles.field}>
            <Label>Útlm stopy dole: {Math.round(trailFadeBottom * 100)} % výšky</Label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={trailFadeBottom}
              disabled={!interactive}
              onChange={(e) => setTrailFadeBottom(Number(e.target.value))}
            />
          </label>

          <div className={styles.field}>
            <Label>Paleta</Label>
            <div className={styles.swatches}>
              {palette.map((color, i) => (
                <input
                  key={i}
                  type="color"
                  value={color}
                  aria-label={`Farba ${i + 1}`}
                  onChange={(e) =>
                    setPalette((p) => p.map((c, j) => (j === i ? e.target.value : c)))
                  }
                />
              ))}
            </div>
          </div>
        </form>
      </Container>
    </main>
  );
}
