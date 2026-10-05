import {
  refreshWinterArc
} from './refreshEngine'

import {
  getStoredData,
  setStoredData
} from './storage'

export type DailyRecord = {
  date: string
  started: boolean
  water: number
  sleep: string
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  tablets: boolean
  familyCall: boolean
  thoughts: string
}

export type WinterArcState = {
  academicProgress: Record<string, string>
  skillProgress: Record<string, number>
  examDates: Record<string, string>

  habits: {
    water: number
    sleep: string
    breakfast: boolean
    lunch: boolean
    dinner: boolean
    tablets: boolean
    familyCall: boolean
    thoughts: string
  }

  habitsDate: string

  streak: number
  lastStart: string
  arcStartDate: string

  dailyHistory: Record<string, DailyRecord>
}

export const defaultWinterArcState: WinterArcState = {
  academicProgress: {},
  skillProgress: {},
  examDates: {},

  habits: {
    water: 0,
    sleep: '',
    breakfast: false,
    lunch: false,
    dinner: false,
    tablets: false,
    familyCall: false,
    thoughts: ''
  },

  habitsDate: '',

  streak: 0,
  lastStart: '',
  arcStartDate: '',

  dailyHistory: {}
}

const STATE_KEY = 'winterArcState'

export function getWinterArcState(): WinterArcState {
  const stored =
    getStoredData<unknown>(
      STATE_KEY,
      defaultWinterArcState
    )

  if (
    !stored ||
    typeof stored !== 'object'
  ) {
    return {
      ...defaultWinterArcState
    }
  }

  const data =
    stored as Partial<WinterArcState>

  return {
    academicProgress:
      data.academicProgress &&
      typeof data.academicProgress === 'object'
        ? data.academicProgress
        : {},

    skillProgress:
      data.skillProgress &&
      typeof data.skillProgress === 'object'
        ? data.skillProgress
        : {},

    examDates:
      data.examDates &&
      typeof data.examDates === 'object'
        ? data.examDates
        : {},

    habits: {
      ...defaultWinterArcState.habits,
      ...(data.habits || {})
    },

    habitsDate:
      typeof data.habitsDate === 'string'
        ? data.habitsDate
        : '',

    streak:
      typeof data.streak === 'number'
        ? Math.max(0, data.streak)
        : 0,

    lastStart:
      typeof data.lastStart === 'string'
        ? data.lastStart
        : '',

    arcStartDate:
      typeof data.arcStartDate === 'string'
        ? data.arcStartDate
        : '',

    dailyHistory:
      data.dailyHistory &&
      typeof data.dailyHistory === 'object'
        ? data.dailyHistory
        : {}
  }
}

export function saveWinterArcState(
  state: WinterArcState
) {
  setStoredData(
    STATE_KEY,
    state
  )

  refreshWinterArc()
}