import { defineType, defineField, defineArrayMember } from 'sanity';
import { LockIcon } from '@sanity/icons';
import { DarujmeFeedInput } from '../components/DarujmeFeedInput';

/**
 * Fixed ID of the Darujme.sk feed mapping. The dot makes it a private document:
 * the dataset is public, but documents whose `_id` contains a `.` are only
 * readable with a token. Feed IDs must stay private because Darujme feeds expose
 * donor names and e-mails. Read only by the donations Worker (apps/donations).
 */
export const DARUJME_FEEDS_ID = 'secrets.darujmeFeeds';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Darujme.sk feeds per school (singleton, private). */
export const darujmeFeeds = defineType({
  name: 'darujmeFeeds',
  title: 'Darujme.sk feedy',
  type: 'document',
  icon: LockIcon,
  fields: [
    defineField({
      name: 'feeds',
      title: 'Feedy škôl',
      description:
        'Ku každej škole z mapy Generátora hodnôt priraď ID feedu z Darujme.sk. Web z neho ' +
        'zobrazí vyzbieranú sumu. Tento dokument nie je verejný — ID feedov sa nikde ' +
        'nezobrazujú (feed obsahuje mená a e-maily darcov).',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'darujmeFeed',
          title: 'Feed školy',
          type: 'object',
          components: { input: DarujmeFeedInput },
          fields: [
            // Set by DarujmeFeedInput from the value-generator map points.
            defineField({ name: 'schoolKey', title: 'Škola', type: 'string', hidden: true }),
            defineField({ name: 'schoolTitle', title: 'Názov školy', type: 'string', hidden: true }),
            defineField({
              name: 'feedId',
              title: 'ID feedu',
              type: 'string',
              description:
                'UUID z adresy feedu: https://api.darujme.sk/v1/feeds/<ID>/donations/',
              validation: (rule) =>
                rule.required().regex(UUID, { name: 'UUID' }).error('Zadaj platné UUID feedu.'),
            }),
          ],
          validation: (rule) =>
            rule.custom((value: { schoolKey?: string } | undefined) =>
              value?.schoolKey ? true : 'Vyber školu.',
            ),
          preview: {
            select: { title: 'schoolTitle', feedId: 'feedId' },
            prepare({ title, feedId }) {
              return { title: title || 'Bez školy', subtitle: feedId || 'Bez ID feedu' };
            },
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((items: { schoolKey?: string }[] | undefined) => {
          const keys = (items ?? []).map((i) => i.schoolKey).filter(Boolean);
          return new Set(keys).size === keys.length ? true : 'Každá škola môže mať len jeden feed.';
        }),
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Darujme.sk feedy' };
    },
  },
});
