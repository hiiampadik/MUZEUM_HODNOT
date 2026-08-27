import { defineType, defineArrayMember } from 'sanity';

/**
 * Basic rich text: bold, italic, links, multiple paragraphs.
 * Used for footer "Partneri projektu", exhibition abstract, contact address, etc.
 */
export const richTextBasic = defineType({
  name: 'richTextBasic',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
      lists: [],
      marks: {
        decorators: [
          { title: 'Tučné', value: 'strong' },
          { title: 'Kurzíva', value: 'em' },
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
