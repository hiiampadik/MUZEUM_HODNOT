import { defineType, defineField } from 'sanity';
import { DocumentIcon } from '@sanity/icons';
import { EmojiInput } from '../components/EmojiInput';

/** A downloadable file with a display name. Used in exhibitions and page builders. */
export const materialFile = defineType({
  name: 'materialFile',
  title: 'Materiál',
  type: 'object',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Názov',
      type: 'string',
      description: 'Ako sa súbor pomenuje na webe.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'emoji',
      title: 'Emoji',
      type: 'string',
      description: 'Voliteľné emoji pred názvom. Ak je prázdne, použije sa 📁.',
      components: { input: EmojiInput },
    }),
    defineField({
      name: 'file',
      title: 'Súbor',
      type: 'file',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', emoji: 'emoji' },
    prepare({ title, emoji }) {
      return {
        title: [emoji, title].filter(Boolean).join(' ') || 'Materiál',
        subtitle: 'Materiál na stiahnutie',
      };
    },
  },
});
