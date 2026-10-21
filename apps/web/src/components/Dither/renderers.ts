import {
  type BayerSize,
  type ColorWeights,
  bayerMatrix,
  ditherAtkinson,
  ditherBayer,
  type DitherMode,
  type RGB,
} from './bayer';

export type DitherParams = {
  mode: DitherMode;
  /** Bayer matrix — with `atkinson` it's only used under the pointer trail. */
  matrixSize: BayerSize;
  spread: number;
  /** Extra spread where the pointer trail is at full strength. */
  trailBoost: number;
  /** Share of the image height (0–1) over which the trail fades to nothing. */
  trailFadeBottom: number;
  /** Fade the trail toward the top edge instead of the bottom (bottom covers). */
  trailFadeTop: boolean;
  palette: readonly RGB[];
  /** Per-colour weights, parallel to `palette` (see parsePaletteEntry). */
  paletteWeights: readonly number[];
  /** Channel weights of the distance to the nearest palette colour. */
  colorWeights: ColorWeights;
  /** Page background the result is multiplied onto (white → page colour). */
  background: RGB;
};

/** Draws a pre-scaled image (1 px = 1 dither cell) dithered into the canvas. */
export interface DitherRenderer {
  /** Whether it can follow the pointer trail at frame rate. */
  readonly interactive: boolean;
  /** Throws if the image is CORS-tainted. Resizes the canvas to the image. */
  setImage(image: HTMLCanvasElement): void;
  setParams(params: DitherParams): void;
  /** Trail intensity in the alpha channel, any resolution; null = no trail. */
  setTrail(trail: HTMLCanvasElement | null): void;
  render(): void;
  dispose(): void;
}

/** WebGL when available (interactive), otherwise the CPU fallback. */
export function createRenderer(canvas: HTMLCanvasElement): DitherRenderer | null {
  return GlDitherRenderer.create(canvas) ?? CpuDitherRenderer.create(canvas);
}

/** Palette slots in the shader. */
const MAX_COLORS = 8;
/**
 * Trail values below this are treated as zero: canvas fades leave a little
 * 8-bit residue that would otherwise never clear.
 */
const TRAIL_FLOOR = 0.04;

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D u_image;
uniform sampler2D u_bayer;
uniform sampler2D u_trail;
uniform sampler2D u_diffused;
uniform float u_diffusion;
uniform vec2 u_size;
uniform float u_matrixSize;
uniform float u_spread;
uniform float u_trailBoost;
uniform float u_trailFadeBottom;
uniform float u_trailFadeTop;
uniform vec3 u_palette[${MAX_COLORS}];
uniform float u_paletteScale[${MAX_COLORS}];
uniform int u_paletteSize;
uniform vec3 u_background;
uniform vec3 u_colorWeights;

void main() {
  // Canvas pixel, counted from the top-left like the image and the CPU path.
  vec2 px = vec2(floor(gl_FragCoord.x), u_size.y - 1.0 - floor(gl_FragCoord.y));
  vec2 uv = (px + 0.5) / u_size;

  vec3 color = texture2D(u_image, uv).rgb;

  float trail = texture2D(u_trail, uv).a;
  trail = clamp((trail - ${TRAIL_FLOOR}) / (1.0 - ${TRAIL_FLOOR}), 0.0, 1.0);
  // Thin the trail out toward the edge where the image melts into the page
  // (bottom, or top for a bottom cover): boosted noise there would draw the edge of
  // the canvas.
  float edge = u_trailFadeTop > 0.5 ? 1.0 - uv.y : uv.y;
  trail *= 1.0 - smoothstep(1.0 - max(u_trailFadeBottom, 0.001), 1.0, edge);

  vec2 cell = mod(px, u_matrixSize);
  float rank = texture2D(u_bayer, (cell + 0.5) / u_matrixSize).r;
  vec3 c = color + (rank - 0.5) * (u_spread + u_trailBoost * trail);

  vec3 best = u_palette[0];
  float bestDist = 1e9;
  for (int i = 0; i < ${MAX_COLORS}; i++) {
    if (i >= u_paletteSize) break;
    vec3 d = c - u_palette[i];
    float dist = dot(u_colorWeights, d * d) * u_paletteScale[i];
    if (dist < bestDist) {
      bestDist = dist;
      best = u_palette[i];
    }
  }
  // Error diffusion is precomputed on the CPU and can't follow the pointer, so
  // under the trail it gives way to the boiling Bayer pattern — picked by the
  // Bayer rank, so the boundary between the two is dithered too.
  if (u_diffusion > 0.5 && trail < rank) {
    best = texture2D(u_diffused, uv).rgb;
  }
  // Multiply onto the page background, so white melts into the page.
  gl_FragColor = vec4(best * u_background, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('createShader failed');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed');
  }
  return shader;
}

function createTexture(gl: WebGLRenderingContext, filter: number, wrap: number) {
  const texture = gl.createTexture();
  if (!texture) throw new Error('createTexture failed');
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  return texture;
}

/**
 * Dithering in a fragment shader — cheap enough to redraw every frame, so the
 * pointer trail can modulate it live. Texture units: 0 image, 1 Bayer matrix,
 * 2 trail, 3 error-diffused image (Atkinson mode, computed on the CPU).
 */
class GlDitherRenderer implements DitherRenderer {
  readonly interactive = true;
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;
  private readonly textures: {
    image: WebGLTexture;
    bayer: WebGLTexture;
    trail: WebGLTexture;
    diffused: WebGLTexture;
  };
  private readonly uniforms: Record<string, WebGLUniformLocation | null>;
  private image: HTMLCanvasElement | null = null;
  private params: DitherParams | null = null;
  /** The error-diffused texture is out of date with the image or the params. */
  private diffusedStale = true;
  private bayerSize = 0;
  private disposed = false;

  static create(canvas: HTMLCanvasElement): GlDitherRenderer | null {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return null;
    try {
      return new GlDitherRenderer(gl);
    } catch {
      return null;
    }
  }

  private constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    const program = gl.createProgram();
    if (!program) throw new Error('createProgram failed');
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'program link failed');
    }
    this.program = program;
    gl.useProgram(program);

    // One triangle covering the whole viewport.
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('createBuffer failed');
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    this.textures = {
      image: createTexture(gl, gl.NEAREST, gl.CLAMP_TO_EDGE),
      bayer: createTexture(gl, gl.NEAREST, gl.CLAMP_TO_EDGE),
      trail: createTexture(gl, gl.LINEAR, gl.CLAMP_TO_EDGE),
      diffused: createTexture(gl, gl.NEAREST, gl.CLAMP_TO_EDGE),
    };

    const names = [
      'u_image',
      'u_bayer',
      'u_trail',
      'u_diffused',
      'u_diffusion',
      'u_size',
      'u_matrixSize',
      'u_spread',
      'u_trailBoost',
      'u_trailFadeBottom',
      'u_trailFadeTop',
      'u_palette',
      'u_paletteScale',
      'u_paletteSize',
      'u_background',
      'u_colorWeights',
    ];
    this.uniforms = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)]));
    gl.uniform1i(this.uniforms.u_image, 0);
    gl.uniform1i(this.uniforms.u_bayer, 1);
    gl.uniform1i(this.uniforms.u_trail, 2);
    gl.uniform1i(this.uniforms.u_diffused, 3);
    this.setTrail(null);
  }

  setImage(image: HTMLCanvasElement) {
    if (this.disposed) return;
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.image);
    // Throws a SecurityError for a CORS-tainted source.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.canvas.width = image.width;
    gl.canvas.height = image.height;
    gl.viewport(0, 0, image.width, image.height);
    gl.uniform2f(this.uniforms.u_size, image.width, image.height);
    this.image = image;
    this.diffusedStale = true;
  }

  setParams(params: DitherParams) {
    if (this.disposed) return;
    const { gl } = this;
    const {
      mode,
      matrixSize,
      spread,
      trailBoost,
      trailFadeBottom,
      trailFadeTop,
      palette,
      paletteWeights,
      colorWeights,
      background,
    } = params;
    this.params = params;
    this.diffusedStale = true;
    if (matrixSize !== this.bayerSize) {
      const bytes = Uint8Array.from(bayerMatrix(matrixSize), (v) => Math.round(v * 255));
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.bayer);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.LUMINANCE,
        matrixSize,
        matrixSize,
        0,
        gl.LUMINANCE,
        gl.UNSIGNED_BYTE,
        bytes,
      );
      this.bayerSize = matrixSize;
    }
    const colors = palette.slice(0, MAX_COLORS);
    const flat = new Float32Array(MAX_COLORS * 3);
    colors.forEach((c, i) => flat.set([c[0] / 255, c[1] / 255, c[2] / 255], i * 3));
    gl.uniform1f(this.uniforms.u_diffusion, mode === 'atkinson' ? 1 : 0);
    gl.uniform1f(this.uniforms.u_matrixSize, matrixSize);
    gl.uniform1f(this.uniforms.u_spread, spread);
    gl.uniform1f(this.uniforms.u_trailBoost, trailBoost);
    gl.uniform1f(this.uniforms.u_trailFadeBottom, trailFadeBottom);
    gl.uniform1f(this.uniforms.u_trailFadeTop, trailFadeTop ? 1 : 0);
    gl.uniform3fv(this.uniforms.u_palette, flat);
    // 1 / weight², so the shader multiplies instead of dividing.
    const scale = new Float32Array(MAX_COLORS).fill(1);
    colors.forEach((_, i) => (scale[i] = 1 / (paletteWeights[i] ?? 1) ** 2));
    gl.uniform1fv(this.uniforms.u_paletteScale, scale);
    gl.uniform1i(this.uniforms.u_paletteSize, colors.length);
    gl.uniform3fv(this.uniforms.u_colorWeights, colorWeights);
    gl.uniform3f(
      this.uniforms.u_background,
      background[0] / 255,
      background[1] / 255,
      background[2] / 255,
    );
  }

  setTrail(trail: HTMLCanvasElement | null) {
    if (this.disposed) return;
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.trail);
    if (trail) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trail);
    } else {
      const empty = new Uint8Array(4);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, empty);
    }
  }

  render() {
    if (this.disposed || !this.image || this.bayerSize === 0) return;
    if (this.params?.mode === 'atkinson' && this.diffusedStale) this.updateDiffused();
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  /** Runs the error diffusion on the CPU — only when the image or params change, not per frame. */
  private updateDiffused() {
    const { gl, image, params } = this;
    if (!image || !params || params.palette.length === 0) return;
    const pixels = image.getContext('2d')?.getImageData(0, 0, image.width, image.height);
    if (!pixels) return;
    ditherAtkinson(
      pixels.data,
      pixels.width,
      pixels.height,
      params.palette,
      params.paletteWeights,
      params.colorWeights,
    );
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.diffused);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    this.diffusedStale = false;
  }

  dispose() {
    // Free the resources but keep the context: in dev (Strict Mode) the same
    // canvas gets a new renderer right away, and a lost context can't be reused.
    this.disposed = true;
    const { gl } = this;
    Object.values(this.textures).forEach((t) => gl.deleteTexture(t));
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
  }
}

/** Static fallback without WebGL: dithers once per change, no trail. */
class CpuDitherRenderer implements DitherRenderer {
  readonly interactive = false;
  private source: ImageData | null = null;
  private params: DitherParams | null = null;

  static create(canvas: HTMLCanvasElement): CpuDitherRenderer | null {
    const ctx = canvas.getContext('2d');
    return ctx ? new CpuDitherRenderer(ctx) : null;
  }

  private constructor(private readonly ctx: CanvasRenderingContext2D) {}

  setImage(image: HTMLCanvasElement) {
    const source = image.getContext('2d')?.getImageData(0, 0, image.width, image.height);
    if (!source) throw new Error('image has no 2d context');
    this.source = source;
    this.ctx.canvas.width = image.width;
    this.ctx.canvas.height = image.height;
  }

  setParams(params: DitherParams) {
    this.params = params;
  }

  setTrail() {}

  render() {
    const { source, params } = this;
    if (!source || !params || params.palette.length === 0) return;
    const out = new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
    if (params.mode === 'atkinson') {
      ditherAtkinson(
        out.data,
        out.width,
        out.height,
        params.palette,
        params.paletteWeights,
        params.colorWeights,
      );
    } else {
      ditherBayer(
        out.data,
        out.width,
        out.height,
        params.palette,
        params.paletteWeights,
        params.colorWeights,
        params.matrixSize,
        params.spread,
      );
    }
    const [br, bg, bb] = params.background;
    for (let i = 0; i < out.data.length; i += 4) {
      out.data[i] = (out.data[i] * br) / 255;
      out.data[i + 1] = (out.data[i + 1] * bg) / 255;
      out.data[i + 2] = (out.data[i + 2] * bb) / 255;
    }
    this.ctx.putImageData(out, 0, 0);
  }

  dispose() {}
}
