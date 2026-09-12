import {defineField, defineType} from 'sanity'

export const experienceType = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'position',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startDate',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      type: 'date',
    }),
    defineField({
      name: 'about',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'skills',
      type: 'array',
      of: [{type: 'string'}],
      validation: (rule) => rule.required(),
    })
  ]
})