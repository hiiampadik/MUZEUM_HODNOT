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
  ],
  preview: {
    prepare() {
      return { title: 'Zážitkové vzdelávanie' };
    },
  },
});
