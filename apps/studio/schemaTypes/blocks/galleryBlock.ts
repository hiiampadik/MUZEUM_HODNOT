import { defineType, defineField, defineArrayMember } from 'sanity';
import { ImagesIcon } from '@sanity/icons';

/** Page-builder block: a full-width horizontally scrollable photo gallery. */
export const galleryBlock = defineType({
  name: 'galleryBlock',
  title: 'Galéria',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Fotografie',
      type: 'array',
      of: [defineArrayMember({ type: 'galleryImage' })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { images: 'images', media: 'images.0' },
    prepare({ images, media }) {
      const count = Array.isArray(images) ? images.length : 0;
      const noun = count === 1 ? 'fotografia' : count < 5 ? 'fotografie' : 'fotografií';
      return { title: 'Galéria', subtitle: `${count} ${noun}`, media };
    },
  },
});
