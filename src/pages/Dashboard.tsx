import {
  useEffect,
  useState
} from 'react'

import ArcStatus from '../components/ArcStatus'

import {
  getDailyPlan,
  getExamPlans,
  getWorkloadSummary
} from '../services/planningEngine'

import {
  getTodayTaskStats
} from '../services/taskEngine'

import {
  getWinterArcState
} from '../services/winterArcState'

import {
  getDailyHistory
} from '../services/historyEngine'

import {
  listenForWinterArcRefresh,
  listenForCrossTabRefresh
} from '../services/refreshEngine'

import {
  syllabus
} from '../data/syllabus'


function Dashboard() {

  const [, setRefresh] =
    useState(0)


  function refreshPage() {
    setRefresh(value => value + 1)
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


  /*
   * CURRENT DATA
   */

  const state =
    getWinterArcState()

  const history =
    getDailyHistory()

  const dailyPlan =
    getDailyPlan()

  const examPlans =
    getExamPlans()

  const workload =
    getWorkloadSummary()

  const taskStats =
    getTodayTaskStats()


  /*
   * NEXT EXAM
   */

  const nextExam =
    examPlans
      .filter(
        exam =>
          exam.daysLeft >= 0
      )
      .sort(
        (a, b) =>
          a.daysLeft - b.daysLeft
      )[0]


  /*
   * TODAY'S HABITS
   */

  const mealsToday =
    [
      state.habits.breakfast,
      state.habits.lunch,
      state.habits.dinner
    ].filter(Boolean).length


  /*
   * FULL ACADEMIC PROGRESS
   */

  let completedUnits = 0
  let totalUnits = 0

  syllabus.forEach(subject => {

    totalUnits +=
      subject.units.length

    subject.units.forEach(
      (_, index) => {

        const key =
          `${subject.id}-${index}`

        if (
          state.academicProgress[key] ===
          'Completed'
        ) {
          completedUnits++
        }

      }
    )

  })


  const academicPercentage =
    totalUnits > 0
      ? Math.round(
          (
            completedUnits /
            totalUnits
          ) * 100
        )
      : 0


  return (

    <div>

      <h1>
        🏠 Dashboard
      </h1>

      <p className="page-subtitle">
        Your Winter ARC command center.
      </p>


      {/* ARC STATUS */}

      <ArcStatus />
<section className="dashboard-hero">
  <span>WINTER ARC</span>

  <h2>
    Build quietly. Execute consistently.
  </h2>

  <p>
    Your dashboard combines academics, exams, skills,
    projects, habits and daily execution into one system.
  </p>
</section>

      {/* TODAY OVERVIEW */}

      <section className="analytics-section">

        <h2>
          📅 Today's Overview
        </h2>

        <div className="analytics-grid">

          <div className="analytics-card">
            <strong>
              {state.streak}
            </strong>
            <p>
              Current streak
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {taskStats.completed}/{taskStats.total}
            </strong>
            <p>
              Tasks completed today
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {state.habits.water}
            </strong>
            <p>
              Glasses of water
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {state.habits.sleep || '—'}
            </strong>
            <p>
              Sleep hours
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {mealsToday}/3
            </strong>
            <p>
              Meals logged
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {history.length}
            </strong>
            <p>
              Days recorded
            </p>
          </div>

        </div>

      </section>


      {/* DAILY TOP 3 */}

      <section className="analytics-section">

        <h2>
          🔥 Today's Top 3
        </h2>

        <div className="planning-list">

          {dailyPlan.map(
            (item, index) => (

              <div
                className={`planning-item ${item.priority}`}
                key={`${item.title}-${index}`}
              >

                <div>

                  <strong>
                    {index + 1}. {item.title}
                  </strong>

                  <p>
                    {item.reason}
                  </p>

                  <small>
                    {item.category.toUpperCase()}
                  </small>

                </div>

                <span>
                  {item.priority.toUpperCase()}
                </span>

              </div>

            )
          )}

        </div>

      </section>


      {/* NEXT EXAM */}

      <section className="analytics-section">

        <h2>
          📝 Next Exam
        </h2>

        {nextExam ? (

          <div
            className={`planning-item ${nextExam.risk}`}
          >

            <div>

              <strong>
                {nextExam.name}
              </strong>

              <p>
                Exam date: {nextExam.date}
              </p>

              <p>
                Recorded progress:
                {' '}
                {nextExam.progress}%
              </p>

              <small>
                {nextExam.message}
              </small>

            </div>

            <span>

              {nextExam.daysLeft === 0
                ? 'TODAY'
                : `${nextExam.daysLeft} DAY${
                    nextExam.daysLeft === 1
                      ? ''
                      : 'S'
                  }`
              }

            </span>

          </div>

        ) : (

          <div className="empty-state">

            <strong>
              No upcoming exam recorded
            </strong>

            <p>
              Add your subject exam dates
              from the Exams page.
            </p>

          </div>

        )}

      </section>


      {/* TASK STATUS */}

      <section className="analytics-section">

        <h2>
          📋 Task Status
        </h2>

        <div className="analytics-grid">

          <div className="analytics-card">
            <strong>
              {taskStats.total}
            </strong>
            <p>
              Today's tasks
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {taskStats.completed}
            </strong>
            <p>
              Completed
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {taskStats.pending}
            </strong>
            <p>
              Pending
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {taskStats.completionRate}%
            </strong>
            <p>
              Today's completion rate
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {taskStats.highPriority}
            </strong>
            <p>
              High-priority pending
            </p>
          </div>

        </div>

      </section>


      {/* WORKLOAD */}

      <section className="analytics-section">

        <h2>
          📦 Current Workload
        </h2>

        <div className="analytics-grid">

          <div className="analytics-card">
            <strong>
              {workload.totalPending}
            </strong>
            <p>
              Total pending
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {workload.high}
            </strong>
            <p>
              High priority
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {workload.medium}
            </strong>
            <p>
              Medium priority
            </p>
          </div>

          <div className="analytics-card">
            <strong>
              {workload.low}
            </strong>
            <p>
              Low priority
            </p>
          </div>

        </div>

      </section>


      {/* ACADEMIC SNAPSHOT */}

      <section className="analytics-section">

        <h2>
          🎓 Academic Snapshot
        </h2>

        <div className="analytics-grid">

          <div className="analytics-card">

            <strong>
              {completedUnits}
            </strong>

            <p>
              Completed units
            </p>

          </div>


          <div className="analytics-card">

            <strong>
              {totalUnits}
            </strong>

            <p>
              Total syllabus units
            </p>

          </div>


          <div className="analytics-card">

            <strong>
              {academicPercentage}%
            </strong>

            <p>
              Overall academic progress
            </p>

          </div>

        </div>

      </section>


      {/* QUICK STATUS */}

      <section className="analytics-section">

        <h2>
          ⚡ Quick Status
        </h2>

        <div className="wellbeing-row">

          <span>
            Winter ARC
          </span>

          <strong>
            Active
          </strong>

        </div>

        <div className="wellbeing-row">

          <span>
            Daily tracking
          </span>

          <strong>
            {state.lastStart
              ? `Started ${state.lastStart}`
              : 'Not started today'
            }
          </strong>

        </div>

        <div className="wellbeing-row">

          <span>
            Task workload
          </span>

          <strong>
            {workload.high > 0
              ? `${workload.high} high-priority task${
                  workload.high === 1
                    ? ''
                    : 's'
                }`
              : 'No high-priority pending task'
            }
          </strong>

        </div>

        <div className="wellbeing-row">

          <span>
            Next exam
          </span>

          <strong>
            {nextExam
              ? nextExam.name
              : 'No exam date'
            }
          </strong>

        </div>

        <div className="wellbeing-row">

          <span>
            Recorded history
          </span>

          <strong>
            {history.length} day{
              history.length === 1
                ? ''
                : 's'
            }
          </strong>

        </div>

      </section>

    </div>

  )
}


export default Dashboard