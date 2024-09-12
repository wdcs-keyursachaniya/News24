import { defineType } from 'sanity';
import { BookIcon } from '@sanity/icons';

export default defineType({
  name: 'riskDisclaimer',
  title: 'Risk Disclaimer',
  icon: BookIcon, // You can use any appropriate icon
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'text',
      title: 'Text',
      type: 'text',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'language',
      title: 'Language',
      type: 'reference',
      to: [{ type: 'languages' }],
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'language.language',
    },
  },
});
