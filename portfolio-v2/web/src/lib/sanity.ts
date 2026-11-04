import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImage} from './types'

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  // Preview edits immediately in development; use the edge cache in production.
  // The dataset is public, so neither mode needs a token.
  useCdn: !import.meta.env.DEV,
})

const builder = imageUrlBuilder(sanityClient)

export const urlFor = (source: SanityImage) => builder.image(source)
