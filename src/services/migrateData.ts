import {
  getWinterArcState,
  saveWinterArcState
} from './winterArcState'

const MIGRATION_KEY =
  'winterArcMigrationV2'

export function migrateOldData() {

  if (
    localStorage.getItem(
      MIGRATION_KEY
    ) === 'done'
  ) {
    return
  }

  const state =
    getWinterArcState()

  /*
   * --------------------------------
   * ACADEMIC PROGRESS
   * --------------------------------
   */

  const oldProgress =
    localStorage.getItem(
      'winterArcProgress'
    )

  if (oldProgress) {

    try {

      const parsedProgress =
        JSON.parse(oldProgress)

      state.academicProgress = {
        ...(state.academicProgress || {}),
        ...parsedProgress
      }

    } catch {
      console.warn(
        'Could not migrate old academic progress'
      )
    }
  }

  /*
   * --------------------------------
   * SKILL PROGRESS
   * --------------------------------
   */

  const oldSkills =
    localStorage.getItem(
      'winterArcSkills'
    )

  if (oldSkills) {

    try {

      const parsedSkills =
        JSON.parse(oldSkills)

      state.skillProgress = {
        ...(state.skillProgress || {}),
        ...parsedSkills
      }

    } catch {
      console.warn(
        'Could not migrate old skill progress'
      )
    }
  }

  /*
   * --------------------------------
   * EXAM DATES
   * --------------------------------
   */

  const oldExamDates =
    localStorage.getItem(
      'winterArcExamDates'
    )

  if (oldExamDates) {

    try {

      const parsedExamDates =
        JSON.parse(oldExamDates)

      state.examDates = {
        ...(state.examDates || {}),
        ...parsedExamDates
      }

    } catch {
      console.warn(
        'Could not migrate old exam dates'
      )
    }
  }

  /*
   * --------------------------------
   * OLD HABITS
   * --------------------------------
   */

  const oldHabitDate =
    localStorage.getItem(
      'winterArcHabitDate'
    )

  const oldWater =
    Number(
      localStorage.getItem(
        'winterArcWater'
      ) || '0'
    )

  const oldSleep =
    localStorage.getItem(
      'winterArcSleep'
    ) || ''

  const oldBreakfast =
    localStorage.getItem(
      'winterArcBreakfast'
    ) === 'true'

  const oldLunch =
    localStorage.getItem(
      'winterArcLunch'
    ) === 'true'

  const oldDinner =
    localStorage.getItem(
      'winterArcDinner'
    ) === 'true'

  const oldTablets =
    localStorage.getItem(
      'winterArcTablets'
    ) === 'true'

  const oldFamilyCall =
    localStorage.getItem(
      'winterArcFamilyCall'
    ) === 'true'

  const oldThoughts =
    localStorage.getItem(
      'winterArcThoughts'
    ) || ''

  /*
   * Only create the legacy history record
   * if it doesn't already exist.
   */

  if (
    oldHabitDate &&
    !state.dailyHistory?.[oldHabitDate]
  ) {

    state.dailyHistory = {

      ...(state.dailyHistory || {}),

      [oldHabitDate]: {

        date:
          oldHabitDate,

        started:
          localStorage.getItem(
            'winterArcLastStart'
          ) === oldHabitDate,

        water:
          oldWater,

        sleep:
          oldSleep,

        breakfast:
          oldBreakfast,

        lunch:
          oldLunch,

        dinner:
          oldDinner,

        tablets:
          oldTablets,

        familyCall:
          oldFamilyCall,

        thoughts:
          oldThoughts
      }
    }
  }

  /*
   * --------------------------------
   * START / STREAK
   * --------------------------------
   */

  const oldLastStart =
    localStorage.getItem(
      'winterArcLastStart'
    ) || ''

  const oldStreak =
    Number(
      localStorage.getItem(
        'winterArcStartStreak'
      ) || '0'
    )

  if (oldLastStart) {
    state.lastStart =
      oldLastStart
  }

  if (oldStreak > 0) {
    state.streak =
      Math.max(
        state.streak || 0,
        oldStreak
      )
  }

  if (
    oldLastStart &&
    !state.arcStartDate
  ) {

    state.arcStartDate =
      oldLastStart
  }

  /*
   * --------------------------------
   * HABITS DATE
   * --------------------------------
   *
   * If today's history already exists,
   * today's habits belong to today.
   *
   * Otherwise use the legacy habit date.
   */

  if (!state.habitsDate) {

    const today =
      new Date()
        .toISOString()
        .slice(0, 10)

    if (
      state.dailyHistory?.[today]
    ) {

      state.habitsDate =
        today

    } else if (
      oldHabitDate
    ) {

      state.habitsDate =
        oldHabitDate

    } else {

      state.habitsDate =
        today
    }
  }

  saveWinterArcState(
    state
  )

  localStorage.setItem(
    MIGRATION_KEY,
    'done'
  )
}