/** Preview by default. PORTFOLIO_APPLY_VIDEO=1 uploads and attaches one clip. */
import {createHash} from 'node:crypto'
import {createReadStream} from 'node:fs'
import {readFile, stat} from 'node:fs/promises'
import {basename, extname} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false})
const required = (name: string) => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}
type VideoEntry = {_key: string; file: {_type: 'file'; asset: {_type: 'reference'; _ref: string}}; [key: string]: unknown}

async function publish() {
  const slug = required('PORTFOLIO_VIDEO_PROJECT')
  const path = required('PORTFOLIO_VIDEO_FILE')
  const title = required('PORTFOLIO_VIDEO_TITLE')
  const posterPath = process.env.PORTFOLIO_VIDEO_POSTER?.trim()
  if (extname(path).toLowerCase() !== '.mp4') throw new Error('Use a browser-compatible MP4 file')
  const size = (await stat(path)).size
  if (!size) throw new Error('Video is empty')
  const body = await readFile(path)
  if (body.toString('ascii', 4, 8) !== 'ftyp') throw new Error('Video must be an MP4 container')
  if (posterPath) {
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extname(posterPath).toLowerCase())) throw new Error('Poster must be JPEG, PNG, or WebP')
    await stat(posterPath)
  }
  const projects = await client.fetch<{_id: string; _rev: string; title: string; videos?: VideoEntry[]}[]>(
    '*[_type == "project" && !(_id in path("drafts.**")) && slug.current == $slug]{_id,_rev,title,videos}', {slug},
  )
  if (projects.length !== 1) throw new Error(`Expected exactly one published project with slug ${slug}`)
  const project = projects[0]
  console.log(`${project.title} → ${title}\nVideo: ${basename(path)} (${size} bytes)${posterPath ? `\nPoster: ${basename(posterPath)}` : ''}`)
  if (process.env.PORTFOLIO_APPLY_VIDEO !== '1') {
    console.log('Preview only. Set PORTFOLIO_APPLY_VIDEO=1 to upload to this project’s Sanity dataset and publish.')
    return
  }
  const asset = await client.assets.upload('file', createReadStream(path), {filename: basename(path), contentType: 'video/mp4'})
  const response = await fetch(asset.url, {headers: {Range: 'bytes=0-31'}, signal: AbortSignal.timeout(15000)})
  await response.body?.cancel()
  if (response.status !== 206 || !response.headers.get('content-type')?.startsWith('video/') || !response.headers.get('content-range')?.startsWith('bytes 0-31/')) {
    throw new Error('Uploaded video must be reachable with byte-range support before publishing')
  }
  const poster = posterPath ? await client.assets.upload('image', createReadStream(posterPath), {filename: basename(posterPath)}) : null
  const entry: VideoEntry = {
    _type: 'projectVideo', _key: `video-${createHash('sha256').update(body).digest('hex').slice(0, 16)}`, title,
    file: {_type: 'file', asset: {_type: 'reference', _ref: asset._id}},
    ...(poster ? {poster: {_type: 'image', asset: {_type: 'reference', _ref: poster._id}}} : {}),
  }
  const videos = [...(project.videos ?? [])]
  const existing = videos.findIndex((video) => video._key === entry._key || video.file?.asset?._ref === asset._id)
  if (existing < 0) videos.push(entry)
  else videos[existing] = {...entry, _key: videos[existing]._key}
  await client.patch(project._id).ifRevisionId(project._rev).set({videos}).commit()
  console.log(`Gallery video published: ${asset.url}`)
}

publish().catch((error) => {console.error(error.message ?? error); process.exit(1)})
