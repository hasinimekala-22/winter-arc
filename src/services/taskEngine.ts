import {
  refreshWinterArc
} from './refreshEngine'
import {
  getStoredData,
  setStoredData
} from './storage'


export type TaskCategory =
  | 'academic'
  | 'coding'
  | 'project'
  | 'personal'


export type TaskPriority =
  | 'high'
  | 'medium'
  | 'low'


export type Task = {
  id: string
  title: string
  category: TaskCategory
  priority: TaskPriority
  date: string
  completed: boolean
  createdAt: string
}


const TASK_KEY =
  'winterArcTasks'


function getToday(): string {

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


export function getTasks(): Task[] {

  const stored =
    getStoredData<unknown>(
      TASK_KEY,
      []
    )


  if (
    !Array.isArray(stored)
  ) {
    return []
  }


  return stored.filter(
    (
      task
    ): task is Task => {

      if (
        !task ||
        typeof task !== 'object'
      ) {
        return false
      }


      const item =
        task as Record<string, unknown>


      return (

        typeof item.id ===
          'string' &&

        typeof item.title ===
          'string' &&

        typeof item.category ===
          'string' &&

        typeof item.priority ===
          'string' &&

        typeof item.date ===
          'string' &&

        typeof item.completed ===
          'boolean' &&

        typeof item.createdAt ===
          'string'

      )

    }
  )

}


function saveTasks(
  tasks: Task[]
): void {

  setStoredData(
    TASK_KEY,
    tasks
  )

  refreshWinterArc()
}

export function getTodayTasks(): Task[] {

  const today =
    getToday()

  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
  }

  return getTasks()
    .filter(
      (task) =>
        task.date === today
    )
    .sort(
      (a, b) =>
        priorityOrder[a.priority] -
        priorityOrder[b.priority]
    )
}


export function getPendingTasks(): Task[] {

  return getTasks().filter(
    (task) =>
      !task.completed
  )
}


export function addTask(
  title: string,
  category: TaskCategory,
  priority: TaskPriority,
  date: string = getToday()
): Task | null {

  const cleanTitle =
    title.trim()

  if (!cleanTitle) {
    return null
  }


  const tasks =
    getTasks()


  const duplicate =
    tasks.some(
      (task) =>
        task.title.toLowerCase() ===
          cleanTitle.toLowerCase() &&
        task.date === date &&
        !task.completed
    )


  if (duplicate) {
    return null
  }


  const task: Task = {

    id:
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    title:
      cleanTitle,

    category,

    priority,

    date,

    completed:
      false,

    createdAt:
      new Date().toISOString()

  }


  saveTasks([
    ...tasks,
    task
  ])


  return task
}


export function toggleTask(
  taskId: string
): void {

  const tasks =
    getTasks()


  const updatedTasks =
    tasks.map(
      (task) => {

        if (
          task.id !== taskId
        ) {
          return task
        }


        return {
          ...task,
          completed:
            !task.completed
        }

      }
    )


  saveTasks(
    updatedTasks
  )
}


export function deleteTask(
  taskId: string
): void {

  const tasks =
    getTasks()


  const updatedTasks =
    tasks.filter(
      (task) =>
        task.id !== taskId
    )


  saveTasks(
    updatedTasks
  )
}


export function getTodayTaskStats() {

  const tasks =
    getTodayTasks()


  const completed =
    tasks.filter(
      (task) =>
        task.completed
    ).length


  const pending =
    tasks.length -
    completed


  const highPriority =
    tasks.filter(
      (task) =>
        task.priority === 'high' &&
        !task.completed
    ).length


  const completionRate =
    tasks.length > 0
      ? Math.round(
          (
            completed /
            tasks.length
          ) * 100
        )
      : 0


  return {

    total:
      tasks.length,

    completed,

    pending,

    highPriority,

    completionRate

  }
}


export function getTaskAnalytics() {

  const tasks =
    getTasks()


  const completed =
    tasks.filter(
      (task) =>
        task.completed
    ).length


  const pending =
    tasks.filter(
      (task) =>
        !task.completed
    ).length


  const academic =
    tasks.filter(
      (task) =>
        task.category === 'academic'
    ).length


  const coding =
    tasks.filter(
      (task) =>
        task.category === 'coding'
    ).length


  const project =
    tasks.filter(
      (task) =>
        task.category === 'project'
    ).length


  const personal =
    tasks.filter(
      (task) =>
        task.category === 'personal'
    ).length


  const highPriority =
    tasks.filter(
      (task) =>
        task.priority === 'high'
    ).length


  const completionRate =
    tasks.length > 0
      ? Math.round(
          (
            completed /
            tasks.length
          ) * 100
        )
      : 0


  return {

    total:
      tasks.length,

    completed,

    pending,

    completionRate,

    academic,

    coding,

    project,

    personal,

    highPriority

  }
}


export function getOverdueTasks(): Task[] {

  const today =
    getToday()


  return getTasks().filter(
    (task) =>
      task.date < today &&
      !task.completed
  )
}