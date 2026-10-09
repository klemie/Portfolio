import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImage} from './types'

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  // Public dataset, so no token. useCdn serves cached responses from the edge.
  useCdn: true,
})

const builder = imageUrlBuilder(sanityClient)

export const urlFor = (source: SanityImage) => builder.image(source)
