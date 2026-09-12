import {defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'Short line under your name in the hero',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headshot',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'resume',
      title: 'Resume (PDF)',
      type: 'file',
      options: {accept: '.pdf'},
    }),
    defineField({
      name: 'routeGpx',
      title: 'Flyover route (GPX)',
      description:
        'Strava route export. Supplies both the ride line and the pins — each stop needs a matching <wpt>. Activity exports have no waypoints; use the route builder.',
      type: 'file',
      options: {accept: '.gpx'},
    }),
    defineField({
      name: 'gitHubLink',
      type: 'url',
    }),
    defineField({
      name: 'linkedInLink',
      type: 'url',
    }),
    defineField({
      name: 'websiteLink',
      type: 'url',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'tagline'},
  },
})
