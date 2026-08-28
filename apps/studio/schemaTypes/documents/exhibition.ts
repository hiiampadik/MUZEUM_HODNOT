import { defineType, defineField, defineArrayMember } from 'sanity';
import { CalendarIcon } from '@sanity/icons';

/**
 * Exhibition (multiple documents).
 * The "Aktuálne" tag and homepage categories (upcoming / active / past) are derived
 * on the frontend from startDate/endDate — not stored here.
 */
export const exhibition = defineType({
  name: 'exhibition',
  title: 'Výstava',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    { name: 'main', title: 'Základné údaje', default: true },
    { name: 'content', title: 'Obsah' },
    { name: 'attachments', title: 'Materiály a odkazy' },
    { name: 'credits', title: 'Ľudia' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Názov',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'main',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'canOpenDetail',
      title: 'Povoliť detail výstavy',
      type: 'boolean',
      group: 'main',
      description:
        'Ak je vypnuté, výstava sa zobrazí len so základnými údajmi bez prekliku na detail.',
      initialValue: true,
    }),
    defineField({
      name: 'foreignLanguage',
      title: 'Cudzojazyčná výstava',
      type: 'boolean',
      group: 'main',
      description:
        'Ak je zapnuté, UI texty na detaile tejto výstavy budú v angličtine. Navigácia a pätička zostávajú po slovensky.',
      initialValue: false,
    }),
    defineField({
      name: 'place',
      title: 'Miesto',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'openingDate',
      title: 'Dátum vernisáže',
      type: 'date',
      group: 'main',
      options: { dateFormat: 'DD.MM.YYYY' },
    }),
    defineField({
      name: 'startDate',
      title: 'Začiatok trvania',
      type: 'date',
      group: 'main',
      options: { dateFormat: 'DD.MM.YYYY' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Koniec trvania',
      type: 'date',
      group: 'main',
      options: { dateFormat: 'DD.MM.YYYY' },
      description: 'Podľa konca sa určuje, či je výstava „Aktuálna".',
      validation: (rule) =>
        rule.required().custom((endDate, context) => {
          const start = (context.document as { startDate?: string })?.startDate;
          if (start && endDate && endDate < start) {
            return 'Koniec musí byť po začiatku.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'roles',
      title: 'Roly',
      type: 'array',
      group: 'main',
      description: 'Voliteľné, napr. Kurátorka a Odborná spolupráca (max. 2).',
      of: [defineArrayMember({ type: 'roleWithPeople' })],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: 'cover',
      title: 'Cover obrázok (náhľad)',
      type: 'coverImage',
      group: 'content',
      description:
        'Hlavný náhľadový obrázok — používa sa pre OG (zdieľanie) a dlaždicu na domovskej stránke. Bez ditheringu.',
    }),
    defineField({
      name: 'topCover',
      title: 'Cover — horný okraj',
      type: 'coverImage',
      group: 'content',
      description:
        'Obrázok pri vrchu stránky, roztiahnutý cez celú šírku. Nahráva sa v originálnej veľkosti (bez zmenšovania).',
    }),
    defineField({
      name: 'bottomCover',
      title: 'Cover — spodný okraj',
      type: 'coverImage',
      group: 'content',
      description:
        'Obrázok pri spodku stránky (nad pätičkou), roztiahnutý cez celú šírku. Originálna veľkosť.',
    }),
    defineField({
      name: 'gallery',
      title: 'Galéria',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'galleryImage' })],
    }),
    defineField({
      name: 'summary',
      title: 'Zhrnutie',
      type: 'text',
      rows: 3,
      group: 'content',
      description:
        'Krátke zhrnutie výstavy — používa sa v zozname výstav na domovskej stránke.',
    }),
    defineField({
      name: 'abstract',
      title: 'Abstrakt',
      type: 'richTextBasic',
      group: 'content',
    }),
    defineField({
      name: 'materials',
      title: 'Materiály',
      type: 'array',
      group: 'attachments',
      of: [defineArrayMember({ type: 'materialFile' })],
    }),
    defineField({
      name: 'links',
      title: 'Odkazy',
      type: 'array',
      group: 'attachments',
      of: [defineArrayMember({ type: 'namedLink' })],
    }),
    defineField({
      name: 'contributors',
      title: 'Ďalej sa podieľali',
      type: 'array',
      group: 'credits',
      of: [defineArrayMember({ type: 'roleWithPeople' })],
    }),
  ],
  preview: {
    select: { title: 'title', place: 'place', media: 'cover' },
    prepare({ title, place, media }) {
      return { title: title || 'Výstava', subtitle: place, media };
    },
  },
});
