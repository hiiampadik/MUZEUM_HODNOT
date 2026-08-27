import { defineType, defineField } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons';

/** Contact page (singleton). Its data also feeds the footer contact block. */
export const contactPage = defineType({
  name: 'contactPage',
  title: 'Kontakt',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'cover',
      title: 'Cover obrázok',
      type: 'coverImage',
    }),
    defineField({
      name: 'phone',
      title: 'Telefón',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'E-mail',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'address',
      title: 'Adresa',
      type: 'richTextBasic',
    }),
    defineField({
      name: 'administrativeInfo',
      title: 'Administratívne údaje',
      type: 'richTextBasic',
      description: 'IČO a ďalšie údaje.',
    }),
    defineField({
      name: 'people',
      title: 'Ľudia v projekte',
      type: 'array',
      of: [{ type: 'person' }],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Kontakt' };
    },
  },
});
