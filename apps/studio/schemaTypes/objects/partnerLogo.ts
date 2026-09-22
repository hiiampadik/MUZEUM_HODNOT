import { defineType, defineField } from 'sanity';
import { ImageIcon } from '@sanity/icons';

/** A partner/sponsor logo, optionally linking out to the partner's site. */
export const partnerLogo = defineType({
  name: 'partnerLogo',
  title: 'Logo partnera',
  type: 'image',
  icon: ImageIcon,
  options: { hotspot: false },
  fields: [
    defineField({
      name: 'name',
      title: 'Názov partnera',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Odkaz',
      type: 'url',
      description: 'Voliteľné.',
    }),
    defineField({
      name: 'alt',
      title: 'Alternatívny text',
      type: 'string',
      description: 'Voliteľné — ak nie je vyplnený, použije sa názov partnera.',
    }),
  ],
  preview: {
    select: { media: 'asset', title: 'name' },
    prepare({ media, title }) {
      return { media, title: title || 'Logo partnera' };
    },
  },
});
