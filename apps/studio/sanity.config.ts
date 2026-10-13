import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { media } from 'sanity-plugin-media';
import { schemaTypes, SINGLETONS } from './schemaTypes';
import { EXHIBITION_BY_STATUS_TEMPLATE } from './schemaTypes/documents/exhibition';
import { structure } from './structure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'placeholder';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

export default defineConfig({
  name: 'default',
  title: 'Múzeum hodnôt',

  projectId,
  dataset,

  plugins: [structureTool({ structure }), visionTool(), media()],

  schema: {
    types: schemaTypes,
    // Hide singletons from the global "create new" menu (they live in Structure).
    templates: (prev) => [
      ...prev.filter((template) => !SINGLETONS.includes(template.schemaType)),
      // Presets the category when creating from a per-status list in Structure.
      {
        id: EXHIBITION_BY_STATUS_TEMPLATE,
        title: 'Výstava',
        schemaType: 'exhibition',
        parameters: [{ name: 'status', type: 'string' }],
        value: ({ status }: { status: string }) => ({ status }),
      },
    ],
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
