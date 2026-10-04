import {
  getWinterArcState,
  saveWinterArcState
} from './winterArcState'

import {
  getToday
} from './historyEngine'


/*
 * ENSURE HISTORY EXISTS
 */

export function ensureTodayHistory(): void {

  const state =
    getWinterArcState()

  const today =
    getToday()


  if (
    state.dailyHistory?.[today]
  ) {
    return
  }


  const record = {

    date:
      today,

    started:
      state.lastStart === today,

    water:
      Number(
        state.habits.water
      ) || 0,

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


  state.dailyHistory = {

    ...(state.dailyHistory || {}),

    [today]:
      record

  }


  saveWinterArcState(
    state
  )

}


/*
 * REMOVE INVALID HISTORY
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
            Number(
              record.water
            ) || 0
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