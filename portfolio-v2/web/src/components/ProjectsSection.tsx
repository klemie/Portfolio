import type {Project} from '../lib/types'
import './ProjectsSection.css'

interface ProjectsSectionProps {
  projects: Project[]
  onOpen: (slug: string) => void
}

export const ProjectsSection = ({projects, onOpen}: ProjectsSectionProps) => (
  <section className="section" id="projects">
    <h2>Projects</h2>
    {projects.map((project) => (
      <button
        key={project._id}
        type="button"
        className="project-button"
        onClick={() => onOpen(project.slug)}
      >
        <h3>{project.title}</h3>
        {project.timeline.length > 0 && (
          <p className="entry-meta">{project.timeline.join(' — ')}</p>
        )}
        <p>{project.overview}</p>
        <ul className="tags">
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </button>
    ))}
  </section>
)
