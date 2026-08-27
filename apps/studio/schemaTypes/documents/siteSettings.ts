import { defineType, defineField } from 'sanity';
import { CogIcon } from '@sanity/icons';

/**
 * Site-wide settings (singleton).
 * Navigation's fixed items (Kontakt, Zážitkové vzdelávanie, Generátor hodnôt) are
 * hardcoded routes on the frontend; only the optional donate link is editable here.
 * Footer contact + administrative info are read from the Contact page.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Nastavenia webu',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'navigation', title: 'Navigácia' },
    { name: 'footer', title: 'Pätička' },
  ],
  fields: [
    defineField({
      name: 'donateLink',
      title: 'Odkaz na Darujme.sk',
      type: 'namedLink',
      group: 'navigation',
      description: 'Voliteľný odkaz v navigácii (napr. na Darujme.sk).',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Sociálne siete',
      type: 'array',
      group: 'footer',
      of: [{ type: 'socialLink' }],
    }),
    defineField({
      name: 'partners',
      title: 'Partneri projektu',
      type: 'richTextBasic',
      group: 'footer',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Nastavenia webu' };
    },
  },
});
