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
      title: 'Cover obrázok (náhľad)',
      type: 'coverImage',
      description:
        'Hlavný náhľadový obrázok — používa sa pre OG (zdieľanie) a dlaždicu na domovskej stránke. Bez ditheringu.',
    }),
    defineField({
      name: 'topCover',
      title: 'Cover — horný okraj',
      type: 'coverImage',
      description:
        'Obrázok pri vrchu stránky, roztiahnutý cez celú šírku. Nahráva sa v originálnej veľkosti (bez zmenšovania).',
    }),
    defineField({
      name: 'bottomCover',
      title: 'Cover — spodný okraj',
      type: 'coverImage',
      description:
        'Obrázok pri spodku stránky (nad pätičkou), roztiahnutý cez celú šírku. Originálna veľkosť.',
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
