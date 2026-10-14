import {defineField, defineType} from 'sanity'

export const educationType = defineType({
  name: 'education',
  title: 'Education',
  type: 'object',
  fields: [
    defineField({
      name: 'degree',
      title: 'Degree',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startYear',
      title: 'Study start year',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1900),
    }),
    defineField({
      name: 'endYear',
      title: 'Study end year',
      description: 'Leave empty for ongoing studies.',
      type: 'number',
      validation: (rule) => rule.integer().min(1900),
    }),
    defineField({name: 'specializations', type: 'array', of: [{type: 'string'}]}),
    defineField({
      name: 'awards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'educationAward',
          fields: [
            defineField({
              name: 'title',
              title: 'Award name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'year',
              type: 'number',
              validation: (rule) => rule.integer().min(1900),
            }),
            defineField({name: 'description', title: 'Details', type: 'text', rows: 2}),
          ],
          preview: {select: {title: 'title', subtitle: 'year'}},
        },
      ],
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const period = value as {startYear?: number; endYear?: number} | undefined
      if (
        period?.startYear != null &&
        period.endYear != null &&
        period.endYear < period.startYear
      ) {
        return 'The study end year must be the same as or later than the start year.'
      }
      return true
    }),
  preview: {select: {title: 'degree'}},
})
