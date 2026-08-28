// Copies MapLibre's web worker (and the shared chunk it imports) into
// `public/maplibre/` so we can self-host them.
//
// Why: maplibre-gl 6 loads its worker via `new URL('./maplibre-gl-worker.mjs',
// import.meta.url)` built as a *variable*, then `new Worker(url)`. Webpack (Next)
// only detects the literal `new Worker(new URL(...))` pattern, so it never emits
// the worker chunk — at runtime the URL 404s to the dev/HTML fallback and the
// browser refuses it ("non-JavaScript MIME type text/html"). Vector tiles are
// parsed in that worker, so the map loads its style but never renders tiles.
//
// We copy both files verbatim (same installed version, no drift) and point
// maplibre at them with `setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')`.
// The worker imports `./maplibre-gl-shared.mjs`, which resolves next to it.
import { createRequire } from 'node:module';
import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const distDir = dirname(require.resolve('maplibre-gl/package.json')) + '/dist';
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'maplibre');

const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];

await mkdir(outDir, { recursive: true });
for (const f of files) {
  await copyFile(join(distDir, f), join(outDir, f));
}
console.log(`[copy-maplibre-worker] copied ${files.join(', ')} → public/maplibre/`);
