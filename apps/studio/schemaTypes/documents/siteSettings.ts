import { defineType, defineField, defineArrayMember } from 'sanity';
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
  fieldsets: [
    {
      name: 'museumPartners',
      title: 'Partneri projektu Múzeum hodnôt',
      options: { columns: 1 },
    },
    {
      name: 'valuesPartners',
      title: 'Partneri projektu Generátor hodnôt',
      options: { columns: 1 },
    },
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
      title: 'Text',
      type: 'richTextBasic',
      group: 'footer',
      fieldset: 'museumPartners',
      description: 'Voliteľný text nad logami partnerov.',
    }),
    defineField({
      name: 'partnerLogos',
      title: 'Logá',
      type: 'array',
      group: 'footer',
      fieldset: 'museumPartners',
      of: [defineArrayMember({ type: 'partnerLogo' })],
    }),
    defineField({
      name: 'valuesPartnersText',
      title: 'Text',
      type: 'richTextBasic',
      group: 'footer',
      fieldset: 'valuesPartners',
      description: 'Voliteľný text nad logami partnerov.',
    }),
    defineField({
      name: 'valuesPartnerLogos',
      title: 'Logá',
      type: 'array',
      group: 'footer',
      fieldset: 'valuesPartners',
      of: [defineArrayMember({ type: 'partnerLogo' })],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Nastavenia webu' };
    },
  },
});
