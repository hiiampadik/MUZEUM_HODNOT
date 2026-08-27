import { defineType, defineField } from 'sanity';
import { DocumentIcon } from '@sanity/icons';

/** A downloadable file with a display name. Used in exhibitions and page builders. */
export const materialFile = defineType({
  name: 'materialFile',
  title: 'Materiál',
  type: 'object',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Názov',
      type: 'string',
      description: 'Ako sa súbor pomenuje na webe.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'file',
      title: 'Súbor',
      type: 'file',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: title || 'Materiál', subtitle: 'Materiál na stiahnutie' };
    },
  },
});
