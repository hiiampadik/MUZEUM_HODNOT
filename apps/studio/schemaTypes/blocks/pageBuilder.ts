import { defineType, defineArrayMember } from 'sanity';

/**
 * Shared page builder used by Zážitkové vzdelávanie and Generátor hodnôt.
 * An ordered list of composable content blocks.
 */
export const pageBuilder = defineType({
  name: 'pageBuilder',
  title: 'Obsah',
  type: 'array',
  of: [
    defineArrayMember({ type: 'textBlock' }),
    defineArrayMember({ type: 'headingBlock' }),
    defineArrayMember({ type: 'decorativeImage' }),
    defineArrayMember({ type: 'tileBlock' }),
    defineArrayMember({ type: 'materialsBlock' }),
  ],
});
