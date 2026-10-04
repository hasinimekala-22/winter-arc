import {
  useEffect,
  useState
} from 'react'

import {
  syllabus
} from '../data/syllabus'

import {
  getWinterArcState,
  saveWinterArcState
} from '../services/winterArcState'

import {
  listenForWinterArcRefresh,
  listenForCrossTabRefresh
} from '../services/refreshEngine'


function Academics() {

  const [, setRefresh] =
    useState(0)


  function refreshPage() {
    setRefresh(
      value => value + 1
    )
  }


  useEffect(() => {

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


  const state =
    getWinterArcState()


  /*
   * CALCULATE SUBJECT PROGRESS
   */

  const subjects =
    syllabus.map(subject => {

      let completed = 0

      subject.units.forEach(
        (_, index) => {

          const key =
            `${subject.id}-${index}`

          if (
            state.academicProgress[key] ===
            'Completed'
          ) {
            completed++
          }

        }
      )


      const total =
        subject.units.length


      const percentage =
        total > 0
          ? Math.round(
              (
                completed /
                total
              ) * 100
            )
          : 0


      return {
        ...subject,
        completed,
        total,
        percentage
      }

    })


  /*
   * OVERALL PROGRESS
   */

  const totalUnits =
    subjects.reduce(
      (
        total,
        subject
      ) =>
        total +
        subject.total,
      0
    )


  const completedUnits =
    subjects.reduce(
      (
        total,
        subject
      ) =>
        total +
        subject.completed,
      0
    )


  const overallPercentage =
    totalUnits > 0
      ? Math.round(
          (
            completedUnits /
            totalUnits
          ) * 100
        )
      : 0


  /*
   * UPDATE UNIT
   */

  function handleUnitChange(
    subjectId: string,
    unitIndex: number,
    value: string
  ) {

    const currentState =
      getWinterArcState()


    const key =
      `${subjectId}-${unitIndex}`


    const updatedProgress = {

      ...currentState.academicProgress,

      [key]:
        value

    }


    saveWinterArcState({

      ...currentState,

      academicProgress:
        updatedProgress

    })

  }


  /*
   * PAGE
   */

  return (

    <div>

      <h1>
        🎓 Academics
      </h1>

      <p className="page-subtitle">
        Track every syllabus unit and see your actual academic progress.
      </p>


      {/* OVERALL */}

      <section className="academic-overview">

        <div>

          <span>
            OVERALL PROGRESS
          </span>

          <strong>
            {overallPercentage}%
          </strong>

          <p>
            {completedUnits} of {totalUnits} units completed
          </p>

        </div>


        <div className="academic-overview-progress">

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width:
                  `${overallPercentage}%`
              }}
            />

          </div>

        </div>

      </section>


      {/* SUBJECTS */}

      <section className="analytics-section">

        <h2>
          📚 Subjects
        </h2>


        <div className="academic-subject-list">

          {
            subjects.map(
              subject => (

                <article
                  className="academic-subject-card"
                  key={subject.id}
                >

                  <div className="academic-subject-header">

                    <div>

                      <h2>
                        {subject.name}
                      </h2>

                      <p>
                        {subject.completed}
                        /
                        {subject.total}
                        {' '}
                        units completed
                      </p>

                    </div>


                    <strong>
                      {subject.percentage}%
                    </strong>

                  </div>


                  <div className="progress-bar">

                    <div
                      className="progress-fill"
                      style={{
                        width:
                          `${subject.percentage}%`
                      }}
                    />

                  </div>


                  <div className="academic-unit-list">

                    {
                      subject.units.map(
                        (
                          unit,
                          index
                        ) => {

                          const key =
                            `${subject.id}-${index}`


                          const status =
                            state.academicProgress[key]
                            ||
                            'Not Started'


                          return (

                            <div
                              className="academic-unit-row"
                              key={key}
                            >

                              <div>

                                <span>
                                  UNIT {index + 1}
                                </span>

                                <strong>
                                  {unit}
                                </strong>

                              </div>


                              <select
                                value={status}
                                onChange={
                                  event =>
                                    handleUnitChange(
                                      subject.id,
                                      index,
                                      event.target.value
                                    )
                                }
                              >

                                <option value="Not Started">
                                  Not Started
                                </option>

                                <option value="In Progress">
                                  In Progress
                                </option>

                                <option value="Completed">
                                  Completed
                                </option>

                              </select>

                            </div>

                          )

                        }
                      )
                    }

                  </div>

                </article>

              )
            )
          }

        </div>

      </section>


      {/* SUMMARY */}

      <section className="analytics-section">

        <h2>
          📊 Academic Summary
        </h2>

        <div className="analytics-grid">

          <div className="analytics-card">

            <strong>
              {totalUnits}
            </strong>

            <p>
              Total units
            </p>

          </div>


          <div className="analytics-card">

            <strong>
              {completedUnits}
            </strong>

            <p>
              Completed
            </p>

          </div>


          <div className="analytics-card">

            <strong>
              {
                totalUnits -
                completedUnits
              }
            </strong>

            <p>
              Remaining
            </p>

          </div>


          <div className="analytics-card">

            <strong>
              {overallPercentage}%
            </strong>

            <p>
              Overall progress
            </p>

          </div>

        </div>

      </section>

    </div>

  )

}


export default Academics