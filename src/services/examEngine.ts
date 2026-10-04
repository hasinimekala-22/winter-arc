import { getWinterArcState } from './winterArcState'
import { syllabus } from '../data/syllabus'

export type ExamInfo = {
  id: string
  name: string
  date: string
  daysLeft: number
  progress: number
}

export function getExamInfo(): ExamInfo[] {
  const state = getWinterArcState()

const today = new Date()

today.setHours(
  0,
  0,
  0,
  0
)

  const exams: ExamInfo[] = []

  for (const subject of syllabus) {
    const date = state.examDates[subject.id]

    if (!date) {
      continue
    }

    const examDate =
      new Date(`${date}T00:00:00`)

    const daysLeft =
      Math.ceil(
        (
          examDate.getTime() -
          today.getTime()
        ) /
        (1000 * 60 * 60 * 24)
      )

    let completed = 0

    for (
      let i = 0;
      i < subject.units.length;
      i++
    ) {
      const key =
        `${subject.id}-${i}`

      if (
        state.academicProgress[key] ===
        'Completed'
      ) {
        completed++
      }
    }

    const total =
      subject.units.length

    const progress =
      total > 0
        ? Math.round(
            (completed / total) * 100
          )
        : 0

    exams.push({
      id: subject.id,
      name: subject.name,
      date,
      daysLeft,
      progress
    })
  }

  exams.sort(
    (a, b) =>
      a.daysLeft - b.daysLeft
  )

  return exams
}