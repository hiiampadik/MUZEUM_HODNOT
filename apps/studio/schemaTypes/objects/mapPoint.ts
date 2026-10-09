import { defineType, defineField } from 'sanity';
import { PinIcon } from '@sanity/icons';
import { GeopointMapInput } from '../components/GeopointMapInput';

/**
 * A point on the Generátor hodnôt map (a school).
 * Popover content: title, text block, link (shown as a pill). Position via geopoint.
 * The same points feed the school list under the map (with the fundraising goal).
 */
export const mapPoint = defineType({
  name: 'mapPoint',
  title: 'Bod na mape',
  type: 'object',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nadpis',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Poloha',
      type: 'geopoint',
      description:
        'Klikni do mapy alebo zadaj desatinné stupne (WGS84). Napr. Bratislava: Latitude 48.1486, ' +
        'Longitude 17.1077. Nadmorskú výšku (Altitude) nechaj prázdnu — mapa ju nepoužíva.',
      components: { input: GeopointMapInput },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'richTextBasic',
    }),
    defineField({
      name: 'link',
      title: 'Odkaz',
      type: 'namedLink',
      description: 'V zozname škôl pod mapou sa zobrazí ako „Zapojte sa na“.',
    }),
    defineField({
      name: 'goal',
      title: 'Potrebujeme (€)',
      type: 'number',
      description:
        'Cieľová suma zbierky v eurách. Zobrazí sa v zozname škôl pod mapou; ak je prázdna, ' +
        'suma ani priebeh zbierky sa nezobrazia.',
      validation: (rule) => rule.min(0).integer(),
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: title || 'Bod na mape', subtitle: 'Bod na mape' };
    },
  },
});
