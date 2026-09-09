import { defineType, defineField } from 'sanity';
import { InfoOutlineIcon } from '@sanity/icons';

/** O zážitkovom vzdelávaní (singleton): cover + page builder. */
export const aboutExperientialEducation = defineType({
  name: 'aboutExperientialEducation',
  title: 'O zážitkovom vzdelávaní',
  type: 'document',
  icon: InfoOutlineIcon,
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
      return { title: 'O zážitkovom vzdelávaní' };
    },
  },
});
