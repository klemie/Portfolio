import {defineField, defineType} from 'sanity'

export const cyclingEntryType = defineType({
  name: 'cyclingEntry',
  title: 'Cycling story',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'date', type: 'date'}),
    defineField({name: 'result', title: 'Race result', type: 'string'}),
    defineField({name: 'description', title: 'Story', type: 'text', rows: 4}),
    defineField({name: 'distanceKm', title: 'Distance (km)', type: 'number', validation: (rule) => rule.positive()}),
    defineField({name: 'elevationM', title: 'Elevation gain (m)', type: 'number', validation: (rule) => rule.min(0)}),
    defineField({name: 'url', title: 'Strava or route link', type: 'url', validation: (rule) => rule.uri({scheme: ['https']})}),
    defineField({name: 'image', title: 'Photo', type: 'image', options: {hotspot: true}, fields: [
      defineField({name: 'alt', title: 'Photo description', type: 'string', validation: (rule) => rule.required()}),
    ]}),
  ],
  preview: {select: {title: 'title', subtitle: 'result', media: 'image'}},
})
