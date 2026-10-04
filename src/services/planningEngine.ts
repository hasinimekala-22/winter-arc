import { syllabus } from '../data/syllabus'
import { getWinterArcState } from './winterArcState'
import { getExamInfo } from './examEngine'
import { getTasks, type Task } from './taskEngine'


export type ExamPlan = {
  id: string
  name: string
  date: string
  daysLeft: number
  progress: number
  risk: 'high' | 'medium' | 'low'
  recommended: boolean
  message: string
}


export type PlanningRecommendation = {
  title: string
  reason: string
  category: 'exam' | 'academic' | 'task' | 'balance'
  priority: 'high' | 'medium' | 'low'
}


export type DailyPlanItem = {
  title: string
  reason: string
  category: 'exam' | 'academic' | 'task' | 'personal'
  priority: 'high' | 'medium' | 'low'
}


/*
 * EXAM PLANNER
 */

export function getExamPlans(): ExamPlan[] {

  const exams = getExamInfo()

  return exams.map(exam => {

    let risk:
      'high' |
      'medium' |
      'low' = 'low'


    if (
      exam.daysLeft <= 3 &&
      exam.progress < 70
    ) {
      risk = 'high'

    } else if (
      exam.daysLeft <= 7 &&
      exam.progress < 80
    ) {
      risk = 'medium'
    }


    let message =
      'Continue your planned preparation.'


    if (risk === 'high') {

      message =
        'Exam is close and recorded progress is still incomplete.'

    } else if (risk === 'medium') {

      message =
        'Increase focused revision for this subject.'

    }


    return {
      ...exam,

      risk,

      recommended:
        risk === 'high' ||
        risk === 'medium',

      message
    }

  })

}


/*
 * WEAKEST SUBJECT
 */

function getWeakestSubject() {

  const state =
    getWinterArcState()


  const subjects =
    syllabus.map(subject => {

      const completed =
        subject.units.filter(
          (_, index) =>
            state.academicProgress[
              `${subject.id}-${index}`
            ] === 'Completed'
        ).length


      const percentage =
        subject.units.length > 0
          ? Math.round(
              (
                completed /
                subject.units.length
              ) * 100
            )
          : 0


      return {
        id: subject.id,
        name: subject.name,
        percentage
      }

    })


  return [...subjects].sort(
    (a, b) =>
      a.percentage -
      b.percentage
  )[0] || null

}


/*
 * PENDING TASKS
 */

function getPendingTasks(): Task[] {

  return getTasks()
    .filter(task => !task.completed)

}


/*
 * OVERDUE TASKS
 */

export function getOverdueTasks(): Task[] {

  const today =
    new Date()

  today.setHours(0, 0, 0, 0)


  return getPendingTasks().filter(task => {

    const taskDate =
      new Date(
        `${task.date}T00:00:00`
      )

    return taskDate < today

  })

}


/*
 * PLANNING RECOMMENDATIONS
 */

export function getPlanningRecommendations():
  PlanningRecommendation[] {

  const recommendations:
    PlanningRecommendation[] = []


  const exams =
    getExamPlans()


  const weakest =
    getWeakestSubject()


  const pendingTasks =
    getPendingTasks()


  const overdueTasks =
    getOverdueTasks()


  /*
   * 1. URGENT EXAM
   */

  const urgentExam =
    exams.find(
      exam =>
        exam.risk === 'high'
    )


  if (urgentExam) {

    recommendations.push({

      title:
        `Prepare for ${urgentExam.name}`,

      reason:
        `${urgentExam.daysLeft} day${
          urgentExam.daysLeft === 1
            ? ''
            : 's'
        } left with ${
          urgentExam.progress
        }% recorded progress.`,

      category:
        'exam',

      priority:
        'high'

    })

  }


  /*
   * 2. MEDIUM EXAM
   */

  if (!urgentExam) {

    const upcomingExam =
      exams.find(
        exam =>
          exam.risk === 'medium'
      )


    if (upcomingExam) {

      recommendations.push({

        title:
          `Study ${upcomingExam.name}`,

        reason:
          upcomingExam.message,

        category:
          'exam',

        priority:
          'medium'

      })

    }

  }


  /*
   * 3. WEAKEST SUBJECT
   */

  if (
    weakest &&
    weakest.percentage < 50
  ) {

    recommendations.push({

      title:
        `Work on ${weakest.name}`,

      reason:
        `Recorded academic progress is ${weakest.percentage}%.`,

      category:
        'academic',

      priority:
        'medium'

    })

  }


  /*
   * 4. OVERDUE TASK
   */

  if (overdueTasks.length > 0) {

    const overdue =
      overdueTasks[0]

    recommendations.push({

      title:
        `Clear overdue task: ${overdue.title}`,

      reason:
        `This task was scheduled for ${overdue.date}.`,

      category:
        'task',

      priority:
        'high'

    })

  }


  /*
   * 5. HIGH PRIORITY TASK
   */

  const highTask =
    pendingTasks.find(
      task =>
        task.priority === 'high'
    )


  if (highTask) {

    recommendations.push({

      title:
        highTask.title,

      reason:
        `High-priority ${highTask.category} task is still pending.`,

      category:
        'task',

      priority:
        'high'

    })

  }


  /*
   * 6. BALANCE
   */

  if (
    recommendations.length === 0
  ) {

    recommendations.push({

      title:
        'Maintain the current plan',

      reason:
        'No urgent exam, academic, or task issue was detected from your saved data.',

      category:
        'balance',

      priority:
        'low'

    })

  }


  return recommendations

}


/*
 * DAILY TOP 3 PLAN
 */

export function getDailyPlan():
  DailyPlanItem[] {

  const state =
    getWinterArcState()


  const exams =
    getExamPlans()


  const pendingTasks =
    getPendingTasks()


  const overdueTasks =
    getOverdueTasks()


  const weakest =
    getWeakestSubject()


  const plan:
    DailyPlanItem[] = []


  /*
   * PRIORITY 1:
   * URGENT EXAM
   */

  const urgentExam =
    exams.find(
      exam =>
        exam.risk === 'high'
    )


  if (urgentExam) {

    plan.push({

      title:
        `Study ${urgentExam.name}`,

      reason:
        `${urgentExam.daysLeft} day${
          urgentExam.daysLeft === 1
            ? ''
            : 's'
        } left and only ${
          urgentExam.progress
        }% of recorded units are complete.`,

      category:
        'exam',

      priority:
        'high'

    })

  }


  /*
   * PRIORITY 2:
   * OVERDUE TASK
   */

  if (
    plan.length < 3 &&
    overdueTasks.length > 0
  ) {

    const task =
      overdueTasks[0]

    plan.push({

      title:
        `Finish: ${task.title}`,

      reason:
        `This task is overdue from ${task.date}.`,

      category:
        'task',

      priority:
        'high'

    })

  }


  /*
   * PRIORITY 3:
   * HIGH PRIORITY TASK
   */

  if (
    plan.length < 3
  ) {

    const highTask =
      pendingTasks.find(
        task =>
          task.priority === 'high' &&
          !plan.some(
            item =>
              item.title.includes(task.title)
          )
      )


    if (highTask) {

      plan.push({

        title:
          highTask.title,

        reason:
          `High-priority ${highTask.category} work is pending.`,

        category:
          'task',

        priority:
          'high'

      })

    }

  }


  /*
   * PRIORITY 4:
   * UPCOMING EXAM
   */

  if (
    plan.length < 3
  ) {

    const upcomingExam =
      exams.find(
        exam =>
          exam.daysLeft >= 0 &&
          exam.daysLeft <= 7
      )


    if (
      upcomingExam &&
      !plan.some(
        item =>
          item.title.includes(
            upcomingExam.name
          )
      )
    ) {

      plan.push({

        title:
          `Revise ${upcomingExam.name}`,

        reason:
          `The exam is in ${upcomingExam.daysLeft} day${
            upcomingExam.daysLeft === 1
              ? ''
              : 's'
          }.`,

        category:
          'exam',

        priority:
          'medium'

      })

    }

  }


  /*
   * PRIORITY 5:
   * WEAKEST SUBJECT
   */

  if (
    plan.length < 3 &&
    weakest
  ) {

    const alreadyAdded =
      plan.some(
        item =>
          item.title.includes(
            weakest.name
          )
      )


    if (!alreadyAdded) {

      plan.push({

        title:
          `Study ${weakest.name}`,

        reason:
          `This is currently your lowest recorded academic progress at ${weakest.percentage}%.`,

        category:
          'academic',

        priority:
          weakest.percentage < 40
            ? 'high'
            : 'medium'

      })

    }

  }


  /*
   * PRIORITY 6:
   * PERSONAL BALANCE
   */

  if (
    plan.length < 3
  ) {

    const meals =
      [
        state.habits.breakfast,
        state.habits.lunch,
        state.habits.dinner
      ].filter(Boolean).length


    if (
      meals < 2
    ) {

      plan.push({

        title:
          'Take care of your basics',

        reason:
          'Fewer than two meals are currently logged today.',

        category:
          'personal',

        priority:
          'low'

      })

    }

  }


  /*
   * FINAL FALLBACK
   */

  if (
    plan.length === 0
  ) {

    plan.push({

      title:
        'Start one meaningful task',

      reason:
        'There is no urgent item detected. Use this time to make progress on your planned work.',

      category:
        'task',

      priority:
        'low'

    })

  }


  return plan.slice(0, 3)

}


/*
 * WORKLOAD SUMMARY
 */

export function getWorkloadSummary() {

  const tasks =
    getTasks()


  const pending =
    tasks.filter(
      task => !task.completed
    )


  const high =
    pending.filter(
      task =>
        task.priority === 'high'
    ).length


  const medium =
    pending.filter(
      task =>
        task.priority === 'medium'
    ).length


  const low =
    pending.filter(
      task =>
        task.priority === 'low'
    ).length


  return {

    totalPending:
      pending.length,

    high,

    medium,

    low

  }

}