import { createClient } from '@sanity/client';
import { apiVersion, dataset, projectId } from '../env';

/**
 * Build-time Sanity client for the static export.
 * All data is fetched during `next build`; content updates trigger a full
 * rebuild via webhook (there is no server runtime in a static export).
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Fresh data at build time (builds run on-demand via webhook, not often).
  useCdn: false,
  perspective: 'published',
  // Read token allows fetching in CI where the dataset may be private.
  token: process.env.SANITY_API_READ_TOKEN,
});
