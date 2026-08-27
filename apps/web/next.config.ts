import type { NextConfig } from 'next';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const nextConfig: NextConfig = {
  // Static export for GitHub Pages.
  output: 'export',

  // Pin the monorepo root (avoids picking up a stray lockfile in $HOME).
  outputFileTracingRoot: repoRoot,

  // Emit /path/index.html so Pages serves clean URLs without a server.
  trailingSlash: true,

  images: {
    // No Next.js optimization server in a static export — resize via the Sanity
    // CDN through a custom loader (still emits a responsive srcset).
    loader: 'custom',
    loaderFile: './src/sanity/imageLoader.ts',
  },

  // Custom domain serves from the root, so no basePath is required.
};

export default nextConfig;
