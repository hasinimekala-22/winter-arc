import {
  getWinterArcState
} from './winterArcState'

import {
  getTasks
} from './taskEngine'

import {
  getDailyHistory
} from './historyEngine'

import {
  syllabus
} from '../data/syllabus'


export type DataHealth = {
  score: number
  status: 'Healthy' | 'Needs Attention'
  checks: {
    name: string
    passed: boolean
    message: string
  }[]
}


export function getDataHealth():
  DataHealth {

  const state =
    getWinterArcState()

  const tasks =
    getTasks()

  const history =
    getDailyHistory()


  const checks:
    DataHealth['checks'] = []


  /*
   * CHECK 1
   * STATE EXISTS
   */

  checks.push({

    name:
      'Core state',

    passed:
      Boolean(state),

    message:
      state
        ? 'Winter ARC state is available.'
        : 'Core Winter ARC state is missing.'

  })


  /*
   * CHECK 2
   * HABITS
   */

  const habitsValid =
    Boolean(
      state.habits &&
      typeof state.habits === 'object'
    )


  checks.push({

    name:
      'Habit data',

    passed:
      habitsValid,

    message:
      habitsValid
        ? 'Habit tracking data is valid.'
        : 'Habit tracking data is incomplete.'

  })


  /*
   * CHECK 3
   * ACADEMIC STATE
   */

  const academicValid =
    Boolean(
      state.academicProgress &&
      typeof state.academicProgress === 'object'
    )


  checks.push({

    name:
      'Academic data',

    passed:
      academicValid,

    message:
      academicValid
        ? 'Academic progress data is available.'
        : 'Academic progress data is missing.'

  })


  /*
   * CHECK 4
   * SYLLABUS
   */

  const syllabusValid =
    syllabus.length > 0 &&
    syllabus.every(
      subject =>
        subject.id &&
        subject.name &&
        subject.units.length > 0
    )


  checks.push({

    name:
      'Syllabus',

    passed:
      syllabusValid,

    message:
      syllabusValid
        ? `${syllabus.length} subjects are loaded.`
        : 'Syllabus configuration needs attention.'

  })


  /*
   * CHECK 5
   * TASK DATA
   */

  const tasksValid =
    Array.isArray(tasks) &&
    tasks.every(
      task =>
        Boolean(task.id) &&
        Boolean(task.title) &&
        Boolean(task.date)
    )


  checks.push({

    name:
      'Task data',

    passed:
      tasksValid,

    message:
      tasksValid
        ? `${tasks.length} task records are available.`
        : 'One or more task records are invalid.'

  })


  /*
   * CHECK 6
   * HISTORY
   */

  const historyValid =
    Array.isArray(history) &&
    history.every(
      day =>
        Boolean(day.date) &&
        typeof day.water === 'number'
    )


  checks.push({

    name:
      'Daily history',

    passed:
      historyValid,

    message:
      historyValid
        ? `${history.length} daily records are available.`
        : 'Daily history contains invalid records.'

  })


  /*
   * CHECK 7
   * EXAM DATES
   */

  const examDates =
    state.examDates || {}


  const examDateValues =
    Object.values(
      examDates
    )


  const examDatesValid =
    examDateValues.every(
      date => {

        if (!date) {
          return true
        }

        const parsed =
          new Date(
            `${date}T00:00:00`
          )

        return !Number.isNaN(
          parsed.getTime()
        )

      }
    )


  checks.push({

    name:
      'Exam dates',

    passed:
      examDatesValid,

    message:
      examDatesValid
        ? `${examDateValues.length} subject exam date record(s) checked.`
        : 'One or more exam dates are invalid.'

  })


  /*
   * SCORE
   */

  const passed =
    checks.filter(
      check =>
        check.passed
    ).length


  const score =
    Math.round(
      (
        passed /
        checks.length
      ) * 100
    )


  return {

    score,

    status:
      score === 100
        ? 'Healthy'
        : 'Needs Attention',

    checks

  }

}