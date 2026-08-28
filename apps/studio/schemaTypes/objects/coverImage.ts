import { defineType } from 'sanity';
import { ImageIcon } from '@sanity/icons';

/**
 * Cover image used at the top and bottom of a page.
 * The gradient + dithering effect is applied on the frontend (see CLAUDE.md).
 */
export const coverImage = defineType({
  name: 'coverImage',
  title: 'Cover obrázok',
  type: 'image',
  icon: ImageIcon,
  options: { hotspot: true },
  // Covers are decorative (rendered as dithered backgrounds) — no alt needed.
});
