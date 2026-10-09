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
      name: 'experience',
      title: 'Experience',
      description: 'The role or academic experience this project belongs to. It appears in that experience’s project viewer.',
      type: 'reference',
      to: [{type: 'experience'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'viewerOrder',
      title: 'Project order',
      description: 'Order within this experience. Lowest first; the first project is shown when the experience opens.',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
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
      of: [{type: 'image', options: {hotspot: true}, fields: [
        defineField({name: 'alt', title: 'Description', type: 'string', description: 'Describes the image for screen readers and its gallery caption.'}),
      ]}]
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
      name: 'embedUrl',
      title: 'Embedded preview URL',
      description: 'Optional HTTPS URL that allows iframe embedding. Use the provider’s embed/preview URL. Leave empty for photos and external links; GitHub and LinkedIn pages cannot be embedded.',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'presentations',
      title: 'Slide presentations',
      description: 'Decks visitors can switch between in the project viewer. Use HTTPS embed URLs.',
      type: 'array',
      of: [{type: 'object', name: 'presentation', fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'url', title: 'Embed URL', type: 'url', validation: (rule) => rule.required().uri({scheme: ['https']})}),
      ], preview: {select: {title: 'title'}}}],
    }),
    defineField({
      name: 'previewUrl',
      title: 'External project preview URL',
      description: 'Shows a project preview using the first gallery image, with a link to open the app in a new tab. Use when iframe embedding is unavailable.',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['https']}),
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
  preview: {
    select: {title: 'title', position: 'experience.position', company: 'experience.company', media: 'images.0'},
    prepare: ({title, position, company, media}) => ({title, subtitle: company ? `${company} — ${position}` : 'Choose an experience', media}),
  },
})
