import { defineType, defineField } from 'sanity';
import { HomeIcon } from '@sanity/icons';

/**
 * Homepage (singleton).
 * Exhibitions are not referenced here — the frontend queries all exhibitions and
 * groups them (active / upcoming / past) by date. The three hero tiles are fixed
 * and derived on the frontend (current exhibitions / value generator / education).
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
      name: 'introTitle',
      title: 'Popis projektu — nadpis',
      type: 'string',
      description: 'Napr. „Múzeum hodnôt — Obrazová správa o Slovensku".',
    }),
    defineField({
      name: 'introImage',
      title: 'Popis projektu — obrázok',
      type: 'image',
      options: { hotspot: true },
      description: 'Dekoratívny obrázok vedľa textu.',
    }),
    defineField({
      name: 'intro',
      title: 'Popis projektu',
      type: 'richTextBasic',
      description:
        'Na webe sa zobrazí prvých ~15 riadkov, zvyšok sa postupne stratí a rozbalí tlačidlom.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Domovská stránka' };
    },
  },
});
