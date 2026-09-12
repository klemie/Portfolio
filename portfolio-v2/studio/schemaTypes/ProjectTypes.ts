import {defineField, defineType} from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'overview',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'skillDescription',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'timeline',
      type: 'array',
      of: [{type: 'string'}],
      validation: (rule) => rule.required().max(2)
    }),
    defineField({
      name: 'skills',
      type: 'array',
      of: [{type: 'string'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'technologies',
      type: 'array',
      of: [{type: 'string'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      type: 'array',
      of: [{type: 'image'}]
    }),
    defineField({
      name: 'hasDemo',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'demoLink',
      type: 'url',
      validation: (rule) => rule.custom((value, context) => {
        const { hasDemo } = context.document as { hasDemo?: boolean }

        if (hasDemo && !value) {
          return 'Demo link is required when hasDemo is true'
        }

        return true
      })
    }),
    defineField({
      name: 'gitHubLink',
      type: 'url',
    }),
    defineField({
      name: 'websiteLink',
      type: 'url',
    }),
    defineField({
      name: 'linkedInLink',
      type: 'url',
    }),
  ],
})