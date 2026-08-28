import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes, SINGLETONS } from './schemaTypes';
import { structure } from './structure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'placeholder';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

export default defineConfig({
  name: 'default',
  title: 'Múzeum Hodnôt',

  projectId,
  dataset,

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
    // Hide singletons from the global "create new" menu (they live in Structure).
    templates: (prev) =>
      prev.filter((template) => !SINGLETONS.includes(template.schemaType)),
  },

  document: {
    // Remove create/delete/duplicate actions for singleton documents.
    actions: (prev, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? prev.filter(
            (action) =>
              !['duplicate', 'delete', 'unpublish'].includes(
                action.action ?? '',
              ),
          )
        : prev,
  },
});
