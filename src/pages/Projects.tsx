import {
  useEffect,
  useState
} from 'react'

import { projects as defaultProjects } from '../data/projects'

import {
  getStoredData,
  setStoredData
} from '../services/storage'

import {
  refreshWinterArc
} from '../services/refreshEngine'


type UserProject = {
  id: string
  name: string
  type: string
  status: string
  description: string
  technologies: string[]
}


const USER_PROJECTS_KEY =
  'winterArcUserProjects'


function getUserProjects(): UserProject[] {

  const stored =
    getStoredData<unknown>(
      USER_PROJECTS_KEY,
      []
    )

  if (!Array.isArray(stored)) {
    return []
  }

  return stored.filter(
    project =>
      project &&
      typeof project === 'object' &&
      typeof project.id === 'string' &&
      typeof project.name === 'string' &&
      typeof project.type === 'string' &&
      typeof project.status === 'string' &&
      typeof project.description === 'string' &&
      Array.isArray(project.technologies)
  ) as UserProject[]
}


function Projects() {

  const [userProjects, setUserProjects] =
    useState<UserProject[]>(
      getUserProjects
    )

  const [name, setName] =
    useState('')

  const [type, setType] =
    useState('Personal Project')

  const [status, setStatus] =
    useState('Planned')

  const [description, setDescription] =
    useState('')

  const [technologies, setTechnologies] =
    useState('')


  useEffect(() => {

    const handleRefresh = () => {
      setUserProjects(
        getUserProjects()
      )
    }

    window.addEventListener(
      'winterArcRefresh',
      handleRefresh
    )

    return () => {
      window.removeEventListener(
        'winterArcRefresh',
        handleRefresh
      )
    }

  }, [])


  const allProjects = [
    ...defaultProjects,
    ...userProjects
  ]


  const activeProjects =
    allProjects.filter(
      project => {

        const currentStatus =
          project.status
            .toLowerCase()

        return (
          currentStatus.includes('progress') ||
          currentStatus.includes('active')
        )

      }
    ).length


  function handleAddProject(
    event: React.FormEvent
  ) {

    event.preventDefault()

    const cleanName =
      name.trim()

    const cleanDescription =
      description.trim()

    const cleanTechnologies =
      technologies
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)

    if (
      !cleanName ||
      !cleanDescription
    ) {
      alert(
        'Please enter the project name and description.'
      )
      return
    }

    if (
      cleanTechnologies.length === 0
    ) {
      alert(
        'Please enter at least one technology.'
      )
      return
    }

    const newProject: UserProject = {
      id:
        `user-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      name: cleanName,

      type:
        type.trim() ||
        'Personal Project',

      status,

      description:
        cleanDescription,

      technologies:
        cleanTechnologies
    }

    const updatedProjects = [
      ...getUserProjects(),
      newProject
    ]

    setStoredData(
      USER_PROJECTS_KEY,
      updatedProjects
    )

    setUserProjects(
      updatedProjects
    )

    setName('')
    setType('Personal Project')
    setStatus('Planned')
    setDescription('')
    setTechnologies('')

    refreshWinterArc()
  }


  function handleDeleteProject(
    projectId: string
  ) {

    const updatedProjects =
      getUserProjects().filter(
        project =>
          project.id !== projectId
      )

    setStoredData(
      USER_PROJECTS_KEY,
      updatedProjects
    )

    setUserProjects(
      updatedProjects
    )

    refreshWinterArc()
  }


  return (
    <div>

      <h1>🚀 Projects</h1>

      <p className="page-subtitle">
        Build, track and document projects that
        turn your CSE knowledge into practical work.
      </p>


      <section className="projects-overview">

        <div>

          <span>
            PROJECT PORTFOLIO
          </span>

          <strong>
            {allProjects.length}
          </strong>

          <p>
            Projects currently tracked in Winter ARC.
          </p>

        </div>

        <div className="projects-overview-stat">

          <strong>
            {activeProjects}
          </strong>

          <span>
            Active / In Progress
          </span>

        </div>

      </section>


      <section className="analytics-section">

        <div className="projects-section-header">

          <div>

            <h2>
              🛠️ Project Portfolio
            </h2>

            <p>
              Keep your ideas, builds and portfolio
              work visible in one place.
            </p>

          </div>

          <span>
            {allProjects.length} PROJECTS
          </span>

        </div>


        <div className="projects-grid">

          {allProjects.map(project => (

            <article
              className="project-card"
              key={project.id}
            >

              <div className="project-header">

                <div>

                  <span className="project-type">
                    {project.type}
                  </span>

                  <h2>
                    {project.name}
                  </h2>

                </div>

                <span className="project-status">
                  {project.status}
                </span>

              </div>


              <p className="project-description">
                {project.description}
              </p>


              <div className="project-footer">

                <span className="project-tech-label">
                  TECHNOLOGIES
                </span>

                <div className="technology-list">

                  {project.technologies.map(
                    technology => (

                      <span
                        key={technology}
                      >
                        {technology}
                      </span>

                    )
                  )}

                </div>

              </div>


              {project.id.startsWith('user-') && (

                <button
                  type="button"
                  className="project-delete-button"
                  onClick={() =>
                    handleDeleteProject(
                      project.id
                    )
                  }
                >
                  🗑️ Delete Project
                </button>

              )}

            </article>

          ))}

        </div>

      </section>


      <section className="analytics-section">

        <div className="projects-section-header">

          <div>

            <h2>
              ➕ Add Your Project
            </h2>

            <p>
              Add projects you build in the future.
              They will be saved automatically.
            </p>

          </div>

        </div>


        <form
          className="project-form"
          onSubmit={
            handleAddProject
          }
        >

          <div className="project-form-grid">

            <div className="project-form-field">

              <label>
                Project Name
              </label>

              <input
                type="text"
                value={name}
                onChange={
                  event =>
                    setName(
                      event.target.value
                    )
                }
                placeholder="e.g. CodeGuardian AI"
              />

            </div>


            <div className="project-form-field">

              <label>
                Project Type
              </label>

              <input
                type="text"
                value={type}
                onChange={
                  event =>
                    setType(
                      event.target.value
                    )
                }
                placeholder="e.g. AI / Web App"
              />

            </div>


            <div className="project-form-field">

              <label>
                Status
              </label>

              <select
                value={status}
                onChange={
                  event =>
                    setStatus(
                      event.target.value
                    )
                }
              >

                <option value="Planned">
                  Planned
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="On Hold">
                  On Hold
                </option>

              </select>

            </div>


            <div className="project-form-field">

              <label>
                Technologies
              </label>

              <input
                type="text"
                value={technologies}
                onChange={
                  event =>
                    setTechnologies(
                      event.target.value
                    )
                }
                placeholder="React, TypeScript, Firebase"
              />

              <small>
                Separate technologies with commas.
              </small>

            </div>

          </div>


          <div className="project-form-field">

            <label>
              Description
            </label>

            <textarea
              value={description}
              onChange={
                event =>
                  setDescription(
                    event.target.value
                  )
              }
              placeholder="What does this project do?"
              rows={4}
            />

          </div>


          <button
            type="submit"
            className="project-add-button"
          >
            ➕ Add Project
          </button>

        </form>

      </section>

    </div>
  )
}


export default Projects