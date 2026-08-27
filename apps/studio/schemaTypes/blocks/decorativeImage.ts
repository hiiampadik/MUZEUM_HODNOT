import { defineType, defineField } from 'sanity';
import { ImageIcon } from '@sanity/icons';

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
  ],
  preview: {
    select: { media: 'image', title: 'alt' },
    prepare({ media, title }) {
      return { media, title: title || 'Obrázok', subtitle: 'Obrázok' };
    },
  },
});
