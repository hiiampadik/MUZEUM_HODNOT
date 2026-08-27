import { defineType, defineField, defineArrayMember } from 'sanity';
import { EarthGlobeIcon } from '@sanity/icons';

/** Generátor hodnôt (singleton): cover + page builder + map with points. */
export const valueGenerator = defineType({
  name: 'valueGenerator',
  title: 'Generátor hodnôt',
  type: 'document',
  icon: EarthGlobeIcon,
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
    defineField({
      name: 'mapPoints',
      title: 'Body na mape',
      type: 'array',
      of: [defineArrayMember({ type: 'mapPoint' })],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Generátor hodnôt' };
    },
  },
});
