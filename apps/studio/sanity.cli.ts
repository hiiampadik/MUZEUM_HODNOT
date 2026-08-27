import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'placeholder';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  autoUpdates: true,
  // TypeGen config lives in sanity-typegen.json (read by the CLI version in use).
});
