import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// siteSettings is a singleton: one document, fixed id, no create/delete.
const SINGLETON_TYPES = new Set(['siteSettings'])

export default defineConfig({
  name: 'default',
  title: 'portfolio-v2',

  projectId: 'az7tzozl',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => !SINGLETON_TYPES.has(item.getId()!)),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Hide singletons from the global "create new document" menu
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETON_TYPES.has(schemaType)),
  },

  document: {
    actions: (actions, {schemaType}) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({action}) => action !== 'unpublish' && action !== 'delete')
        : actions,
  },
})
