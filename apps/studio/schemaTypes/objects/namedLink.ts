import { defineType, defineField } from 'sanity';
import { LinkIcon } from '@sanity/icons';

/** A link with a display label (exhibition links, tile targets, map point link). */
export const namedLink = defineType({
  name: 'namedLink',
  title: 'Odkaz',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Názov',
      type: 'string',
      description: 'Ako sa odkaz zobrazí na webe.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'href' },
  },
});
