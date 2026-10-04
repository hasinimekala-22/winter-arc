import type {
  DailyRecord
} from './winterArcState'

import {
  getWinterArcState,
  saveWinterArcState
} from './winterArcState'


/*
 * GET TODAY
 */

export function getToday(): string {

  const today =
    new Date()

  const year =
    today.getFullYear()

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, '0')

  const day =
    String(
      today.getDate()
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}


/*
 * CREATE TODAY'S SNAPSHOT
 */

function createTodayRecord(): DailyRecord {

  const state =
    getWinterArcState()

  const today =
    getToday()

  return {

    date:
      today,

    started:
      state.lastStart === today,

    water:
      Math.max(
        0,
        Number(
          state.habits.water
        ) || 0
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
 * SAVE TODAY
 */

export function saveTodayRecord(): void {

  const state =
    getWinterArcState()

  const today =
    getToday()

  const record =
    createTodayRecord()


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
 * GET HISTORY
 */

export function getDailyHistory():
  DailyRecord[] {

  const state =
    getWinterArcState()


  return Object.values(
    state.dailyHistory || {}
  )
    .sort(
      (a, b) =>
        a.date.localeCompare(
          b.date
        )
    )

}


/*
 * GET RECENT HISTORY
 */

export function getRecentHistory(
  days: number = 7
): DailyRecord[] {

  const history =
    getDailyHistory()


  const safeDays =
    Math.max(
      1,
      Math.floor(days)
    )


  return history.slice(
    -safeDays
  )

}


/*
 * GET RECORD FOR A DATE
 */

export function getHistoryForDate(
  date: string
): DailyRecord | null {

  const state =
    getWinterArcState()


  return (
    state.dailyHistory?.[date]
    || null
  )

}


/*
 * CHECK WHETHER TODAY
 * HAS BEEN RECORDED
 */

export function hasTodayRecord():
  boolean {

  const state =
    getWinterArcState()

  const today =
    getToday()


  return Boolean(
    state.dailyHistory?.[today]
  )

}


/*
 * COUNT STARTED DAYS
 */

export function getStartedDays():
  number {

  return getDailyHistory()
    .filter(
      day =>
        day.started
    )
    .length

}


/*
 * GET HISTORY STATS
 */

export function getHistoryStats() {

  const history =
    getDailyHistory()


  if (
    history.length === 0
  ) {

    return {

      daysRecorded: 0,

      daysStarted: 0,

      averageWater: 0,

      averageSleep: 0,

      mealsLogged: 0

    }

  }


  const daysStarted =
    history.filter(
      day =>
        day.started
    ).length


  const averageWater =
    Math.round(
      (
        history.reduce(
          (
            total,
            day
          ) =>
            total +
            (
              Number(
                day.water
              ) || 0
            ),
          0
        ) /
        history.length
      ) * 10
    ) / 10


  const sleepDays =
    history.filter(
      day =>
        Number(
          day.sleep
        ) > 0
    )


  const averageSleep =
    sleepDays.length > 0

      ? Math.round(
          (
            sleepDays.reduce(
              (
                total,
                day
              ) =>
                total +
                Number(
                  day.sleep
                ),
              0
            ) /
            sleepDays.length
          ) * 10
        ) / 10

      : 0


  const mealsLogged =
    history.reduce(
      (
        total,
        day
      ) =>
        total +
        [
          day.breakfast,
          day.lunch,
          day.dinner
        ].filter(Boolean).length,
      0
    )


  return {

    daysRecorded:
      history.length,

    daysStarted,

    averageWater,

    averageSleep,

    mealsLogged

  }

}