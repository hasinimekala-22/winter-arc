import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

function Sidebar() {
  const [showShutdown, setShowShutdown] = useState(false)
  const [shutdownMessage, setShutdownMessage] = useState('')
  const [shutdownConfirmed, setShutdownConfirmed] = useState(false)

  const SHUTDOWN_HOUR = 22
  const SHUTDOWN_MINUTE = 0

  function getShutdownDifference() {
    const now = new Date()

    const currentMinutes =
      now.getHours() * 60 + now.getMinutes()

    const shutdownMinutes =
      SHUTDOWN_HOUR * 60 + SHUTDOWN_MINUTE

    const difference =
      currentMinutes - shutdownMinutes

    return difference
  }

  function handleShutdownClick() {
    const difference = getShutdownDifference()

    if (difference > 0) {
      if (difference === 1) {
        setShutdownMessage(
          'You are 1 minute past your planned shutdown time.'
        )
      } else {
        setShutdownMessage(
          `You are ${difference} minutes past your planned shutdown time.`
        )
      }
    } else if (difference < 0) {
      const earlyMinutes = Math.abs(difference)

      if (earlyMinutes === 1) {
        setShutdownMessage(
          'You are 1 minute early for your planned shutdown.'
        )
      } else {
        setShutdownMessage(
          `You are ${earlyMinutes} minutes early for your planned shutdown.`
        )
      }
    } else {
      setShutdownMessage(
        "It's exactly your planned shutdown time."
      )
    }

    setShowShutdown(true)
  }

  function confirmShutdown() {
    setShutdownConfirmed(true)
  }

  function cancelShutdown() {
    setShowShutdown(false)
  }

  function closeShutdown() {
    setShutdownConfirmed(false)
    setShowShutdown(false)
  }

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeShutdown()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <>
      <aside className="sidebar">

        <h2>
          ❄️ WINTER ARC
        </h2>

        <nav>
          <NavLink to="/">
            🏠 Dashboard
          </NavLink>

          <NavLink to="/academics">
            🎓 Academics
          </NavLink>

          <NavLink to="/exams">
            📝 Exams
          </NavLink>

          <NavLink to="/skills">
            💻 CSE Skills
          </NavLink>

          <NavLink to="/projects">
            🚀 Projects
          </NavLink>

          <NavLink to="/aptitude">
            🧠 Aptitude
          </NavLink>

          <NavLink to="/autocad">
            📐 AutoCAD
          </NavLink>

          <NavLink to="/habits">
            🔥 Habits
          </NavLink>

          <NavLink to="/library">
            📚 Library Mode
          </NavLink>

          <NavLink to="/analytics">
            📊 Analytics
          </NavLink>

          <NavLink to="/arc">
            🤖 ARC
          </NavLink>

          <NavLink to="/command">
            🎯 Command Center
          </NavLink>
        </nav>


        <button
          type="button"
          className="shutdown"
          onClick={handleShutdownClick}
        >
          🌙 Shutdown

          <span>
            10:00 PM
          </span>
        </button>

      </aside>


      {/* SHUTDOWN MODAL */}

      {showShutdown && (

        <div
          className="shutdown-overlay"
          onClick={closeShutdown}
        >

          <div
            className="shutdown-modal"
            onClick={event =>
              event.stopPropagation()
            }
          >

            {!shutdownConfirmed ? (

              <>
                <div className="shutdown-icon">
                  🌙
                </div>

                <span className="shutdown-modal-label">
                  WINTER ARC SHUTDOWN
                </span>

                <h2>
                  Do you want to shutdown?
                </h2>

                <p className="shutdown-timing">
                  {shutdownMessage}
                </p>

                <p className="shutdown-note">
                  Planned shutdown: <strong>10:00 PM</strong>
                </p>

                <div className="shutdown-actions">

                  <button
                    type="button"
                    className="shutdown-cancel"
                    onClick={cancelShutdown}
                  >
                    Not Yet
                  </button>

                  <button
                    type="button"
                    className="shutdown-confirm"
                    onClick={confirmShutdown}
                  >
                    Yes, Shutdown
                  </button>

                </div>
              </>

            ) : (

              <>
                <div className="shutdown-icon">
                  🌙
                </div>

                <span className="shutdown-modal-label">
                  SESSION COMPLETE
                </span>

                <h2>
                  Good work today.
                </h2>

                <p className="shutdown-timing">
                  Winter ARC is shutting down for the day.
                </p>

                <p className="shutdown-note">
                  Close unnecessary tabs, put the phone away,
                  and get proper rest.
                </p>

                <button
                  type="button"
                  className="shutdown-final"
                  onClick={closeShutdown}
                >
                  Close
                </button>
              </>

            )}

          </div>

        </div>

      )}

    </>
  )
}

export default Sidebar