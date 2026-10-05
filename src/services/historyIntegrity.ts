import {
  getWinterArcState,
  saveWinterArcState
} from './winterArcState'

import {
  getToday
} from './historyEngine'


function getEmptyHabits() {

  return {

    water: 0,

    sleep: '',

    breakfast: false,

    lunch: false,

    dinner: false,

    tablets: false,

    familyCall: false,

    thoughts: ''

  }

}


/*
 * Convert a history record into the
 * active habits object.
 */

function habitsFromRecord(
  record: {
    water: number
    sleep: string
    breakfast: boolean
    lunch: boolean
    dinner: boolean
    tablets: boolean
    familyCall: boolean
    thoughts: string
  }
) {

  return {

    water:
      Math.max(
        0,
        Number(record.water) || 0
      ),

    sleep:
      record.sleep || '',

    breakfast:
      Boolean(record.breakfast),

    lunch:
      Boolean(record.lunch),

    dinner:
      Boolean(record.dinner),

    tablets:
      Boolean(record.tablets),

    familyCall:
      Boolean(record.familyCall),

    thoughts:
      record.thoughts || ''

  }

}


/*
 * ENSURE TODAY
 *
 * This function ONLY handles date transitions.
 *
 * It does NOT continuously overwrite today's
 * history.
 */

export function ensureTodayHistory(): void {

  const state =
    getWinterArcState()

  const today =
    getToday()

  const history =
    state.dailyHistory || {}

  /*
   * First-time initialization.
   */

  if (!state.habitsDate) {

    /*
     * If today's history already exists,
     * use it as the active habits.
     */

    if (history[today]) {

      state.habits =
        habitsFromRecord(
          history[today]
        )

    }

    /*
     * Otherwise create today's blank
     * record.
     */

    else {

      history[today] = {

        date:
          today,

        started:
          state.lastStart === today,

        water: 0,

        sleep: '',

        breakfast: false,

        lunch: false,

        dinner: false,

        tablets: false,

        familyCall: false,

        thoughts: ''

      }

    }

    state.habitsDate =
      today

    state.dailyHistory =
      history

    saveWinterArcState(
      state
    )

    return
  }


  /*
   * SAME DAY
   *
   * Absolutely nothing should happen here.
   *
   * This is the critical protection against
   * wiping today's history on refresh.
   */

  if (
    state.habitsDate === today
  ) {

    return

  }


  /*
   * NEW DAY
   *
   * The active habits belong to an older date.
   */

  if (
    state.habitsDate < today
  ) {

    const oldDate =
      state.habitsDate

    /*
     * The previous day's history should
     * already have been saved by the habit
     * actions.
     *
     * Only create it if completely missing.
     */

    if (!history[oldDate]) {

      history[oldDate] = {

        date:
          oldDate,

        started:
          state.lastStart === oldDate,

        water:
          Math.max(
            0,
            Number(state.habits.water) || 0
          ),

        sleep:
          state.habits.sleep || '',

        breakfast:
          Boolean(
            state.habits.breakfast
          ),

        lunch:
          Boolean(
            state.habits.lunch
          ),

        dinner:
          Boolean(
            state.habits.dinner
          ),

        tablets:
          Boolean(
            state.habits.tablets
          ),

        familyCall:
          Boolean(
            state.habits.familyCall
          ),

        thoughts:
          state.habits.thoughts || ''

      }

    }


    /*
     * Create today's blank record.
     *
     * NEVER overwrite it if it already exists.
     */

    if (!history[today]) {

      history[today] = {

        date:
          today,

        started:
          state.lastStart === today,

        ...getEmptyHabits()

      }

    }


    /*
     * Reset ONLY active habits.
     */

    state.habits =
      getEmptyHabits()

    state.habitsDate =
      today

    state.dailyHistory =
      history

    /*
     * IMPORTANT:
     *
     * Do NOT change:
     * - arcStartDate
     * - streak
     * - lastStart
     */

    saveWinterArcState(
      state
    )

  }

}


/*
 * CLEAN HISTORY
 */

export function cleanHistory(): void {

  const state =
    getWinterArcState()

  const history =
    state.dailyHistory || {}

  const cleaned:
    typeof history = {}

  Object.entries(
    history
  ).forEach(
    ([date, record]) => {

      if (
        !record ||
        !date
      ) {
        return
      }

      cleaned[date] = {

        ...record,

        date,

        water:
          Math.max(
            0,
            Number(record.water) || 0
          ),

        sleep:
          record.sleep || '',

        started:
          Boolean(
            record.started
          ),

        breakfast:
          Boolean(
            record.breakfast
          ),

        lunch:
          Boolean(
            record.lunch
          ),

        dinner:
          Boolean(
            record.dinner
          ),

        tablets:
          Boolean(
            record.tablets
          ),

        familyCall:
          Boolean(
            record.familyCall
          ),

        thoughts:
          record.thoughts || ''

      }

    }
  )

  state.dailyHistory =
    cleaned

  saveWinterArcState(
    state
  )

}