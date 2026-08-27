import { defineType, defineField } from 'sanity';
import { BlockElementIcon } from '@sanity/icons';

/**
 * Page-builder block: a heading.
 * `level` expresses editorial hierarchy (section vs subsection), not visual style.
 * The frontend maps it to a semantic tag while keeping a single h1 per page.
 */
export const headingBlock = defineType({
  name: 'headingBlock',
  title: 'Nadpis',
  type: 'object',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Text nadpisu',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'level',
      title: 'Úroveň',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Nadpis (H2)', value: 'h2' },
          { title: 'Podnadpis (H3)', value: 'h3' },
        ],
      },
      initialValue: 'h2',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'text', level: 'level' },
    prepare({ title, level }) {
      return { title: title || 'Nadpis', subtitle: (level || 'h2').toUpperCase() };
    },
  },
});
