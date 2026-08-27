import { defineType, defineField } from 'sanity';
import { ImageIcon } from '@sanity/icons';

/**
 * Cover image used at the top and bottom of a page.
 * The gradient + dithering effect is applied on the frontend (see CLAUDE.md).
 */
export const coverImage = defineType({
  name: 'coverImage',
  title: 'Cover obrázok',
  type: 'image',
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternatívny text',
      type: 'string',
      description: 'Popis obrázka pre čítačky obrazovky a SEO.',
      validation: (rule) => rule.required(),
    }),
  ],
});
