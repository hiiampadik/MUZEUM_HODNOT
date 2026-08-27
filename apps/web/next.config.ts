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
    // No Next.js image optimization server in a static export.
    // Responsive images are handled via the Sanity CDN (@sanity/image-url).
    unoptimized: true,
  },

  // Custom domain serves from the root, so no basePath is required.
};

export default nextConfig;
