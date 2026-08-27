import { defineType, defineField } from 'sanity';
import { SquareIcon } from '@sanity/icons';

/**
 * A navigation tile at the top of the homepage (2–3 of them).
 * `target` decides where it points:
 *  - exhibitions: links to all current exhibitions (handled on the frontend)
 *  - valueGenerator / experientialEducation: fixed subpages
 *  - custom: an arbitrary link
 */
export const heroTile = defineType({
  name: 'heroTile',
  title: 'Dlaždica',
  type: 'object',
  icon: SquareIcon,
  fields: [
    defineField({
      name: 'target',
      title: 'Cieľ',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Aktuálne výstavy', value: 'exhibitions' },
          { title: 'Generátor hodnôt', value: 'valueGenerator' },
          { title: 'Zážitkové vzdelávanie', value: 'experientialEducation' },
          { title: 'Vlastný odkaz', value: 'custom' },
        ],
      },
      initialValue: 'exhibitions',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Nadpis',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Obrázok',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'customLink',
      title: 'Vlastný odkaz',
      type: 'namedLink',
      hidden: ({ parent }) => parent?.target !== 'custom',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { target?: string } | undefined;
          if (parent?.target === 'custom' && !value) {
            return 'Vyplňte vlastný odkaz.';
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'target', media: 'image' },
  },
});
