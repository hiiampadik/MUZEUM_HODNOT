import { defineType, defineArrayMember } from 'sanity';

/**
 * Full rich text: everything from richTextBasic + bullet lists + monospace decorator.
 * Used inside page-builder text blocks (Zážitkové vzdelávanie, Generátor hodnôt).
 * Note: H2/H3 headings are their own page-builder blocks, not styles here.
 */
export const richTextFull = defineType({
  name: 'richTextFull',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
      lists: [{ title: 'Odrážky', value: 'bullet' }],
      marks: {
        decorators: [
          { title: 'Tučné', value: 'strong' },
          { title: 'Kurzíva', value: 'em' },
          { title: 'Monospace', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Odkaz',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (rule) =>
                  rule
                    .required()
                    .uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
              },
            ],
          },
        ],
      },
    }),
  ],
});
