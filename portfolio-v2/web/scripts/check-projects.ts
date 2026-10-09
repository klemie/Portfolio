import assert from 'node:assert/strict'
import {projectLinks, projectMedia, projectPreviewLink, projectUrl} from '../src/lib/projectMedia'
import {previewProjectRelations} from '../src/lib/developmentContent'
import {resolveVisit} from '../src/lib/visit'
import type {Experience, Project, Stop} from '../src/lib/types'

const project = (slug: string, fields: Partial<Project> = {}): Project => ({
  _id: `project-${slug}`, slug, title: slug, overview: '', skillDescription: '', timeline: [], skills: [], technologies: [], hasDemo: false, ...fields,
})
const experience = (_id: string): Experience => ({_id, company: 'UVic', position: _id, startDate: '2022-01-01', about: '', skills: [], projects: []})
const image = {asset: {_type: 'reference' as const, _ref: 'image-example-100x100-jpg'}}

for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'http://example.com', 'https://user:password@example.com', 'not a URL']) assert.equal(projectUrl(url), null)
assert.equal(projectUrl('https://example.com/demo'), 'https://example.com/demo')
assert.equal(projectPreviewLink('https://embed.figma.com/deck/example?embed-host=portfolio&node-id=1-98'), 'https://www.figma.com/deck/example?node-id=1-98')
assert.equal(projectPreviewLink('https://example.com/demo'), 'https://example.com/demo')
const photosOnly = project('photos', {images: [image, image]})
assert.deepEqual(projectMedia(photosOnly).map((item) => item.kind), ['image', 'image'])
assert.deepEqual(projectMedia(project('demo', {embedUrl: 'https://example.com/demo', images: [image]})).map((item) => item.kind), ['embed', 'image'])
assert.equal(projectMedia(project('invalid', {embedUrl: 'javascript:alert(1)'})).length, 0)
assert.deepEqual(projectLinks(project('links', {hasDemo: true, demoLink: 'https://example.com', websiteLink: 'https://example.com/', gitHubLink: 'javascript:alert(1)'})), [{label: 'View demo', href: 'https://example.com/'}])

const externalPreview = project('external-preview', {previewUrl: 'https://example.com/app', localImages: [{src: '/images/app.jpg', alt: 'App screenshot'}]})
assert.deepEqual(projectMedia(externalPreview).map((item) => item.kind), ['preview', 'image'])
assert.deepEqual(projectMedia({...externalPreview, embedUrl: 'https://example.com/embed'}).map((item) => item.kind), ['embed', 'image'], 'Embeddable demos take precedence over external previews')
assert.deepEqual(projectMedia({...externalPreview, previewUrl: 'javascript:alert(1)'}).map((item) => item.kind), ['image'])

assert.deepEqual(projectMedia(project('presentations', {presentations: [
  {title: 'Growth', url: 'https://embed.figma.com/deck/growth'},
  {title: 'SEO', url: 'https://embed.figma.com/deck/seo'},
  {title: 'Invalid', url: 'javascript:alert(1)'},
]})).map((item) => item.label), ['Growth', 'SEO'])

const technical = experience('experience-uvic-rocketry-technical-coordinator')
const avionics = experience('experience-uvic-rocketry-avionics-co-lead')
const propulsion = experience('experience-uvic-rocketry-propulsion-member')
const stop: Stop = {_id: 'stop-uvic', title: 'UVic', waypointName: 'UVic 2', order: 3, experiences: [propulsion, avionics, technical], projects: []}
const source = [project('ground-support'), project('xenia-1-flight-computer'), project('hybrid-controls-system'), project('tabletapp')]
const preview = previewProjectRelations(source, [technical, avionics, propulsion], [stop])
assert.equal(source[0].experienceId, undefined, 'Preview must not mutate fetched content')
assert.equal(stop.experiences.length, 3, 'Preview must not change the fetched stop')
assert.deepEqual(preview.experiences.find((role) => role._id === technical._id)?.projects.map((item) => item.slug), ['ground-support'])
assert.deepEqual(preview.experiences.find((role) => role._id === avionics._id)?.projects.map((item) => item.slug), ['xenia-1-flight-computer'])
assert.deepEqual(preview.experiences.find((role) => role._id === 'experience-uvic-capstone')?.projects.map((item) => item.slug), ['tabletapp'])
assert.equal(preview.stops[0].experiences.at(-1)?._id, technical._id)
assert.equal(resolveVisit({kind: 'projects', id: 'tabletapp'}, preview.stops, preview.projects, preview.experiences)?.stop?._id, 'stop-uvic')
assert.equal(resolveVisit({kind: 'stops', id: 'stop-uvic'}, preview.stops, preview.projects, preview.experiences)?.featuredExperience?._id, technical._id)
assert.equal(resolveVisit({kind: 'experiences', id: avionics._id}, preview.stops, preview.projects, preview.experiences)?.experience?.projects.length, 1)
const authored = project('ground-support', {experienceId: propulsion._id, embedUrl: 'https://example.com/authored'})
assert.equal(previewProjectRelations([authored], [propulsion], [stop]).projects[0], authored, 'Published relationships must take priority over preview mapping')
assert.equal(previewProjectRelations([project('unknown')], [technical], [stop]).projects[0].experienceId, null, 'Unknown projects must never be guessed into a role')
const shift = experience('experience-shift-product-engineer')
const shiftStop: Stop = {...stop, _id: 'stop-shift', title: 'Shift Browser', experiences: [shift]}
const shiftPreview = previewProjectRelations([], [shift], [shiftStop])
assert.deepEqual(shiftPreview.experiences[0].projects.map((item) => item.title), ['PDF App', 'Agent Toolkit Seminar', 'Apps Directory'])
assert.equal(shift.projects.length, 0, 'Draft preview must not mutate the fetched Shift role')
assert.equal(resolveVisit({kind: 'projects', id: 'shift-pdf-app'}, shiftPreview.stops, shiftPreview.projects, shiftPreview.experiences)?.stop?._id, 'stop-shift')
const publishedApps = project('shift-apps-directory', {title: 'Apps Directory', experienceId: shift._id, overview: 'Authored description'})
const publishedPreview = previewProjectRelations([publishedApps], [shift], [shiftStop])
assert.equal(publishedPreview.projects.length, 3, 'Published projects must not be duplicated by draft preview')
assert.equal(publishedPreview.experiences[0].projects.find((item) => item._id === publishedApps._id), publishedApps, 'Authored project content must take priority')
console.log('Project checks passed: role membership, capstone grouping, direct URLs, media ordering, safe URLs, link deduplication, and authored-content precedence.')
