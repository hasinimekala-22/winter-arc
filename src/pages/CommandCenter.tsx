import {
  useEffect,
  useState
} from 'react'

import type {
  FormEvent
} from 'react'

import {
  addTask,
  deleteTask,
  getTodayTasks,
  toggleTask,
  type TaskCategory,
  type TaskPriority
} from '../services/taskEngine'

import {
  getExamPlans,
  getPlanningRecommendations,
  getWorkloadSummary,
  getDailyPlan
} from '../services/planningEngine'

import {
  listenForWinterArcRefresh,
  listenForCrossTabRefresh
} from '../services/refreshEngine'


function CommandCenter() {

  const [, setRefresh] =
    useState(0)


  const [title, setTitle] =
    useState('')


  const [category, setCategory] =
    useState<TaskCategory>('academic')


  const [priority, setPriority] =
    useState<TaskPriority>('medium')


  function refreshPage() {
    setRefresh(value => value + 1)
  }


  useEffect(() => {

    const removeLocal =
      listenForWinterArcRefresh(
        refreshPage
      )

    const removeCrossTab =
      listenForCrossTabRefresh(
        refreshPage
      )


    return () => {

      removeLocal()
      removeCrossTab()

    }

  }, [])


  const todayTasks =
    getTodayTasks()


  const completedTasks =
    todayTasks.filter(
      task =>
        task.completed
    )


  const pendingTasks =
    todayTasks.filter(
      task =>
        !task.completed
    )


  const recommendations =
    getPlanningRecommendations()


  const workload =
    getWorkloadSummary()


  const exams =
    getExamPlans()


  const dailyPlan =
    getDailyPlan()


  function handleAddTask(
    event: FormEvent
  ) {

    event.preventDefault()


    const task =
      addTask(
        title,
        category,
        priority
      )


    if (!task) {

      alert(
        'Task is empty or already exists.'
      )

      return

    }


    setTitle('')

    refreshPage()

  }


  function handleToggle(
    taskId: string
  ) {

    toggleTask(taskId)

    refreshPage()

  }


  function handleDelete(
    taskId: string
  ) {

    deleteTask(taskId)

    refreshPage()

  }


  return (

    <div>

      <h1>
        🎯 Command Center
      </h1>

      <p className="page-subtitle">
        Plan the work. Execute the work. Review the work.
      </p>


      {/* DAILY TOP 3 */}

      <section className="analytics-section">

        <h2>
          🔥 Today's Top 3
        </h2>

        <div className="planning-list">

          {
            dailyPlan.map(
              (item, index) => (

                <div
                  className={`planning-item ${item.priority}`}
                  key={`${item.title}-${index}`}
                >

                  <div>

                    <strong>
                      {index + 1}. {item.title}
                    </strong>

                    <p>
                      {item.reason}
                    </p>

                    <small>
                      {item.category.toUpperCase()}
                    </small>

                  </div>

                  <span>
                    {item.priority.toUpperCase()}
                  </span>

                </div>

              )
            )
          }

        </div>

      </section>


      {/* TODAY'S TASKS */}

      <section className="analytics-section">

        <h2>
          📋 Today's Tasks
        </h2>

        <div className="analytics-grid">

          <div className="analytics-card">

            <strong>
              {todayTasks.length}
            </strong>

            <p>
              Total today
            </p>

          </div>


          <div className="analytics-card">

            <strong>
              {completedTasks.length}
            </strong>

            <p>
              Completed
            </p>

          </div>


          <div className="analytics-card">

            <strong>
              {pendingTasks.length}
            </strong>

            <p>
              Pending
            </p>

          </div>

        </div>

      </section>


      {/* ARC PLANNING */}

      <section className="analytics-section">

        <h2>
          🧠 ARC Planning
        </h2>

        <div className="planning-list">

          {
            recommendations.map(
              (item, index) => (

                <div
                  className={`planning-item ${item.priority}`}
                  key={`${item.title}-${index}`}
                >

                  <div>

                    <strong>
                      {item.title}
                    </strong>

                    <p>
                      {item.reason}
                    </p>

                  </div>

                  <span>
                    {item.category}
                  </span>

                </div>

              )
            )
          }

        </div>

      </section>


      {/* WORKLOAD */}

      <section className="analytics-section">

        <h2>
          📦 Current Workload
        </h2>

        <div className="analytics-grid">

          <div className="analytics-card">

            <strong>
              {workload.totalPending}
            </strong>

            <p>
              Pending tasks
            </p>

          </div>


          <div className="analytics-card">

            <strong>
              {workload.high}
            </strong>

            <p>
              High priority
            </p>

          </div>


          <div className="analytics-card">

            <strong>
              {workload.medium}
            </strong>

            <p>
              Medium priority
            </p>

          </div>


          <div className="analytics-card">

            <strong>
              {workload.low}
            </strong>

            <p>
              Low priority
            </p>

          </div>

        </div>

      </section>


      {/* EXAM PLANNER */}

      <section className="analytics-section">

        <h2>
          📝 Exam Planner
        </h2>

        {
          exams.length === 0 ? (

            <div className="card">

              <p>
                No exam dates have been added yet.
                Add them from the Exams page.
              </p>

            </div>

          ) : (

            <div className="planning-list">

              {
                exams.map(exam => (

                  <div
                    className={`planning-item ${exam.risk}`}
                    key={exam.id}
                  >

                    <div>

                      <strong>
                        {exam.name}
                      </strong>

                      <p>
                        {exam.date}
                      </p>

                      <p>
                        {exam.daysLeft} day{
                          exam.daysLeft === 1
                            ? ''
                            : 's'
                        } remaining • {exam.progress}% progress
                      </p>

                      <small>
                        {exam.message}
                      </small>

                    </div>

                    <span>
                      {exam.risk.toUpperCase()}
                    </span>

                  </div>

                ))
              }

            </div>

          )
        }

      </section>


      {/* ADD TASK */}

      <section className="analytics-section">

        <h2>
          ➕ Add Task
        </h2>

        <form
          className="task-form"
          onSubmit={handleAddTask}
        >

          <input
            type="text"
            value={title}
            onChange={
              event =>
                setTitle(event.target.value)
            }
            placeholder="Task title"
          />


          <select
            value={category}
            onChange={
              event =>
                setCategory(
                  event.target.value as TaskCategory
                )
            }
          >

            <option value="academic">
              Academic
            </option>

            <option value="coding">
              Coding
            </option>

            <option value="project">
              Project
            </option>

            <option value="personal">
              Personal
            </option>

          </select>


          <select
            value={priority}
            onChange={
              event =>
                setPriority(
                  event.target.value as TaskPriority
                )
            }
          >

            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>

          </select>


          <button type="submit">
            Add Task
          </button>

        </form>

      </section>


      {/* TODAY'S EXECUTION */}

      <section className="analytics-section">

        <h2>
          ⚡ Today's Execution
        </h2>

        {
          todayTasks.length === 0 ? (

            <div className="card">

              <p>
                No tasks for today. Add your first task above.
              </p>

            </div>

          ) : (

            <div className="task-list">

              {
                todayTasks.map(task => (

                  <div
                    className={`task-row ${
                      task.completed
                        ? 'completed'
                        : ''
                    }`}
                    key={task.id}
                  >

                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        handleToggle(task.id)
                      }
                    />


                    <div className="task-main">

                      <strong>
                        {task.title}
                      </strong>

                      <p>
                        {task.category} • {task.priority}
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(task.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                ))
              }

            </div>

          )
        }

      </section>

    </div>

  )

}


export default CommandCenter