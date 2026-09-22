import { defineType, defineField } from 'sanity';
import { EarthGlobeIcon } from '@sanity/icons';

/** A social network link in the footer: icon image, name, URL. */
export const socialLink = defineType({
  name: 'socialLink',
  title: 'Sociálna sieť',
  type: 'object',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Názov',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'icon',
      title: 'Ikona',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'url', media: 'icon' },
  },
});
