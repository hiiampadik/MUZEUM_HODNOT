import { defineType, defineField } from 'sanity';
import { ImageIcon } from '@sanity/icons';

const SIZE_LABELS: Record<string, string> = {
  center: 'Na stred',
  text: 'Na šírku textového bloku',
  page: 'Na šírku stránky',
};

/** Page-builder block: an image with a decorative frontend effect. */
export const decorativeImage = defineType({
  name: 'decorativeImage',
  title: 'Obrázok',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Obrázok',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alternatívny text',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'size',
      title: 'Veľkosť',
      type: 'string',
      initialValue: 'center',
      options: {
        layout: 'radio',
        list: [
          { title: SIZE_LABELS.center, value: 'center' },
          { title: SIZE_LABELS.text, value: 'text' },
          { title: SIZE_LABELS.page, value: 'page' },
        ],
      },
    }),
  ],
  preview: {
    select: { media: 'image', title: 'alt', size: 'size' },
    prepare({ media, title, size }) {
      return {
        media,
        title: title || 'Obrázok',
        subtitle: SIZE_LABELS[size as string] ?? SIZE_LABELS.center,
      };
    },
  },
});
