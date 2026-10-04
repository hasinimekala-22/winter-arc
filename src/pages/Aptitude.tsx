import { useEffect, useState } from 'react'

import {
  type AptitudeEntry,
  getAptitudeEntries,
  addAptitudeEntry,
  deleteAptitudeEntry
} from '../services/learningEngine'

import {
  listenForWinterArcRefresh,
  listenForCrossTabRefresh
} from '../services/refreshEngine'

function Aptitude() {
  const [entries, setEntries] = useState<AptitudeEntry[]>(
    getAptitudeEntries()
  )

  const [topic, setTopic] = useState('')
  const [attempted, setAttempted] = useState('')
  const [correct, setCorrect] = useState('')
  const [timeSpent, setTimeSpent] = useState('')
  const [difficulty, setDifficulty] =
    useState<AptitudeEntry['difficulty']>('Medium')
  const [learned, setLearned] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const reload = () => {
      setEntries(getAptitudeEntries())
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

  const totalQuestions = entries.reduce(
    (sum, entry) => sum + entry.attempted,
    0
  )

  const totalCorrect = entries.reduce(
    (sum, entry) => sum + entry.correct,
    0
  )

  const accuracy =
    totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0

  const todayQuestions = todayEntries.reduce(
    (sum, entry) => sum + entry.attempted,
    0
  )

  const addEntry = () => {
    if (!topic.trim()) {
      alert('Enter the aptitude topic.')
      return
    }

    const attemptedNumber = Number(attempted)
    const correctNumber = Number(correct)
    const timeNumber = Number(timeSpent)

    if (
      !Number.isFinite(attemptedNumber) ||
      attemptedNumber < 0
    ) {
      alert('Enter a valid number of questions attempted.')
      return
    }

    if (
      !Number.isFinite(correctNumber) ||
      correctNumber < 0 ||
      correctNumber > attemptedNumber
    ) {
      alert(
        'Correct answers cannot be greater than questions attempted.'
      )
      return
    }

    if (
      !Number.isFinite(timeNumber) ||
      timeNumber < 0
    ) {
      alert('Enter valid time spent.')
      return
    }

    const newEntry: AptitudeEntry = {
      id: Date.now().toString(),
      date: today,
      topic: topic.trim(),
      learned: learned.trim(),
      attempted: attemptedNumber,
      correct: correctNumber,
      timeSpent: timeNumber,
      difficulty,
      notes: notes.trim()
    }

    addAptitudeEntry(newEntry)

    setEntries(getAptitudeEntries())

    setTopic('')
    setAttempted('')
    setCorrect('')
    setTimeSpent('')
    setDifficulty('Medium')
    setLearned('')
    setNotes('')
  }

  const deleteEntry = (id: string) => {
    deleteAptitudeEntry(id)
    setEntries(getAptitudeEntries())
  }

  return (
    <div className="page aptitude-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>🧠 Aptitude</h1>
          <p>
            Build aptitude ability through consistent practice,
            accuracy tracking and topic-wise improvement.
          </p>
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="stats-grid aptitude-stats">
        <div className="stat-card">
          <span className="stat-label">Sessions</span>
          <strong>{entries.length}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Questions</span>
          <strong>{totalQuestions}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Accuracy</span>
          <strong>{accuracy}%</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Today</span>
          <strong>{todayQuestions}</strong>
        </div>
      </div>

      {/* TODAY'S PRACTICE */}
      <section className="content-section aptitude-section">

        <div className="section-header">
          <div>
            <h2>Today's Practice</h2>
            <p>
              Record what you actually practised today.
            </p>
          </div>
        </div>

        <div className="aptitude-form">

          <div className="aptitude-field">
            <label>Topic</label>

            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Example: Percentages"
            />
          </div>

          <div className="aptitude-field">
            <label>Questions Attempted</label>

            <input
              type="number"
              min="0"
              value={attempted}
              onChange={(e) => setAttempted(e.target.value)}
              placeholder="20"
            />
          </div>

          <div className="aptitude-field">
            <label>Correct</label>

            <input
              type="number"
              min="0"
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              placeholder="15"
            />
          </div>

          <div className="aptitude-field">
            <label>Time Spent (minutes)</label>

            <input
              type="number"
              min="0"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder="30"
            />
          </div>

          <div className="aptitude-field">
            <label>Difficulty</label>

            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(
                  e.target.value as AptitudeEntry['difficulty']
                )
              }
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="aptitude-field aptitude-field-full">
            <label>What did you learn?</label>

            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="Concepts, shortcuts or methods learned..."
              rows={3}
            />
          </div>

          <div className="aptitude-field aptitude-field-full">
            <label>Notes</label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mistakes, doubts, things to revise..."
              rows={3}
            />
          </div>

        </div>

        <button
          type="button"
          className="aptitude-record-button"
          onClick={addEntry}
        >
          Record Practice
        </button>

      </section>

      {/* LEARNING HISTORY */}
      <section className="content-section aptitude-section">

        <div className="section-header">
          <div>
            <h2>Learning History</h2>

            <p>
              Your actual aptitude practice history is stored
              locally in Winter ARC.
            </p>
          </div>
        </div>

        {entries.length === 0 ? (

          <div className="aptitude-empty">
            <h3>No aptitude practice recorded yet.</h3>

            <p>
              Complete your first session above.
              Your progress will appear here automatically.
            </p>
          </div>

        ) : (

          <div className="aptitude-history">

            {entries.map((entry) => {

              const entryAccuracy =
                entry.attempted > 0
                  ? Math.round(
                      (entry.correct / entry.attempted) * 100
                    )
                  : 0

              return (
                <div
                  key={entry.id}
                  className="aptitude-history-card"
                >

                  <div className="aptitude-history-header">

                    <div>
                      <h3>{entry.topic}</h3>

                      <p>
                        {entry.date}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="aptitude-delete-button"
                      onClick={() =>
                        deleteEntry(entry.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                  <div className="aptitude-entry-stats">

                    <span>
                      {entry.attempted} questions
                    </span>

                    <span>
                      {entry.correct} correct
                    </span>

                    <span>
                      {entryAccuracy}% accuracy
                    </span>

                    <span>
                      {entry.timeSpent} min
                    </span>

                    <span>
                      {entry.difficulty}
                    </span>

                  </div>

                  {entry.learned && (
                    <div className="aptitude-entry-detail">
                      <h4>What I learned</h4>
                      <p>{entry.learned}</p>
                    </div>
                  )}

                  {entry.notes && (
                    <div className="aptitude-entry-detail">
                      <h4>Notes</h4>
                      <p>{entry.notes}</p>
                    </div>
                  )}

                </div>
              )
            })}

          </div>
        )}

      </section>

    </div>
  )
}

export default Aptitude