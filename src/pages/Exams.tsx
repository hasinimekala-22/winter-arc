import {
  useEffect,
  useState
} from 'react'

import {
  exams
} from '../data/exams'

import {
  syllabus
} from '../data/syllabus'

import {
  getWinterArcState,
  saveWinterArcState
} from '../services/winterArcState'

import {
  getExamPlans
} from '../services/planningEngine'

import {
  listenForWinterArcRefresh,
  listenForCrossTabRefresh
} from '../services/refreshEngine'


function getDaysLeft(
  date: string
) {

  const today =
    new Date()

  today.setHours(
    0,
    0,
    0,
    0
  )


  const target =
    new Date(
      `${date}T00:00:00`
    )


  return Math.ceil(
    (
      target.getTime() -
      today.getTime()
    ) /
    (1000 * 60 * 60 * 24)
  )

}


function Exams() {

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


  const examPlans =
    getExamPlans()


  /*
   * SAVE SUBJECT EXAM DATE
   */

  function handleExamDateChange(
    subjectId: string,
    date: string
  ) {

    const currentState =
      getWinterArcState()


    saveWinterArcState({

      ...currentState,

      examDates: {

        ...currentState.examDates,

        [subjectId]:
          date

      }

    })

  }


  /*
   * EXAM PHASES
   */

  const phaseData =
    exams.map(
      phase => ({

        ...phase,

        daysLeft:
          getDaysLeft(
            phase.startDate
          )

      })
    )


  return (

    <div>

      <h1>
        📝 Exams
      </h1>

      <p className="page-subtitle">
        Track exam phases, subject dates and preparation progress.
      </p>


      {/* EXAM PHASES */}

      <section className="analytics-section">

        <h2>
          📅 Exam Schedule
        </h2>


        <div className="exam-phase-grid">

          {
            phaseData.map(
              phase => (

                <div
                  className="exam-phase-card"
                  key={phase.name}
                >

                  <span>
                    EXAM
                  </span>

                  <h2>
                    {phase.name}
                  </h2>

                  <p>
                    {phase.startDate}
                    {' → '}
                    {phase.endDate}
                  </p>


                  <strong>

                    {
                      phase.daysLeft > 0
                        ? `${phase.daysLeft} days`
                        : phase.daysLeft === 0
                          ? 'Today'
                          : 'Started / Passed'
                    }

                  </strong>

                </div>

              )
            )
          }

        </div>

      </section>


      {/* SUBJECT EXAM DATES */}

      <section className="analytics-section">

        <h2>
          🎯 Subject Exam Dates
        </h2>

        <p className="section-description">
          Add the actual exam date for each subject when your timetable is available.
        </p>


        <div className="exam-subject-list">

          {
            syllabus.map(
              subject => {

                const date =
                  state.examDates[
                    subject.id
                  ] || ''


                const plan =
                  examPlans.find(
                    exam =>
                      exam.id ===
                      subject.id
                  )


                return (

                  <div
                    className="exam-subject-row"
                    key={subject.id}
                  >

                    <div>

                      <strong>
                        {subject.name}
                      </strong>

                      <p>
                        {
                          plan
                            ? `${plan.progress}% academic progress`
                            : 'No exam date added'
                        }
                      </p>

                    </div>


                    <div className="exam-subject-controls">

                      <input
                        type="date"
                        value={date}
                        onChange={
                          event =>
                            handleExamDateChange(
                              subject.id,
                              event.target.value
                            )
                        }
                      />


                      {
                        plan && (

                          <span
                            className={`exam-risk ${plan.risk}`}
                          >

                            {
                              plan.daysLeft < 0
                                ? 'PASSED'
                                : plan.daysLeft === 0
                                  ? 'TODAY'
                                  : `${plan.daysLeft} DAYS`
                            }

                          </span>

                        )
                      }

                    </div>

                  </div>

                )

              }
            )
          }

        </div>

      </section>


      {/* ACTIVE EXAM PLANS */}

      <section className="analytics-section">

        <h2>
          🧠 Preparation Status
        </h2>


        {
          examPlans.length === 0 ? (

            <div className="empty-state">

              <strong>
                No subject exam dates added yet
              </strong>

              <p>
                Add dates above when your college releases the timetable.
              </p>

            </div>

          ) : (

            <div className="planning-list">

              {
                examPlans.map(
                  exam => (

                    <div
                      className={`planning-item ${exam.risk}`}
                      key={exam.id}
                    >

                      <div>

                        <strong>
                          {exam.name}
                        </strong>

                        <p>
                          Exam: {exam.date}
                        </p>

                        <p>
                          Progress:
                          {' '}
                          {exam.progress}%
                        </p>

                        <small>
                          {exam.message}
                        </small>

                      </div>


                      <span>

                        {
                          exam.daysLeft < 0
                            ? 'PASSED'
                            : exam.risk.toUpperCase()
                        }

                      </span>

                    </div>

                  )
                )
              }

            </div>

          )
        }

      </section>


      {/* PREPARATION RULES */}

      <section className="analytics-section">

        <h2>
          ⚙️ ARC Exam Rules
        </h2>

        <div className="review-list">

          <div className="review-item">

            <span>
              1
            </span>

            <p>
              Exams within 3 days with below 70% recorded progress are treated as high-risk.
            </p>

          </div>


          <div className="review-item">

            <span>
              2
            </span>

            <p>
              Exams within 7 days with below 80% recorded progress are treated as medium-risk.
            </p>

          </div>


          <div className="review-item">

            <span>
              3
            </span>

            <p>
              ARC uses these dates when generating today's study priorities.
            </p>

          </div>

        </div>

      </section>

    </div>

  )

}


export default Exams