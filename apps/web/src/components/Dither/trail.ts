/** The trail is kept at 1/SCALE of the image box's CSS size — it's soft anyway. */
const SCALE = 8;
/** Intensity a single stamp adds at the centre (stamps overlap along a stroke). */
const STAMP_ALPHA = 0.35;
/** Fade in steps of at least this much, so 8-bit rounding can't stall it. */
const MIN_FADE_STEP = 0.1;

/**
 * Pointer trail as a soft, fading intensity map (alpha channel of a small
 * canvas), uploaded to the dither shader as a texture.
 */
export class Trail {
  readonly canvas = document.createElement('canvas');
  private readonly ctx: CanvasRenderingContext2D;
  private last: { x: number; y: number } | null = null;
  private pendingFade = 0;

  constructor() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
  }

  /** Size of the image box in CSS px. Clears the trail. */
  resize(width: number, height: number) {
    this.canvas.width = Math.max(1, Math.ceil(width / SCALE));
    this.canvas.height = Math.max(1, Math.ceil(height / SCALE));
    this.last = null;
  }

  /** Strokes from the previous point to (x, y), in CSS px within the image box. */
  move(x: number, y: number, radius: number) {
    const from = this.last ?? { x, y };
    const distance = Math.hypot(x - from.x, y - from.y);
    // Stamps a quarter radius apart read as one continuous stroke.
    const steps = Math.max(1, Math.ceil(distance / (radius / 4)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.stamp(from.x + (x - from.x) * t, from.y + (y - from.y) * t, radius);
    }
    this.last = { x, y };
  }

  /** Pointer left: the next move starts a new stroke instead of joining up. */
  lift() {
    this.last = null;
  }

  /** Exponential fade; `duration` is roughly when the trail is gone. */
  fade(dt: number, duration: number) {
    this.pendingFade += dt;
    const amount = 1 - Math.exp(-this.pendingFade / (duration / 3));
    if (amount < MIN_FADE_STEP) return;
    this.pendingFade = 0;
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = `rgba(0, 0, 0, ${amount})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.pendingFade = 0;
  }

  private stamp(x: number, y: number, radius: number) {
    const cx = x / SCALE;
    const cy = y / SCALE;
    const r = radius / SCALE;
    const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0, `rgba(0, 0, 0, ${STAMP_ALPHA})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  }
}
