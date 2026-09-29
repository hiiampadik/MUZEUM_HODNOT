import { defineType, defineField, defineArrayMember } from 'sanity';
import { ImagesIcon } from '@sanity/icons';

/**
 * Preview `select` can't resolve a whole array of objects (it always came back
 * empty, so the subtitle read "0 fotografie"). Indexed paths do resolve, so the
 * item keys are selected one by one and counted — up to this cap, beyond which
 * the subtitle shows "24+".
 */
const MAX_COUNTED = 24;

const imageKeySelection = Object.fromEntries(
  Array.from({ length: MAX_COUNTED }, (_, i) => [`k${i}`, `images.${i}._key`]),
);

/** Slovak plural for "fotografia" (1 / 2–4 / 0 and 5+). */
function photoNoun(count: number) {
  if (count === 1) return 'fotografia';
  if (count >= 2 && count <= 4) return 'fotografie';
  return 'fotografií';
}

/** Page-builder block: a full-width horizontally scrollable photo gallery. */
export const galleryBlock = defineType({
  name: 'galleryBlock',
  title: 'Galéria',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Fotografie',
      type: 'array',
      of: [defineArrayMember({ type: 'galleryImage' })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { media: 'images.0', ...imageKeySelection },
    prepare(selection) {
      const keys = selection as Record<string, unknown>;
      let count = 0;
      while (count < MAX_COUNTED && keys[`k${count}`]) count += 1;
      const suffix = count === MAX_COUNTED ? '+' : '';
      return {
        title: 'Galéria',
        subtitle: `${count}${suffix} ${photoNoun(count)}`,
        media: selection.media,
      };
    },
  },
});
