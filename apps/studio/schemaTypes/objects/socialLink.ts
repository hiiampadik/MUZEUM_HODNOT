import { defineType, defineField } from 'sanity';
import { EarthGlobeIcon } from '@sanity/icons';

/**
 * A social network link in the footer: SVG icon, name, URL.
 * The icon is stored as raw SVG markup so it can inherit color via currentColor.
 */
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
      title: 'Ikona (SVG)',
      type: 'text',
      rows: 4,
      description:
        'Vložte SVG kód ikony. Odporúčame ikonu bez pevnej farby (fill="currentColor").',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'url' },
  },
});
