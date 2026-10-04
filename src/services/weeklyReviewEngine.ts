import { getDailyHistory } from './historyEngine'
import { getWinterArcState } from './winterArcState'
import { getTaskAnalytics } from './taskEngine'
import { syllabus } from '../data/syllabus'

export type WeeklyReview = {
  daysRecorded: number
  daysStarted: number
  consistency: number

  averageWater: number
  averageSleep: number
  mealsCompleted: number

  totalTasks: number
  completedTasks: number
  pendingTasks: number
  taskCompletionRate: number

  academicPercentage: number
  completedUnits: number
  totalUnits: number

  strongestSubject: string
  weakestSubject: string

  strongestDay: string
  weakestDay: string

  strengths: string[]
  concerns: string[]
  actions: string[]
}

export function getWeeklyReview(): WeeklyReview {
  const state = getWinterArcState()
  const history = getDailyHistory()

  const last7Days = history.slice(-7)

  const daysRecorded = last7Days.length

  const daysStarted = last7Days.filter(
    day => day.started
  ).length

  const consistency =
    daysRecorded > 0
      ? Math.round(
          (daysStarted / daysRecorded) * 100
        )
      : 0

  const averageWater =
    daysRecorded > 0
      ? Math.round(
          (
            last7Days.reduce(
              (total, day) =>
                total + day.water,
              0
            ) / daysRecorded
          ) * 10
        ) / 10
      : 0

  const sleepDays = last7Days.filter(
    day => Number(day.sleep) > 0
  )

  const averageSleep =
    sleepDays.length > 0
      ? Math.round(
          (
            sleepDays.reduce(
              (total, day) =>
                total + Number(day.sleep),
              0
            ) / sleepDays.length
          ) * 10
        ) / 10
      : 0

  const mealsCompleted =
    last7Days.reduce(
      (total, day) =>
        total +
        [
          day.breakfast,
          day.lunch,
          day.dinner
        ].filter(Boolean).length,
      0
    )

  const taskAnalytics =
    getTaskAnalytics()

  let totalUnits = 0
  let completedUnits = 0

  const subjectProgress = syllabus.map(
    subject => {
      const completed =
        subject.units.filter(
          (_, index) =>
            state.academicProgress[
              `${subject.id}-${index}`
            ] === 'Completed'
        ).length

      totalUnits += subject.units.length
      completedUnits += completed

      return {
        name: subject.name,
        percentage:
          subject.units.length > 0
            ? Math.round(
                (completed /
                  subject.units.length) *
                100
              )
            : 0
      }
    }
  )

  const academicPercentage =
    totalUnits > 0
      ? Math.round(
          (completedUnits / totalUnits) * 100
        )
      : 0

  const sortedSubjects =
    [...subjectProgress].sort(
      (a, b) =>
        b.percentage - a.percentage
    )

  const strongestSubject =
    sortedSubjects[0]?.name ||
    'No data'

  const weakestSubject =
    sortedSubjects[
      sortedSubjects.length - 1
    ]?.name ||
    'No data'

  const dayScores = last7Days.map(day => {
    const meals = [
      day.breakfast,
      day.lunch,
      day.dinner
    ].filter(Boolean).length

    const sleepScore =
      Number(day.sleep) >= 7 ? 1 : 0

    const waterScore =
      day.water >= 6 ? 1 : 0

    const startScore =
      day.started ? 1 : 0

    const mealScore =
      meals >= 2 ? 1 : 0

    return {
      date: day.date,
      score:
        sleepScore +
        waterScore +
        startScore +
        mealScore
    }
  })

  const sortedDays =
    [...dayScores].sort(
      (a, b) => b.score - a.score
    )

  const strongestDay =
    sortedDays[0]?.date ||
    'No data'

  const weakestDay =
    sortedDays[
      sortedDays.length - 1
    ]?.date ||
    'No data'

  const strengths: string[] = []
  const concerns: string[] = []
  const actions: string[] = []

  if (consistency >= 70) {
    strengths.push(
      'You maintained good daily consistency.'
    )
  }

  if (averageWater >= 6) {
    strengths.push(
      'Your water intake was reasonably consistent.'
    )
  }

  if (averageSleep >= 7) {
    strengths.push(
      'Your recorded sleep average was healthy.'
    )
  }

  if (taskAnalytics.completionRate >= 70) {
    strengths.push(
      'You completed most of your recorded tasks.'
    )
  }

  if (academicPercentage >= 50) {
    strengths.push(
      'More than half of your academic units are completed.'
    )
  }

  if (strengths.length === 0) {
    strengths.push(
      'You have started collecting useful progress data.'
    )
  }

  if (consistency < 50) {
    concerns.push(
      'Daily start consistency is low.'
    )

    actions.push(
      'Start each day with one clearly defined task.'
    )
  }

  if (
    averageWater > 0 &&
    averageWater < 6
  ) {
    concerns.push(
      'Water intake has been inconsistent.'
    )

    actions.push(
      'Set a simple daily water target and track it.'
    )
  }

  if (
    averageSleep > 0 &&
    averageSleep < 7
  ) {
    concerns.push(
      'Recorded sleep is below 7 hours on average.'
    )

    actions.push(
      'Protect a fixed shutdown time and sleep window.'
    )
  }

  if (
    taskAnalytics.total > 0 &&
    taskAnalytics.completionRate < 50
  ) {
    concerns.push(
      'Task completion rate needs attention.'
    )

    actions.push(
      'Reduce the number of active tasks and finish the highest-priority one first.'
    )
  }

  if (
    academicPercentage < 50
  ) {
    concerns.push(
      'Academic progress is still below halfway.'
    )

    actions.push(
      `Give extra study time to ${weakestSubject}.`
    )
  }

  if (actions.length === 0) {
    actions.push(
      `Continue building progress in ${weakestSubject}.`
    )
  }

  return {
    daysRecorded,
    daysStarted,
    consistency,

    averageWater,
    averageSleep,
    mealsCompleted,

    totalTasks: taskAnalytics.total,
    completedTasks: taskAnalytics.completed,
    pendingTasks: taskAnalytics.pending,
    taskCompletionRate:
      taskAnalytics.completionRate,

    academicPercentage,
    completedUnits,
    totalUnits,

    strongestSubject,
    weakestSubject,

    strongestDay,
    weakestDay,

    strengths,
    concerns,
    actions
  }
}