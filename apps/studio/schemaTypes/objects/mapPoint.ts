import { defineType, defineField } from 'sanity';
import { PinIcon } from '@sanity/icons';

/**
 * A point on the Generátor hodnôt map.
 * Popover content: title, image, text block, link. Position via geopoint.
 */
export const mapPoint = defineType({
  name: 'mapPoint',
  title: 'Bod na mape',
  type: 'object',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nadpis',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Poloha',
      type: 'geopoint',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Obrázok',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'richTextBasic',
    }),
    defineField({
      name: 'link',
      title: 'Odkaz',
      type: 'namedLink',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image' },
    prepare({ title, media }) {
      return { title: title || 'Bod na mape', subtitle: 'Bod na mape', media };
    },
  },
});
