import { defineType, defineField, defineArrayMember } from 'sanity';
import { HomeIcon } from '@sanity/icons';

/**
 * Homepage (singleton).
 * Exhibitions are not referenced here — the frontend queries all exhibitions and
 * groups them (active / upcoming / past) by date.
 */
export const homePage = defineType({
  name: 'homePage',
  title: 'Domovská stránka',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'cover',
      title: 'Cover obrázok',
      type: 'coverImage',
    }),
    defineField({
      name: 'heroTiles',
      title: 'Navigačné dlaždice',
      type: 'array',
      description: '2 – 3 dlaždice na začiatku stránky.',
      of: [defineArrayMember({ type: 'heroTile' })],
      validation: (rule) => rule.min(2).max(3),
    }),
    defineField({
      name: 'introExcerpt',
      title: 'Popis projektu — úvod',
      type: 'richTextBasic',
      description: 'Časť textu, ktorá sa zobrazí hneď.',
    }),
    defineField({
      name: 'introRest',
      title: 'Popis projektu — pokračovanie',
      type: 'richTextBasic',
      description: 'Zvyšok textu skrytý za tlačidlom „Rozbaliť".',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Domovská stránka' };
    },
  },
});
