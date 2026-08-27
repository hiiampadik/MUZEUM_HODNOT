import { defineType, defineField, defineArrayMember } from 'sanity';
import { SquareIcon } from '@sanity/icons';

/**
 * Page-builder block: a tile that can hold the other blocks
 * (text, headings, decorative image, materials). Not nestable in itself.
 */
export const tileBlock = defineType({
  name: 'tileBlock',
  title: 'Dlaždica',
  type: 'object',
  icon: SquareIcon,
  fields: [
    defineField({
      name: 'content',
      title: 'Obsah',
      type: 'array',
      of: [
        defineArrayMember({ type: 'textBlock' }),
        defineArrayMember({ type: 'headingBlock' }),
        defineArrayMember({ type: 'decorativeImage' }),
        defineArrayMember({ type: 'materialsBlock' }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { content: 'content' },
    prepare({ content }) {
      const count = Array.isArray(content) ? content.length : 0;
      return {
        title: 'Dlaždica',
        subtitle: `${count} ${count === 1 ? 'blok' : 'blokov'}`,
      };
    },
  },
});
