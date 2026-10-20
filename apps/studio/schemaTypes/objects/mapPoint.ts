import { defineType, defineField } from 'sanity';
import { PinIcon } from '@sanity/icons';
import { GeopointMapInput } from '../components/GeopointMapInput';

/**
 * A point on the Generátor hodnôt map (a school).
 * Popover content: title, address, campaign URL (shown as a pill). Position via geopoint.
 * The same points feed the school list under the map (with the address).
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
      name: 'url',
      title: 'Odkaz',
      type: 'url',
      description: 'Adresa stránky kampane (napr. na Darujme.sk).',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
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
      name: 'address',
      title: 'Adresa',
      type: 'string',
      description: 'Zobrazí sa v zozname škôl pod mapou a v okne bodu na mape.',
    }),
  ],
  preview: {
    select: { title: 'title', address: 'address', url: 'url' },
    prepare({ title, address, url }) {
      return {
        title: title || 'Bod na mape',
        subtitle: [address, url].filter(Boolean).join(' · '),
      };
    },
  },
});
