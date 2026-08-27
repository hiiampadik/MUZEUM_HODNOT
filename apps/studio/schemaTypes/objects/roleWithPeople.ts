import { defineType, defineField } from 'sanity';
import { UsersIcon } from '@sanity/icons';

/**
 * A role plus the people in it. Used for exhibition optional roles (kurátorka, ...)
 * and the "Dále se podíleli" list. Multiple people go in one comma-separated string.
 */
export const roleWithPeople = defineType({
  name: 'roleWithPeople',
  title: 'Rola a ľudia',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'role',
      title: 'Rola',
      type: 'string',
      description: 'Napr. Kurátorka, Odborná spolupráca.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'people',
      title: 'Ľudia',
      type: 'string',
      description: 'Viac mien oddeľte čiarkou.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'role', subtitle: 'people' },
  },
});
