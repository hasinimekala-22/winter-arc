import { useEffect, useState } from 'react'

import {
  type AutoCADEEntry,
  getAutoCADEEntries,
  addAutoCADEEntry,
  deleteAutoCADEEntry
} from '../services/learningEngine'

import {
  listenForWinterArcRefresh,
  listenForCrossTabRefresh
} from '../services/refreshEngine'

function AutoCAD() {
  const [entries, setEntries] = useState<AutoCADEEntry[]>(
    getAutoCADEEntries()
  )

  const [topic, setTopic] = useState('')
  const [commands, setCommands] = useState('')
  const [practice, setPractice] = useState('')
  const [timeSpent, setTimeSpent] = useState('')
  const [confidence, setConfidence] = useState('3')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const reload = () => {
      setEntries(getAutoCADEEntries())
    }

    const stopRefresh = listenForWinterArcRefresh(reload)
    const stopCrossTab = listenForCrossTabRefresh(reload)

    return () => {
      stopRefresh()
      stopCrossTab()
    }
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const todayEntries = entries.filter(
    (entry) => entry.date === today
  )

  const totalTime = entries.reduce(
    (sum, entry) => sum + entry.timeSpent,
    0
  )

  const averageConfidence =
    entries.length > 0
      ? (
          entries.reduce(
            (sum, entry) => sum + entry.confidence,
            0
          ) / entries.length
        ).toFixed(1)
      : '0.0'

  const addEntry = () => {
    if (!topic.trim()) {
      alert('Enter what you learned.')
      return
    }

    const timeNumber = Number(timeSpent)
    const confidenceNumber = Number(confidence)

    if (
      !Number.isFinite(timeNumber) ||
      timeNumber < 0
    ) {
      alert('Enter valid time spent.')
      return
    }

    if (
      !Number.isFinite(confidenceNumber) ||
      confidenceNumber < 1 ||
      confidenceNumber > 5
    ) {
      alert('Confidence must be between 1 and 5.')
      return
    }

    const newEntry: AutoCADEEntry = {
      id: Date.now().toString(),
      date: today,
      topic: topic.trim(),
      commands: commands.trim(),
      practice: practice.trim(),
      timeSpent: timeNumber,
      confidence: confidenceNumber,
      notes: notes.trim()
    }

    addAutoCADEEntry(newEntry)

    setEntries(getAutoCADEEntries())

    setTopic('')
    setCommands('')
    setPractice('')
    setTimeSpent('')
    setConfidence('3')
    setNotes('')
  }

  const deleteEntry = (id: string) => {
    deleteAutoCADEEntry(id)
    setEntries(getAutoCADEEntries())
  }

  return (
    <div className="page autocad-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>📐 AutoCAD</h1>

          <p>
            Build CAD skills through consistent learning,
            command practice and drawing work.
          </p>
        </div>
      </div>


      {/* OVERVIEW */}

      <div className="stats-grid">

        <div className="stat-card">
          <span className="stat-label">
            Confidence
          </span>

          <strong className="autocad-stat-number">
            {averageConfidence}/5
          </strong>
        </div>


        <div className="stat-card">
          <span className="stat-label">
            Sessions
          </span>

          <strong className="autocad-stat-number">
            {entries.length}
          </strong>
        </div>


        <div className="stat-card">
          <span className="stat-label">
            Minutes
          </span>

          <strong className="autocad-stat-number">
            {totalTime}
          </strong>
        </div>


        <div className="stat-card">
          <span className="stat-label">
            Today
          </span>

          <strong className="autocad-stat-number">
            {todayEntries.length}
          </strong>
        </div>

      </div>


      {/* TODAY'S CAD PRACTICE */}

      <section className="content-section">

        <div className="section-header">
          <div>

            <h2>
              Today's CAD Log
            </h2>

            <p>
              Record what you actually learned and
              practised today.
            </p>

          </div>
        </div>


        <div className="form-grid">

          {/* TOPIC */}

          <div className="form-group">

            <label>
              What did you learn?
            </label>

            <input
              type="text"
              value={topic}
              onChange={(e) =>
                setTopic(e.target.value)
              }
              placeholder="Example: 2D Drawing"
            />

          </div>


          {/* TIME */}

          <div className="form-group">

            <label>
              Time Spent (minutes)
            </label>

            <input
              type="number"
              min="0"
              value={timeSpent}
              onChange={(e) =>
                setTimeSpent(e.target.value)
              }
              placeholder="60"
            />

          </div>


          {/* CONFIDENCE */}

          <div className="form-group">

            <label>
              Confidence
            </label>

            <select
              value={confidence}
              onChange={(e) =>
                setConfidence(e.target.value)
              }
            >

              <option value="1">
                1 - Very Low
              </option>

              <option value="2">
                2 - Low
              </option>

              <option value="3">
                3 - Average
              </option>

              <option value="4">
                4 - Good
              </option>

              <option value="5">
                5 - Excellent
              </option>

            </select>

          </div>


          {/* COMMANDS */}

          <div className="form-group">

            <label>
              Commands Learned
            </label>

            <input
              type="text"
              value={commands}
              onChange={(e) =>
                setCommands(e.target.value)
              }
              placeholder="LINE, OFFSET, TRIM, FILLET"
            />

          </div>


          {/* PRACTICE */}

          <div className="form-group form-group-wide">

            <label>
              Drawing / Practice
            </label>

            <textarea
              value={practice}
              onChange={(e) =>
                setPractice(e.target.value)
              }
              placeholder="Describe what you practised..."
              rows={3}
            />

          </div>


          {/* NOTES */}

          <div className="form-group form-group-wide">

            <label>
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Mistakes, doubts, things to practise..."
              rows={3}
            />

          </div>

        </div>


        <button
          type="button"
          className="primary-button"
          onClick={addEntry}
        >
          Record CAD Practice
        </button>

      </section>


      {/* LEARNING HISTORY */}

      <section className="content-section">

        <div className="section-header">

          <div>

            <h2>
              CAD Learning History
            </h2>

            <p>
              Your actual AutoCAD learning history is
              stored locally in Winter ARC.
            </p>

          </div>

        </div>


        {entries.length === 0 ? (

          <div className="empty-state">

            <h3>
              No AutoCAD practice recorded yet.
            </h3>

            <p>
              Complete your first CAD session above.
              Your progress will appear here automatically.
            </p>

          </div>

        ) : (

          <div className="learning-history">

            {entries.map((entry) => (

              <div
                key={entry.id}
                className="learning-history-card"
              >

                <div className="learning-history-main">

                  <div>

                    <h3>
                      {entry.topic}
                    </h3>

                    <p className="learning-history-date">
                      {entry.date}
                    </p>

                  </div>


                  <button
                    type="button"
                    className="danger-button"
                    onClick={() =>
                      deleteEntry(entry.id)
                    }
                  >
                    Delete
                  </button>

                </div>


                <div className="learning-mini-stats">

                  <span>
                    {entry.timeSpent} min
                  </span>

                  <span>
                    Confidence {entry.confidence}/5
                  </span>

                  {entry.commands && (
                    <span>
                      {entry.commands}
                    </span>
                  )}

                </div>


                {entry.practice && (

                  <div className="learning-detail-card">

                    <h4>
                      Drawing / Practice
                    </h4>

                    <p>
                      {entry.practice}
                    </p>

                  </div>

                )}


                {entry.notes && (

                  <div className="learning-detail-card">

                    <h4>
                      Notes
                    </h4>

                    <p>
                      {entry.notes}
                    </p>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  )
}

export default AutoCAD