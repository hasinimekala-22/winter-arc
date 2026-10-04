import { useEffect, useState } from 'react'

import { skills } from '../data/skills'

import {
  getWinterArcState,
  saveWinterArcState
} from '../services/winterArcState'

import {
  listenForWinterArcRefresh,
  listenForCrossTabRefresh
} from '../services/refreshEngine'

function Skills() {

  const [, setRefresh] = useState(0)

  const [progress, setProgress] =
    useState<Record<string, number>>(() => {

      const state =
        getWinterArcState()

      return state.skillProgress
    })

  useEffect(() => {

    const refreshPage = () => {
      const state =
        getWinterArcState()

      setProgress(
        state.skillProgress
      )

      setRefresh(
        value => value + 1
      )
    }

    const removeLocal =
      listenForWinterArcRefresh(
        refreshPage
      )

    const removeCrossTab =
      listenForCrossTabRefresh(
        refreshPage
      )

    return () => {
      removeLocal()
      removeCrossTab()
    }

  }, [])

  const updateProgress = (
    skillId: string,
    value: number
  ) => {

    const safeValue =
      Math.min(
        100,
        Math.max(
          0,
          Math.round(value)
        )
      )

    const updated = {
      ...progress,
      [skillId]: safeValue
    }

    setProgress(updated)

    const state =
      getWinterArcState()

    saveWinterArcState({
      ...state,
      skillProgress: updated
    })
  }

  const totalSkills =
    skills.length

  const completedSkills =
    skills.filter(
      skill =>
        (progress[skill.id] || 0) >= 80
    ).length

  const averageProgress =
    totalSkills > 0
      ? Math.round(
          skills.reduce(
            (total, skill) =>
              total +
              (progress[skill.id] || 0),
            0
          ) / totalSkills
        )
      : 0

  return (
    <div>

      <h1>💻 CSE Skills</h1>

      <p className="page-subtitle">
        Build your technical skill stack and
        track your progress from learning to
        practical confidence.
      </p>

      <section className="skills-overview">

        <div className="skills-overview-main">

          <span>
            TECHNICAL DEVELOPMENT
          </span>

          <strong>
            {averageProgress}%
          </strong>

          <p>
            Average progress across your
            tracked CSE skills.
          </p>

        </div>

        <div className="skills-overview-stats">

          <div>
            <strong>
              {totalSkills}
            </strong>

            <span>
              Skills tracked
            </span>
          </div>

          <div>
            <strong>
              {completedSkills}
            </strong>

            <span>
              Strong skills
            </span>
          </div>

        </div>

      </section>

      <section className="analytics-section">

        <div className="skills-section-header">

          <div>
            <h2>
              🧠 Skill Development
            </h2>

            <p>
              Update each skill as you learn,
              practise and build projects.
            </p>
          </div>

          <span>
            {completedSkills}/{totalSkills} ≥ 80%
          </span>

        </div>

        <div className="skills-grid">

          {skills.map(skill => {

            const currentProgress =
              progress[skill.id] || 0

            let level = 'Beginner'

            if (currentProgress >= 80) {
              level = 'Strong'
            } else if (
              currentProgress >= 50
            ) {
              level = 'Developing'
            }

            return (

              <article
                className="skill-card"
                key={skill.id}
              >

                <div className="skill-card-header">

                  <div>

                    <span className="skill-category">
                      {skill.category}
                    </span>

                    <h2>
                      {skill.name}
                    </h2>

                  </div>

                  <strong className="skill-percentage">
                    {currentProgress}%
                  </strong>

                </div>

                <div className="skill-level">
                  {level}
                </div>

                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width:
                        `${currentProgress}%`
                    }}
                  />

                </div>

                <div className="skill-slider-row">

                  <span>
                    0
                  </span>

                  <input
                    className="skill-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={currentProgress}
                    aria-label={
                      `${skill.name} progress`
                    }
                    onChange={
                      event =>
                        updateProgress(
                          skill.id,
                          Number(
                            event.target.value
                          )
                        )
                    }
                  />

                  <span>
                    100
                  </span>

                </div>

                <small>
                  Drag the slider to update your
                  current skill level.
                </small>

              </article>
            )
          })}

        </div>

      </section>

    </div>
  )
}

export default Skills