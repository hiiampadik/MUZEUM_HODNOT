import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'placeholder';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  studioHost: 'muzeumhodnot',
  deployment: {
    appId: 'i13d4q1s5boh0eh9om1pbo4r',
    autoUpdates: true,
  },
  // TypeGen config lives in sanity-typegen.json (read by the CLI version in use).
});
