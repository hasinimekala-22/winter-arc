import { useState } from 'react'

import {
  getStoredData,
  setStoredData
} from '../services/storage'

import {
  refreshWinterArc
} from '../services/refreshEngine'


type LibraryActivity = {
  id: string
  date: string
  resource: string
  activity: string
  timeSpent: number
}


const LIBRARY_ACTIVITY_KEY =
  'winterArcLibraryActivities'


const suggestedResources = [
  {
    category: 'Java',
    icon: '☕',
    description:
      'Core Java, OOP, collections, exceptions, threads and JDBC.',
    resources: [
      {
        name: 'GeeksforGeeks',
        type: 'Website'
      },
      {
        name: 'Telusko',
        type: 'YouTube'
      },
      {
        name: 'Java Brains',
        type: 'YouTube'
      }
    ]
  },

  {
    category: 'Python',
    icon: '🐍',
    description:
      'Python fundamentals, problem solving, DSA and practical coding.',
    resources: [
      {
        name: 'Programiz',
        type: 'Website'
      },
      {
        name: 'freeCodeCamp',
        type: 'YouTube'
      },
      {
        name: 'Corey Schafer',
        type: 'YouTube'
      }
    ]
  },

  {
    category: 'SQL / DBMS',
    icon: '🗄️',
    description:
      'SQL queries, DBMS concepts, joins, subqueries and database practice.',
    resources: [
      {
        name: 'Oracle Documentation',
        type: 'Website'
      },
      {
        name: 'GeeksforGeeks',
        type: 'Website'
      },
      {
        name: 'Codebasics',
        type: 'YouTube'
      }
    ]
  },

  {
    category: 'OS',
    icon: '⚙️',
    description:
      'Operating systems concepts, processes, scheduling, memory and synchronization.',
    resources: [
      {
        name: 'Neso Academy',
        type: 'YouTube'
      },
      {
        name: 'GeeksforGeeks',
        type: 'Website'
      }
    ]
  },

  {
    category: 'DSA',
    icon: '🧩',
    description:
      'Algorithms, data structures, problem solving and coding practice.',
    resources: [
      {
        name: 'LeetCode',
        type: 'Practice'
      },
      {
        name: 'HackerRank',
        type: 'Practice'
      },
      {
        name: 'NeetCode',
        type: 'YouTube / Website'
      }
    ]
  },

  {
    category: 'Aptitude',
    icon: '🧠',
    description:
      'Quantitative aptitude, logical reasoning and placement preparation.',
    resources: [
      {
        name: 'IndiaBix',
        type: 'Website'
      },
      {
        name: 'GeeksforGeeks',
        type: 'Website'
      },
      {
        name: 'CareerRide',
        type: 'YouTube'
      }
    ]
  },

  {
    category: 'AutoCAD',
    icon: '📐',
    description:
      'AutoCAD commands, 2D drafting, technical drawings and practice.',
    resources: [
      {
        name: 'Autodesk Learning',
        type: 'Website'
      },
      {
        name: 'SourceCAD',
        type: 'YouTube'
      },
      {
        name: 'CAD in Black',
        type: 'YouTube'
      }
    ]
  },

  {
    category: 'Web Development',
    icon: '🌐',
    description:
      'HTML, CSS, JavaScript, React, TypeScript and full-stack development.',
    resources: [
      {
        name: 'MDN Web Docs',
        type: 'Website'
      },
      {
        name: 'freeCodeCamp',
        type: 'Website / YouTube'
      },
      {
        name: 'JavaScript.info',
        type: 'Website'
      }
    ]
  },

  {
    category: 'Git & GitHub',
    icon: '🔀',
    description:
      'Version control, GitHub workflows, branches and portfolio development.',
    resources: [
      {
        name: 'GitHub Docs',
        type: 'Website'
      },
      {
        name: 'Git Documentation',
        type: 'Website'
      },
      {
        name: 'freeCodeCamp',
        type: 'YouTube'
      }
    ]
  }
]


function getToday(): string {

  const today = new Date()

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


function getActivities(): LibraryActivity[] {

  const stored =
    getStoredData<unknown>(
      LIBRARY_ACTIVITY_KEY,
      []
    )

  if (!Array.isArray(stored)) {
    return []
  }

  return stored.filter(
    activity =>
      activity &&
      typeof activity === 'object' &&
      typeof activity.id === 'string' &&
      typeof activity.date === 'string' &&
      typeof activity.resource === 'string' &&
      typeof activity.activity === 'string' &&
      typeof activity.timeSpent === 'number'
  ) as LibraryActivity[]
}


function Library() {

  const [activities, setActivities] =
    useState<LibraryActivity[]>(
      getActivities
    )

  const [resource, setResource] =
    useState('')

  const [activity, setActivity] =
    useState('')

  const [timeSpent, setTimeSpent] =
    useState('')

  const today =
    getToday()


  const todayActivities =
    activities.filter(
      item =>
        item.date === today
    )


  const totalMinutes =
    todayActivities.reduce(
      (total, item) =>
        total + item.timeSpent,
      0
    )


  function handleAddActivity(
    event: React.FormEvent
  ) {

    event.preventDefault()

    const cleanResource =
      resource.trim()

    const cleanActivity =
      activity.trim()

    const minutes =
      Number(timeSpent)


    if (
      !cleanResource ||
      !cleanActivity
    ) {
      alert(
        'Please enter the resource and what you did.'
      )

      return
    }


    if (
      !Number.isFinite(minutes) ||
      minutes <= 0
    ) {
      alert(
        'Please enter valid time spent.'
      )

      return
    }


    const newActivity: LibraryActivity = {

      id:
        `library-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      date: today,

      resource:
        cleanResource,

      activity:
        cleanActivity,

      timeSpent:
        Math.round(minutes)

    }


    const updatedActivities = [
      ...getActivities(),
      newActivity
    ]


    setStoredData(
      LIBRARY_ACTIVITY_KEY,
      updatedActivities
    )


    setActivities(
      updatedActivities
    )


    setResource('')
    setActivity('')
    setTimeSpent('')

    refreshWinterArc()
  }


  function handleDeleteActivity(
    id: string
  ) {

    const updatedActivities =
      getActivities().filter(
        item =>
          item.id !== id
      )


    setStoredData(
      LIBRARY_ACTIVITY_KEY,
      updatedActivities
    )


    setActivities(
      updatedActivities
    )


    refreshWinterArc()
  }


  return (
    <div>

      <h1>
        📚 Library Mode
      </h1>

      <p className="page-subtitle">
        Your personal learning hub — discover
        useful resources, study from them and
        record what you actually accomplished.
      </p>


      {/* HERO */}

      <section className="library-hero">

        <div className="library-hero-content">

          <span>
            WINTER ARC KNOWLEDGE HUB
          </span>

          <h2>
            Don't just collect resources.
            Use them.
          </h2>

          <p>
            Find the right resource for each
            subject, study with purpose and record
            what you actually learned every day.
          </p>

        </div>

        <div className="library-hero-stat">

          <strong>
            {todayActivities.length}
          </strong>

          <span>
            activities today
          </span>

        </div>

      </section>


      {/* DAILY ACTIVITY */}

      <section className="library-activity-section">

        <div className="library-section-heading">

          <div>

            <span>
              DAILY LEARNING LOG
            </span>

            <h2>
              📖 What did you do today?
            </h2>

            <p>
              Record the actual work you completed
              from your library resources.
            </p>

          </div>

          <div className="library-summary">

            <div>
              <strong>
                {todayActivities.length}
              </strong>

              <span>
                Sessions
              </span>
            </div>

            <div>
              <strong>
                {totalMinutes}
              </strong>

              <span>
                Minutes
              </span>
            </div>

          </div>

        </div>


        <form
          className="library-activity-form"
          onSubmit={
            handleAddActivity
          }
        >

          <div className="library-form-grid">

            <div className="library-form-field">

              <label>
                What did you study?
              </label>

              <input
                type="text"
                value={resource}
                onChange={
                  event =>
                    setResource(
                      event.target.value
                    )
                }
                placeholder={
                  'e.g. Python — Loops'
                }
              />

            </div>


            <div className="library-form-field">

              <label>
                Time spent
              </label>

              <input
                type="number"
                min="1"
                max="1440"
                value={timeSpent}
                onChange={
                  event =>
                    setTimeSpent(
                      event.target.value
                    )
                }
                placeholder="Minutes"
              />

            </div>

          </div>


          <div className="library-form-field">

            <label>
              What did you actually do?
            </label>

            <textarea
              value={activity}
              onChange={
                event =>
                  setActivity(
                    event.target.value
                  )
              }
              placeholder={
                'Example: Watched the lecture, made notes and solved 5 practice problems.'
              }
              rows={4}
            />

          </div>


          <button
            type="submit"
            className="library-save-button"
          >
            + Save Learning Activity
          </button>

        </form>


        {/* TODAY'S HISTORY */}

        <div className="library-history">

          <div className="library-history-title">

            <h3>
              Today's Learning
            </h3>

            <span>
              {todayActivities.length} recorded
            </span>

          </div>


          {todayActivities.length === 0 ? (

            <div className="library-empty-log">

              <div>
                📚
              </div>

              <strong>
                No learning activity recorded yet
              </strong>

              <p>
                Start by recording what you studied
                today.
              </p>

            </div>

          ) : (

            <div className="library-log-list">

              {todayActivities
                .slice()
                .reverse()
                .map(item => (

                  <article
                    className="library-log-card"
                    key={item.id}
                  >

                    <div className="library-log-icon">
                      📖
                    </div>

                    <div className="library-log-content">

                      <div className="library-log-top">

                        <h3>
                          {item.resource}
                        </h3>

                        <span>
                          {item.timeSpent} min
                        </span>

                      </div>

                      <p>
                        {item.activity}
                      </p>

                    </div>

                    <button
                      type="button"
                      className="library-delete-button"
                      onClick={() =>
                        handleDeleteActivity(
                          item.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </article>

                ))}

            </div>

          )}

        </div>

      </section>


      {/* SUGGESTED RESOURCES */}

      <section className="library-resources-section">

        <div className="library-section-heading">

          <div>

            <span>
              CURATED LEARNING SOURCES
            </span>

            <h2>
              🌐 Suggested Websites & Channels
            </h2>

            <p>
              Use these as your starting point
              whenever you study each area.
            </p>

          </div>

        </div>


        <div className="library-resource-grid">

          {suggestedResources.map(
            category => (

              <article
                className="library-resource-card"
                key={category.category}
              >

                <div className="library-resource-header">

                  <div className="library-resource-icon">
                    {category.icon}
                  </div>

                  <div>

                    <h3>
                      {category.category}
                    </h3>

                    <p>
                      {category.description}
                    </p>

                  </div>

                </div>


                <div className="library-resource-list">

                  {category.resources.map(
                    resource => (

                      <div
                        className="library-resource-item"
                        key={
                          `${category.category}-${resource.name}`
                        }
                      >

                        <span>
                          {resource.name}
                        </span>

                        <small>
                          {resource.type}
                        </small>

                      </div>

                    )
                  )}

                </div>

              </article>

            )
          )}

        </div>

      </section>


      {/* HOW TO USE */}

      <section className="library-how-section">

        <div>

          <span>
            HOW TO USE LIBRARY MODE
          </span>

          <h2>
            Learn → Practise → Record
          </h2>

          <p>
            The goal is not to collect hundreds
            of resources. Pick one useful source,
            actually study from it and record the
            work you completed.
          </p>

        </div>


        <div className="library-flow">

          <div>
            <strong>
              01
            </strong>

            <span>
              Choose a resource
            </span>
          </div>

          <div>
            <strong>
              02
            </strong>

            <span>
              Study / practise
            </span>
          </div>

          <div>
            <strong>
              03
            </strong>

            <span>
              Record your work
            </span>
          </div>

          <div>
            <strong>
              04
            </strong>

            <span>
              Build your history
            </span>
          </div>

        </div>

      </section>

    </div>
  )
}


export default Library