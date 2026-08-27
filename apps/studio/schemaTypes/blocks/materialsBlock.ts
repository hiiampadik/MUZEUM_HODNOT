import { defineType, defineField } from 'sanity';
import { DocumentsIcon } from '@sanity/icons';

/** Page-builder block: one or more downloadable materials. */
export const materialsBlock = defineType({
  name: 'materialsBlock',
  title: 'Materiály',
  type: 'object',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'materials',
      title: 'Materiály',
      type: 'array',
      of: [{ type: 'materialFile' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { materials: 'materials' },
    prepare({ materials }) {
      const count = Array.isArray(materials) ? materials.length : 0;
      return {
        title: 'Materiály',
        subtitle: `${count} ${count === 1 ? 'súbor' : 'súborov'}`,
      };
    },
  },
});
