import { syllabus } from '../data/syllabus'

import {
  getCurrentSchedule
} from './timeEngine'

import {
  getWinterArcState
} from './winterArcState'

import {
  getDailyHistory
} from './historyEngine'

import {
  getTodayTasks,
  getTodayTaskStats
} from './taskEngine'

import {
  getAptitudeEntries,
  getAptitudeAccuracy,
  getAptitudeTopicPerformance,
  getAutoCADEEntries,
  getAutoCADAverageConfidence,
  getAutoCADTopicPerformance
} from './learningEngine'


/* =========================================================
   TYPES
   ========================================================= */

export type ArcData = {
  sleep: number
  meals: number
  water: number
  streak: number
}


/* =========================================================
   ACADEMIC PROGRESS
   ========================================================= */

export function getAcademicProgress() {

  const state =
    getWinterArcState()

  return syllabus.map((subject) => {

    const completed =
      subject.units.filter(
        (_, index) =>
          state.academicProgress[
            `${subject.id}-${index}`
          ] === 'Completed'
      ).length

    const percentage =
      subject.units.length > 0
        ? Math.round(
            (completed /
              subject.units.length) *
              100
          )
        : 0

    return {
      id: subject.id,
      name: subject.name,
      percentage
    }
  })
}


/* =========================================================
   UPCOMING EXAM
   ========================================================= */

function getUpcomingSubjectExam() {

  const state =
    getWinterArcState()

  const today =
    new Date()

  const upcoming =
    syllabus
      .map((subject) => {

        const dateString =
          state.examDates[subject.id]

        if (!dateString) {
          return null
        }

        const examDate =
          new Date(
            `${dateString}T00:00:00`
          )

        const daysLeft =
          Math.ceil(
            (
              examDate.getTime() -
              today.getTime()
            ) /
            (1000 * 60 * 60 * 24)
          )

        return {
          id: subject.id,
          name: subject.name,
          date: dateString,
          daysLeft
        }
      })
      .filter(
        (
          exam
        ): exam is NonNullable<typeof exam> =>
          exam !== null &&
          exam.daysLeft >= 0
      )
      .sort(
        (a, b) =>
          a.daysLeft -
          b.daysLeft
      )

  return upcoming[0] || null
}


/* =========================================================
   ARC TASK SELECTOR
   ========================================================= */

export function getNextTask() {

  const tasks =
    getTodayTasks()
      .filter(
        (task) =>
          !task.completed
      )

  if (tasks.length === 0) {
    return null
  }

  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
  }

  return [...tasks].sort(
    (a, b) =>
      priorityOrder[a.priority] -
      priorityOrder[b.priority]
  )[0]
}


/* =========================================================
   LEARNING HELPERS
   ========================================================= */

function getDaysSince(
  dateString: string
): number {

  const today =
    new Date()

  const date =
    new Date(
      `${dateString}T00:00:00`
    )

  const difference =
    today.getTime() -
    date.getTime()

  return Math.floor(
    difference /
    (1000 * 60 * 60 * 24)
  )
}


/* =========================================================
   LEARNING STATUS
   ========================================================= */

export function getLearningPriority() {

  const aptitudeEntries =
    getAptitudeEntries()

  const autocadEntries =
    getAutoCADEEntries()


  /* -----------------------------------------
     APTITUDE
     ----------------------------------------- */

  let aptitudeStatus:
    | 'good'
    | 'inactive'
    | 'weak'
    | 'none' =
    'none'

  let aptitudeMessage =
    'No aptitude practice recorded yet.'


  if (aptitudeEntries.length > 0) {

    const latest =
      aptitudeEntries[0]

    const daysSince =
      getDaysSince(
        latest.date
      )

    const accuracy =
      getAptitudeAccuracy()


    if (daysSince >= 3) {

      aptitudeStatus =
        'inactive'

      aptitudeMessage =
        `You have not practised aptitude for ${daysSince} days. Complete one focused aptitude session.`

    } else if (
      aptitudeEntries.reduce(
        (total, entry) =>
          total + entry.attempted,
        0
      ) >= 5 &&
      accuracy < 70
    ) {

      aptitudeStatus =
        'weak'

      aptitudeMessage =
        `Your aptitude accuracy is ${accuracy}%. Focus on accuracy and revise mistakes before increasing difficulty.`

    } else {

      aptitudeStatus =
        'good'

      aptitudeMessage =
        `Aptitude is active at ${accuracy}% accuracy. Keep practising consistently.`

    }
  }


  /* -----------------------------------------
     APTITUDE WEAK TOPIC
     ----------------------------------------- */

  const aptitudeTopics =
    getAptitudeTopicPerformance()

  const weakAptitudeTopic =
    [...aptitudeTopics]
      .filter(
        (topic) =>
          topic.questions >= 3
      )
      .sort(
        (a, b) =>
          a.accuracy -
          b.accuracy
      )[0]


  /* -----------------------------------------
     AUTOCAD
     ----------------------------------------- */

  let autocadStatus:
    | 'good'
    | 'inactive'
    | 'weak'
    | 'none' =
    'none'

  let autocadMessage =
    'No AutoCAD practice recorded yet.'


  if (autocadEntries.length > 0) {

    const latest =
      autocadEntries[0]

    const daysSince =
      getDaysSince(
        latest.date
      )

    const confidence =
      getAutoCADAverageConfidence()


    if (daysSince >= 3) {

      autocadStatus =
        'inactive'

      autocadMessage =
        `You have not practised AutoCAD for ${daysSince} days. Complete one drawing practice session.`

    } else if (
      autocadEntries.length >= 1 &&
      confidence < 3
    ) {

      autocadStatus =
        'weak'

      autocadMessage =
        `Your AutoCAD confidence is ${confidence}/5. Do another guided drawing practice session.`

    } else {

      autocadStatus =
        'good'

      autocadMessage =
        `AutoCAD is active with ${confidence}/5 average confidence. Keep building through practice.`

    }
  }


  /* -----------------------------------------
     AUTOCAD WEAK TOPIC
     ----------------------------------------- */

  const autocadTopics =
    getAutoCADTopicPerformance()

  const weakAutoCADTopic =
    [...autocadTopics]
      .sort(
        (a, b) =>
          a.confidence -
          b.confidence
      )[0]


  /* -----------------------------------------
     OVERALL PRIORITY
     ----------------------------------------- */

  if (
    aptitudeStatus === 'weak'
  ) {

    return {
      type: 'aptitude',
      title:
        'Aptitude needs attention',
      message:
        aptitudeMessage,
      status:
        aptitudeStatus,
      topic:
        weakAptitudeTopic?.topic || null
    }

  }


  if (
    aptitudeStatus === 'inactive'
  ) {

    return {
      type: 'aptitude',
      title:
        'Restart aptitude practice',
      message:
        aptitudeMessage,
      status:
        aptitudeStatus,
      topic:
        weakAptitudeTopic?.topic || null
    }

  }


  if (
    autocadStatus === 'weak'
  ) {

    return {
      type: 'autocad',
      title:
        'AutoCAD needs practice',
      message:
        autocadMessage,
      status:
        autocadStatus,
      topic:
        weakAutoCADTopic?.topic || null
    }

  }


  if (
    autocadStatus === 'inactive'
  ) {

    return {
      type: 'autocad',
      title:
        'Restart AutoCAD practice',
      message:
        autocadMessage,
      status:
        autocadStatus,
      topic:
        weakAutoCADTopic?.topic || null
    }

  }


  if (
    aptitudeStatus === 'none' &&
    autocadStatus === 'none'
  ) {

    return {
      type: 'learning',
      title:
        'Start skill development',
      message:
        'You have not recorded aptitude or AutoCAD practice yet. Start one learning session today.',
      status:
        'none',
      topic:
        null
    }

  }


  return {
    type: 'learning',
    title:
      'Learning is on track',
    message:
      'Your aptitude and AutoCAD practice are currently active. Keep building consistently.',
    status:
      'good',
    topic:
      null
  }
}


/* =========================================================
   MAIN ARC PRIORITY
   ========================================================= */

export function getArcPriority(
  data: ArcData
) {

  const subjects =
    getAcademicProgress()


  const weakestSubject =
    [...subjects]
      .sort(
        (a, b) =>
          a.percentage -
          b.percentage
      )[0]


  const upcomingExam =
    getUpcomingSubjectExam()


  const currentSchedule =
    getCurrentSchedule()


  const history =
    getDailyHistory()


  const last7Days =
    history.slice(-7)


  const startedDays =
    last7Days.filter(
      (day) =>
        day.started
    ).length


  const sleepDays =
    last7Days.filter(
      (day) =>
        Number(day.sleep) > 0
    )


  const averageSleep =
    sleepDays.length > 0
      ? sleepDays.reduce(
          (total, day) =>
            total +
            Number(day.sleep),
          0
        ) /
        sleepDays.length
      : 0


  const taskStats =
    getTodayTaskStats()


  const learning =
    getLearningPriority()


  /*
   * 1. HEALTH
   */

  if (
    data.sleep > 0 &&
    data.sleep < 6
  ) {

    return {
      type: 'health',
      title:
        'Protect your energy',
      message:
        'Your sleep is low. Keep today focused and avoid late-night catch-up.'
    }

  }


  /*
   * 2. EXAM
   */

  if (
    upcomingExam &&
    upcomingExam.daysLeft <= 3
  ) {

    return {
      type: 'exam',
      title:
        `Focus on ${upcomingExam.name}`,
      message:
        `${upcomingExam.name} exam is in ${
          upcomingExam.daysLeft
        } day${
          upcomingExam.daysLeft === 1
            ? ''
            : 's'
        }. Make this your main academic focus today.`
    }

  }


  /*
   * 3. HIGH PRIORITY TASK
   */

  if (
    taskStats.highPriority > 0
  ) {

    const nextTask =
      getNextTask()


    if (nextTask) {

      return {
        type: 'task',
        title:
          'Your next task',
        message:
          `Start: ${nextTask.title}`
      }

    }

  }


  /*
   * 4. CURRENT SCHEDULE
   */

  if (currentSchedule) {

    return {
      type: 'schedule',
      title:
        currentSchedule.title,
      message:
        `It is ${currentSchedule.time}. Your current task is: ${currentSchedule.activity}.`
    }

  }


  /*
   * 5. BASIC WELLBEING
   */

  if (data.meals < 2) {

    return {
      type: 'wellbeing',
      title:
        'Take care of the basics',
      message:
        'You have not logged two meals yet. Handle your basic needs before pushing study.'
    }

  }


  /*
   * 6. CONSISTENCY
   */

  if (
    last7Days.length >= 3 &&
    startedDays <= 2
  ) {

    return {
      type: 'consistency',
      title:
        'Rebuild your consistency',
      message:
        `You started only ${startedDays} of your recent tracked days. Focus on starting today rather than trying to catch up.`
    }

  }


  /*
   * 7. RECENT SLEEP
   */

  if (
    averageSleep > 0 &&
    averageSleep < 6.5
  ) {

    return {
      type: 'health',
      title:
        'Your recent sleep is low',
      message:
        `Your average recorded sleep is ${averageSleep.toFixed(
          1
        )} hours. Protect your sleep instead of extending late-night study sessions.`
    }

  }


  /*
   * 8. LEARNING
   *
   * New ARC intelligence:
   * Aptitude + AutoCAD
   */

  if (
    learning.status === 'weak'
  ) {

    return {
      type:
        learning.type,
      title:
        learning.title,
      message:
        learning.topic
          ? `${learning.message} Topic to revisit: ${learning.topic}.`
          : learning.message
    }

  }


  if (
    learning.status === 'inactive'
  ) {

    return {
      type:
        learning.type,
      title:
        learning.title,
      message:
        learning.topic
          ? `${learning.message} Consider revisiting ${learning.topic}.`
          : learning.message
    }

  }


  /*
   * 9. WEAK SUBJECT
   */

  if (
    weakestSubject &&
    weakestSubject.percentage < 40
  ) {

    return {
      type: 'academic',
      title:
        `Focus on ${weakestSubject.name}`,
      message:
        `${weakestSubject.name} is currently at ${weakestSubject.percentage}%. Give it one focused study session.`
    }

  }


  /*
   * 10. ANY PENDING TASK
   */

  const nextTask =
    getNextTask()


  if (nextTask) {

    return {
      type: 'task',
      title:
        'Continue your work',
      message:
        `Your next task is: ${nextTask.title}`
    }

  }


  /*
   * 11. START
   */

  if (
    data.streak === 0
  ) {

    return {
      type: 'discipline',
      title:
        'Start first',
      message:
        'Do not wait for motivation. Start one meaningful task for five minutes.'
    }

  }


  /*
   * 12. DEFAULT
   */

  return {
    type:
      'maintenance',
    title:
      'Keep the momentum',
    message:
      'Continue with your planned work and protect your shutdown time.'
  }
}