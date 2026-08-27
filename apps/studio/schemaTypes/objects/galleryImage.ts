import { defineType, defineField } from 'sanity';
import { ImageIcon } from '@sanity/icons';

/** A gallery photo with optional alt text and optional photographer credit. */
export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Fotografia',
  type: 'image',
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternatívny text',
      type: 'string',
      description: 'Voliteľné, ale odporúčané pre prístupnosť.',
    }),
    defineField({
      name: 'photographer',
      title: 'Fotograf/ka',
      type: 'string',
      description: 'Voliteľné.',
    }),
  ],
  preview: {
    select: { media: 'asset', title: 'photographer', subtitle: 'alt' },
    prepare({ media, title, subtitle }) {
      return { media, title: title || 'Fotografia', subtitle };
    },
  },
});
