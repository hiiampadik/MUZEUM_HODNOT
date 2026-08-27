import { defineType, defineField } from 'sanity';
import { TextIcon } from '@sanity/icons';

/** Page-builder block: rich text with lists + monospace. */
export const textBlock = defineType({
  name: 'textBlock',
  title: 'Text',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'content',
      title: 'Text',
      type: 'richTextFull',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { content: 'content' },
    prepare({ content }) {
      const block = Array.isArray(content)
        ? content.find((b) => b._type === 'block')
        : undefined;
      const text = block?.children
        ?.map((c: { text?: string }) => c.text)
        .join('');
      return { title: text || 'Text', subtitle: 'Text' };
    },
  },
});
