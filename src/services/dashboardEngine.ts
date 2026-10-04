import { syllabus } from '../data/syllabus'
import { getWinterArcState } from './winterArcState'

export function getDashboardData() {

  const state = getWinterArcState()

  // -------------------------
  // Academic progress
  // -------------------------

  const subjectProgress =
    syllabus.map((subject) => {

      const completed =
        subject.units.filter(
          (_, index) =>
            state.academicProgress[
              `${subject.id}-${index}`
            ] === 'Completed'
        ).length

      const percentage =
        Math.round(
          (
            completed /
            subject.units.length
          ) * 100
        )

      return {
        id: subject.id,
        name: subject.name,
        completed,
        total: subject.units.length,
        percentage
      }
    })

  const totalUnits =
    syllabus.reduce(
      (total, subject) =>
        total + subject.units.length,
      0
    )

  const completedUnits =
    subjectProgress.reduce(
      (total, subject) =>
        total + subject.completed,
      0
    )

  const academicPercentage =
    Math.round(
      (completedUnits / totalUnits) * 100
    )

  // -------------------------
  // Weakest subject
  // -------------------------

  const needsAttention =
    [...subjectProgress]
      .sort(
        (a, b) =>
          a.percentage - b.percentage
      )[0]

  // -------------------------
  // Skills
  // -------------------------

  const skillValues =
    Object.values(
      state.skillProgress
    )

  const averageSkillProgress =
    skillValues.length > 0
      ? Math.round(
          skillValues.reduce(
            (a, b) => a + b,
            0
          ) / skillValues.length
        )
      : 0

  // -------------------------
  // Habits
  // -------------------------

  const meals = [
    state.habits.breakfast,
    state.habits.lunch,
    state.habits.dinner
  ].filter(Boolean).length

  return {
    subjectProgress,

    totalUnits,

    completedUnits,

    academicPercentage,

    needsAttention,

    averageSkillProgress,

    streak: state.streak,

    water: state.habits.water,

    sleep: state.habits.sleep,

    meals,

    startedToday:
      state.lastStart ===
      new Date()
        .toISOString()
        .split('T')[0]
  }
}