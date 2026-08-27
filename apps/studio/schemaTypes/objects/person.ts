import { defineType, defineField } from 'sanity';
import { UserIcon } from '@sanity/icons';

/** A person in the project (Contact page): name(s), image, position. */
export const person = defineType({
  name: 'person',
  title: 'Osoba',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Meno',
      type: 'string',
      description: 'Viac mien oddeľte čiarkou.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'position',
      title: 'Pozícia',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Obrázok',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'position', media: 'image' },
  },
});
