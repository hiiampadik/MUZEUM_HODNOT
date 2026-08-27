import { defineType, defineField } from 'sanity';
import { RocketIcon } from '@sanity/icons';

/** Zážitkové vzdelávanie (singleton): cover + page builder. */
export const experientialEducation = defineType({
  name: 'experientialEducation',
  title: 'Zážitkové vzdelávanie',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'cover',
      title: 'Cover obrázok',
      type: 'coverImage',
    }),
    defineField({
      name: 'content',
      title: 'Obsah',
      type: 'pageBuilder',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Zážitkové vzdelávanie' };
    },
  },
});
