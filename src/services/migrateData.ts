import {
  getWinterArcState,
  saveWinterArcState
} from './winterArcState'

export function migrateOldData() {

  const existingState =
    localStorage.getItem('winterArcState')

  if (existingState) {
    return
  }

  const oldProgress =
    localStorage.getItem(
      'winterArcProgress'
    )

  const oldSkills =
    localStorage.getItem(
      'winterArcSkills'
    )

  const oldExamDates =
    localStorage.getItem(
      'winterArcExamDates'
    )

  const state =
    getWinterArcState()

  if (oldProgress) {

    state.academicProgress =
      JSON.parse(oldProgress)
  }

  if (oldSkills) {

    state.skillProgress =
      JSON.parse(oldSkills)
  }

  if (oldExamDates) {

    state.examDates =
      JSON.parse(oldExamDates)
  }

  state.habits.water =
    Number(
      localStorage.getItem(
        'winterArcWater'
      ) || '0'
    )

  state.habits.sleep =
    localStorage.getItem(
      'winterArcSleep'
    ) || ''

  state.habits.breakfast =
    localStorage.getItem(
      'winterArcBreakfast'
    ) === 'true'

  state.habits.lunch =
    localStorage.getItem(
      'winterArcLunch'
    ) === 'true'

  state.habits.dinner =
    localStorage.getItem(
      'winterArcDinner'
    ) === 'true'

  state.habits.tablets =
    localStorage.getItem(
      'winterArcTablets'
    ) === 'true'

  state.habits.familyCall =
    localStorage.getItem(
      'winterArcFamilyCall'
    ) === 'true'

  state.habits.thoughts =
    localStorage.getItem(
      'winterArcThoughts'
    ) || ''

  state.streak =
    Number(
      localStorage.getItem(
        'winterArcStartStreak'
      ) || '0'
    )

  state.lastStart =
    localStorage.getItem(
      'winterArcLastStart'
    ) || ''

  saveWinterArcState(state)
}