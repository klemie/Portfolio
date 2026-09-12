import {defineField, defineType} from 'sanity'

/**
 * A stop on the flyover ride.
 *
 * Stops hold prose and references only — their map position comes from a
 * `<wpt>` element in the uploaded GPX route, matched on `waypointName`. That
 * keeps pins on the route line by construction, so the camera never has to
 * leave the track to reach one. See docs/flyover-spec.md §3.
 */
export const stopType = defineType({
  name: 'stop',
  title: 'Ride Stop',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'waypointName',
      title: 'Waypoint name',
      description:
        'Must match a <wpt><name> in the GPX route exactly. Defaults to the title.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      description: 'Ride order, following the route. Lowest first.',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'blurb',
      description: 'About the place itself. Budget ~60 words — that is what 100vh of scroll buys.',
      type: 'text',
      rows: 4,
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return 'Not written yet'
          const words = value.trim().split(/\s+/).length
          if (words > 90) return `${words} words — over budget, aim for ~60`
          return true
        }),
    }),
    defineField({
      name: 'experiences',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'experience'}]}],
    }),
    defineField({
      name: 'projects',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'project'}]}],
    }),
  ],
  orderings: [
    {
      title: 'Ride order',
      name: 'rideOrder',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'title', order: 'order', blurb: 'blurb'},
    prepare: ({title, order, blurb}) => ({
      title: `${order ?? '?'}. ${title}`,
      subtitle: blurb ? blurb.slice(0, 60) : '— blurb not written —',
    }),
  },
})
