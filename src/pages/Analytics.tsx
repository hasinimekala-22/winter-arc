import {
  useEffect,
  useState
} from 'react'

import {
  getDataHealth
} from '../services/dataHealthEngine'

import {
  listenForWinterArcRefresh,
  listenForCrossTabRefresh
} from '../services/refreshEngine'

import {
  getDailyHistory
} from '../services/historyEngine'

import {
  getWinterArcState
} from '../services/winterArcState'

import {
  syllabus
} from '../data/syllabus'

import {
  skills
} from '../data/skills'

import {
  getTaskAnalytics
} from '../services/taskEngine'

import {
  getLearningSummary
} from '../services/learningEngine'


function Analytics() {

  const [, setRefresh] =
    useState(0)


  /*
    Live refresh
  */

  useEffect(() => {

    const refresh = () => {
      setRefresh(value => value + 1)
    }


    const removeLocalListener =
      listenForWinterArcRefresh(
        refresh
      )


    const removeCrossTabListener =
      listenForCrossTabRefresh(
        refresh
      )


    return () => {
      removeLocalListener()
      removeCrossTabListener()
    }

  }, [])


  const taskAnalytics =
    getTaskAnalytics()


  const learning =
    getLearningSummary()


  const dataHealth =
    getDataHealth()


  const state =
    getWinterArcState()


  const history =
    getDailyHistory()


  /*
    Academic progress
  */

  let totalUnits = 0

  let completedUnits = 0


  const subjectProgress =
    syllabus.map(subject => {

      const completed =
        subject.units.filter(
          (_, index) =>
            state.academicProgress[
              `${subject.id}-${index}`
            ] === 'Completed'
        ).length


      totalUnits +=
        subject.units.length


      completedUnits +=
        completed


      return {
        name: subject.name,
        completed,
        total: subject.units.length,
        percentage:
          subject.units.length > 0
            ? Math.round(
                (completed /
                  subject.units.length) *
                100
              )
            : 0
      }

    })


  const academicPercentage =
    totalUnits > 0
      ? Math.round(
          (completedUnits /
            totalUnits) *
          100
        )
      : 0


  /*
    Skill progress
  */

  const skillProgress =
    skills.map(skill => ({

      name: skill.name,

      category: skill.category,

      percentage:
        state.skillProgress[
          skill.id
        ] || 0

    }))


  const averageSkillProgress =
    skillProgress.length > 0
      ? Math.round(
          skillProgress.reduce(
            (total, skill) =>
              total +
              skill.percentage,
            0
          ) /
          skillProgress.length
        )
      : 0


  /*
    Last 7 days
  */

  const last7Days = []

  const today = new Date()


  for (
    let i = 6;
    i >= 0;
    i--
  ) {

    const date =
      new Date(today)


    date.setDate(
      today.getDate() - i
    )


    const year =
      date.getFullYear()


    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0')


    const day =
      String(
        date.getDate()
      ).padStart(2, '0')


    const dateString =
      `${year}-${month}-${day}`


    const record =
      history.find(
        item =>
          item.date ===
          dateString
      )


    const meals =
      record
        ? [
            record.breakfast,
            record.lunch,
            record.dinner
          ].filter(Boolean).length
        : 0


    last7Days.push({

      date: dateString,

      water:
        record?.water || 0,

      sleep:
        Number(record?.sleep) || 0,

      meals,

      started:
        record?.started || false

    })

  }


  const startedDays =
    last7Days.filter(
      day => day.started
    ).length


  const consistency =
    Math.round(
      (startedDays / 7) * 100
    )


  const averageWater =
    Math.round(
      (
        last7Days.reduce(
          (total, day) =>
            total + day.water,
          0
        ) / 7
      ) * 10
    ) / 10


  const recordedSleepDays =
    last7Days.filter(
      day => day.sleep > 0
    )


  const averageSleep =
    recordedSleepDays.length > 0
      ? Math.round(
          (
            recordedSleepDays.reduce(
              (total, day) =>
                total + day.sleep,
              0
            ) /
            recordedSleepDays.length
          ) * 10
        ) / 10
      : 0


  const todayData =
    last7Days[
      last7Days.length - 1
    ]


  const weakestSubject =
    [...subjectProgress].sort(
      (a, b) =>
        a.percentage -
        b.percentage
    )[0]


  const strongestSubject =
    [...subjectProgress].sort(
      (a, b) =>
        b.percentage -
        a.percentage
    )[0]


  const maxWater =
    Math.max(
      8,
      ...last7Days.map(
        day => day.water
      )
    )


  const maxSleep =
    Math.max(
      8,
      ...last7Days.map(
        day => day.sleep
      )
    )


  return (
    <>

      <h1>
        📊 Analytics
      </h1>


      <p className="page-subtitle">
        Your Winter Arc performance,
        consistency and progress.
      </p>


      {/* OVERVIEW */}

      <section className="analytics-grid">

        <div className="analytics-card">

          <h3>
            🎓 Academic Progress
          </h3>

          <strong>
            {academicPercentage}%
          </strong>

          <p>
            {completedUnits} of{' '}
            {totalUnits}{' '}
            units completed
          </p>

        </div>


        <div className="analytics-card">

          <h3>
            💻 Skill Progress
          </h3>

          <strong>
            {averageSkillProgress}%
          </strong>

          <p>
            Average skill progress
          </p>

        </div>


        <div className="analytics-card">

          <h3>
            🔥 Weekly Consistency
          </h3>

          <strong>
            {consistency}%
          </strong>

          <p>
            {startedDays}/7 days started
          </p>

        </div>


        <div className="analytics-card">

          <h3>
            💧 Average Water
          </h3>

          <strong>
            {averageWater}
          </strong>

          <p>
            glasses per day
          </p>

        </div>


        <div className="analytics-card">

          <h3>
            😴 Average Sleep
          </h3>

          <strong>
            {averageSleep || '—'}
          </strong>

          <p>
            hours on recorded days
          </p>

        </div>


        <div className="analytics-card">

          <h3>
            🔥 Start Streak
          </h3>

          <strong>
            {state.streak}
          </strong>

          <p>
            consecutive days
          </p>

        </div>

      </section>


      {/* SUBJECT PROGRESS */}

      <section className="analytics-section">

        <h2>
          🎓 Subject Progress
        </h2>


        <div className="subject-grid">

          {subjectProgress.map(
            subject => (

              <div
                className="subject-card"
                key={subject.name}
              >

                <h3>
                  {subject.name}
                </h3>

                <strong>
                  {subject.percentage}%
                </strong>

                <p>
                  {subject.completed} /{' '}
                  {subject.total}{' '}
                  units
                </p>


                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width:
                        `${subject.percentage}%`
                    }}
                  />

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* ACADEMIC FOCUS */}

      <section className="analytics-section">

        <h2>
          🎯 Academic Focus
        </h2>


        <div className="wellbeing-row">

          <span>
            ⚠️ Needs attention
          </span>

          <strong>
            {weakestSubject?.name ||
              'No data'}{' '}

            (
            {weakestSubject?.percentage ||
              0}
            %)
          </strong>

        </div>


        <div className="wellbeing-row">

          <span>
            💪 Highest progress
          </span>

          <strong>
            {strongestSubject?.name ||
              'No data'}{' '}

            (
            {strongestSubject?.percentage ||
              0}
            %)
          </strong>

        </div>

      </section>


      {/* SKILL DEVELOPMENT */}

      <section className="analytics-section">

        <h2>
          💻 Skill Development
        </h2>


        <div className="subject-grid">

          {skillProgress.map(
            skill => (

              <div
                className="subject-card"
                key={skill.name}
              >

                <h3>
                  {skill.name}
                </h3>

                <p>
                  {skill.category}
                </p>

                <strong>
                  {skill.percentage}%
                </strong>


                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width:
                        `${skill.percentage}%`
                    }}
                  />

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* LEARNING PERFORMANCE */}

      <section className="analytics-section">

        <h2>
          🧠 Learning Performance
        </h2>


        <div className="analytics-grid">

          {/* APTITUDE */}

          <div className="analytics-card">

            <h3>
              🧠 Aptitude
            </h3>

            <strong>
              {learning.aptitude.accuracy}%
            </strong>

            <p>
              Accuracy
            </p>

            <div className="learning-mini-stats">

              <span>
                {learning.aptitude.sessions}
                {' '}sessions
              </span>

              <span>
                {learning.aptitude.questions}
                {' '}questions
              </span>

              <span>
                {learning.aptitude.time}
                {' '}min
              </span>

            </div>

          </div>


          {/* AUTOCAD */}

          <div className="analytics-card">

            <h3>
              📐 AutoCAD
            </h3>

            <strong>
              {learning.autocad.averageConfidence}
              /5
            </strong>

            <p>
              Average Confidence
            </p>

            <div className="learning-mini-stats">

              <span>
                {learning.autocad.sessions}
                {' '}sessions
              </span>

              <span>
                {learning.autocad.time}
                {' '}min
              </span>

              <span>
                {learning.autocad.practiceSessions}
                {' '}drawings
              </span>

            </div>

          </div>

        </div>


        {/* APTITUDE DETAILS */}

        <div className="learning-detail-card">

          <h3>
            🧠 Aptitude Details
          </h3>

          <div className="wellbeing-row">

            <span>
              Practice Sessions
            </span>

            <strong>
              {learning.aptitude.sessions}
            </strong>

          </div>


          <div className="wellbeing-row">

            <span>
              Questions Attempted
            </span>

            <strong>
              {learning.aptitude.questions}
            </strong>

          </div>


          <div className="wellbeing-row">

            <span>
              Correct Answers
            </span>

            <strong>
              {learning.aptitude.correct}
            </strong>

          </div>


          <div className="wellbeing-row">

            <span>
              Practice Time
            </span>

            <strong>
              {learning.aptitude.time}
              {' '}minutes
            </strong>

          </div>

        </div>


        {/* AUTOCAD DETAILS */}

        <div className="learning-detail-card">

          <h3>
            📐 AutoCAD Development
          </h3>

          <div className="wellbeing-row">

            <span>
              Practice Sessions
            </span>

            <strong>
              {learning.autocad.sessions}
            </strong>

          </div>


          <div className="wellbeing-row">

            <span>
              Practice Time
            </span>

            <strong>
              {learning.autocad.time}
              {' '}minutes
            </strong>

          </div>


          <div className="wellbeing-row">

            <span>
              Average Confidence
            </span>

            <strong>
              {learning.autocad.averageConfidence}
              /5
            </strong>

          </div>


          <div className="wellbeing-row">

            <span>
              Practice / Drawings
            </span>

            <strong>
              {learning.autocad.practiceSessions}
            </strong>

          </div>

        </div>


        {/* TOPICS */}

        <div className="learning-topics">

          <div>

            <h3>
              🧠 Aptitude Topics
            </h3>

            {learning.aptitude.topics.length > 0 ? (

              <div className="topic-list">

                {learning.aptitude.topics.map(
                  topic => (

                    <span
                      className="topic-chip"
                      key={topic}
                    >
                      {topic}
                    </span>

                  )
                )}

              </div>

            ) : (

              <p>
                No aptitude topics
                recorded yet.
              </p>

            )}

          </div>


          <div>

            <h3>
              📐 AutoCAD Topics
            </h3>

            {learning.autocad.topics.length > 0 ? (

              <div className="topic-list">

                {learning.autocad.topics.map(
                  topic => (

                    <span
                      className="topic-chip"
                      key={topic}
                    >
                      {topic}
                    </span>

                  )
                )}

              </div>

            ) : (

              <p>
                No AutoCAD topics
                recorded yet.
              </p>

            )}

          </div>

        </div>

      </section>


      {/* WATER TREND */}

      <section className="trend-card">

        <h2>
          💧 Water — Last 7 Days
        </h2>


        <div className="trend-chart">

          {last7Days.map(day => {

            const height =
              Math.round(
                (day.water /
                  maxWater) *
                100
              )


            return (

              <div
                className="trend-column"
                key={day.date}
              >

                <strong>
                  {day.water}
                </strong>


                <div className="trend-bar-area">

                  <div
                    className="trend-bar"
                    style={{
                      height:
                        `${height}%`
                    }}
                  />

                </div>


                <small>
                  {day.date.slice(5)}
                </small>

              </div>

            )

          })}

        </div>

      </section>


      {/* SLEEP TREND */}

      <section className="trend-card">

        <h2>
          😴 Sleep — Last 7 Days
        </h2>


        <div className="trend-chart">

          {last7Days.map(day => {

            const height =
              Math.round(
                (day.sleep /
                  maxSleep) *
                100
              )


            return (

              <div
                className="trend-column"
                key={day.date}
              >

                <strong>
                  {day.sleep || '—'}
                </strong>


                <div className="trend-bar-area">

                  <div
                    className="trend-bar"
                    style={{
                      height:
                        `${height}%`
                    }}
                  />

                </div>


                <small>
                  {day.date.slice(5)}
                </small>

              </div>

            )

          })}

        </div>

      </section>


      {/* START CONSISTENCY */}

      <section className="analytics-section">

        <h2>
          🔥 Start Consistency
        </h2>

        <p>
          {startedDays} out of 7 days
          started.
        </p>


        <div className="consistency-grid">

          {last7Days.map(day => (

            <div
              className={
                day.started
                  ? 'consistency-day started'
                  : 'consistency-day'
              }
              key={day.date}
            >

              <strong>
                {day.started
                  ? '✓'
                  : '—'}
              </strong>

              <small>
                {day.date.slice(5)}
              </small>

            </div>

          ))}

        </div>

      </section>


      {/* TODAY */}

      <section className="analytics-section">

        <h2>
          🌱 Today's Details
        </h2>


        <div className="wellbeing-row">

          <span>
            💧 Water
          </span>

          <strong>
            {todayData.water} glasses
          </strong>

        </div>


        <div className="wellbeing-row">

          <span>
            😴 Sleep
          </span>

          <strong>
            {todayData.sleep
              ? `${todayData.sleep} hours`
              : 'Not recorded'}
          </strong>

        </div>


        <div className="wellbeing-row">

          <span>
            🍽️ Meals
          </span>

          <strong>
            {todayData.meals}/3
          </strong>

        </div>


        <div className="wellbeing-row">

          <span>
            🔥 Started
          </span>

          <strong>
            {todayData.started
              ? '✓ Yes'
              : 'Not started'}
          </strong>

        </div>

      </section>


      {/* WEEKLY SNAPSHOT */}

      <section className="analytics-section">

        <h2>
          🧠 Weekly Snapshot
        </h2>


        <div className="wellbeing-row">

          <span>
            📅 Days started
          </span>

          <strong>
            {startedDays}/7
          </strong>

        </div>


        <div className="wellbeing-row">

          <span>
            💧 Average water
          </span>

          <strong>
            {averageWater}{' '}
            glasses/day
          </strong>

        </div>


        <div className="wellbeing-row">

          <span>
            😴 Average sleep
          </span>

          <strong>
            {averageSleep
              ? `${averageSleep} hours`
              : 'No data'}
          </strong>

        </div>

      </section>


      {/* TASK PERFORMANCE */}

      <section className="analytics-section">

        <h2>
          🎯 Task Performance
        </h2>


        <div className="arc-data-grid">

          <div>

            <strong>
              {taskAnalytics.total}
            </strong>

            <span>
              Total Tasks
            </span>

          </div>


          <div>

            <strong>
              {taskAnalytics.completed}
            </strong>

            <span>
              Completed
            </span>

          </div>


          <div>

            <strong>
              {taskAnalytics.pending}
            </strong>

            <span>
              Pending
            </span>

          </div>


          <div>

            <strong>
              {taskAnalytics.completionRate}%
            </strong>

            <span>
              Completion Rate
            </span>

          </div>


          <div>

            <strong>
              {taskAnalytics.academic}
            </strong>

            <span>
              Academic
            </span>

          </div>


          <div>

            <strong>
              {taskAnalytics.coding}
            </strong>

            <span>
              Coding
            </span>

          </div>


          <div>

            <strong>
              {taskAnalytics.project}
            </strong>

            <span>
              Projects
            </span>

          </div>


          <div>

            <strong>
              {taskAnalytics.personal}
            </strong>

            <span>
              Personal
            </span>

          </div>

        </div>

      </section>


      {/* DATA HEALTH */}

      <section className="analytics-section">

        <h2>
          🛡️ Winter ARC Data Health
        </h2>


        <div className="data-health-card">

          <div className="data-health-header">

            <div>

              <span>
                SYSTEM INTEGRITY
              </span>

              <strong>
                {dataHealth.score}%
              </strong>

              <p>
                {dataHealth.status}
              </p>

            </div>

          </div>


          <div className="data-health-list">

            {dataHealth.checks.map(
              check => (

                <div
                  className={`data-health-row ${
                    check.passed
                      ? 'passed'
                      : 'failed'
                  }`}
                  key={check.name}
                >

                  <span>
                    {
                      check.passed
                        ? '✓'
                        : '!'
                    }
                  </span>


                  <div>

                    <strong>
                      {check.name}
                    </strong>

                    <p>
                      {check.message}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

    </>

  )
}


export default Analytics