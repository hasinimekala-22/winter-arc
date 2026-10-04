import { useState } from 'react'

import {
  getWinterArcState,
  saveWinterArcState
} from '../services/winterArcState'

import {
  getToday,
  saveTodayRecord
} from '../services/historyEngine'


function Habits() {

  const today =
    getToday()

  const initialState =
    getWinterArcState()


  const [startedToday, setStartedToday] =
    useState(
      initialState.lastStart === today
    )


  const [streak, setStreak] =
    useState(
      initialState.streak
    )


  const [water, setWater] =
    useState(
      initialState.habits.water
    )


  const [sleep, setSleep] =
    useState(
      initialState.habits.sleep
    )


  const [breakfast, setBreakfast] =
    useState(
      initialState.habits.breakfast
    )


  const [lunch, setLunch] =
    useState(
      initialState.habits.lunch
    )


  const [dinner, setDinner] =
    useState(
      initialState.habits.dinner
    )


  const [tablets, setTablets] =
    useState(
      initialState.habits.tablets
    )


  const [familyCall, setFamilyCall] =
    useState(
      initialState.habits.familyCall
    )


  const [thoughts, setThoughts] =
    useState(
      initialState.habits.thoughts
    )


  const saveHabitState = (
    updates: Partial<typeof initialState.habits>
  ) => {

    const state =
      getWinterArcState()

    state.habits = {
      ...state.habits,
      ...updates
    }

    saveWinterArcState(state)

    saveTodayRecord()
  }


  const startToday = () => {

    if (startedToday) {
      return
    }


    const state =
      getWinterArcState()


    const yesterday =
      new Date()

    yesterday.setDate(
      yesterday.getDate() - 1
    )


    const yesterdayString =
      `${yesterday.getFullYear()}-${String(
        yesterday.getMonth() + 1
      ).padStart(2, '0')}-${String(
        yesterday.getDate()
      ).padStart(2, '0')}`


    let newStreak = 1


    /*
     * If yesterday was also started,
     * continue the streak.
     */

    if (
      state.lastStart ===
      yesterdayString
    ) {

      newStreak =
        state.streak + 1

    }


    /*
     * Set the Winter Arc start date
     * only when the arc has never started.
     */

    if (
      !state.arcStartDate
    ) {

      state.arcStartDate =
        today

    }


    /*
     * If an old/stale start date exists
     * but today's streak is continuing,
     * keep the original start date.
     */

    state.lastStart =
      today

    state.streak =
      newStreak


    saveWinterArcState(
      state
    )


    saveTodayRecord()


    setStreak(
      newStreak
    )


    setStartedToday(
      true
    )

  }


  return (
    <>

      <h1>
        🔥 Habits & Wellbeing
      </h1>

      <p>
        Take care of the basics while
        building your Winter Arc.
      </p>


      <section className="habit-card">

        <div className="habit-title">

          <h2>
            🔥 Start Today
          </h2>


          <button
            className="start-button"
            onClick={startToday}
            disabled={startedToday}
          >

            {startedToday
              ? '✓ Started Today'
              : '🚀 I Started'}

          </button>

        </div>


        <p>
          Starting matters more than
          having a perfect day.
        </p>

      </section>


      <section className="habit-grid">

        <div className="habit-item">

          <h3>
            💧 Water
          </h3>

          <strong>
            {water} glasses
          </strong>


          <div className="habit-buttons">

            <button
              onClick={() => {

                const value =
                  Math.max(
                    0,
                    water - 1
                  )

                setWater(value)

                saveHabitState({
                  water: value
                })

              }}
            >
              −
            </button>


            <button
              onClick={() => {

                const value =
                  water + 1

                setWater(value)

                saveHabitState({
                  water: value
                })

              }}
            >
              +
            </button>

          </div>

        </div>


        <div className="habit-item">

          <h3>
            😴 Sleep
          </h3>


          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            placeholder="Hours"
            value={sleep}
            onChange={(e) => {

              const value =
                e.target.value

              setSleep(value)

              saveHabitState({
                sleep: value
              })

            }}
          />


          <p>
            Target: 7–9 hours
          </p>

        </div>


        <div className="habit-item">

          <h3>
            🍳 Breakfast
          </h3>


          <button
            className={
              breakfast
                ? 'habit-done'
                : 'habit-check'
            }
            onClick={() => {

              const value =
                !breakfast

              setBreakfast(value)

              saveHabitState({
                breakfast: value
              })

            }}
          >

            {breakfast
              ? '✓ Done'
              : 'Mark Done'}

          </button>

        </div>


        <div className="habit-item">

          <h3>
            🍛 Lunch
          </h3>


          <button
            className={
              lunch
                ? 'habit-done'
                : 'habit-check'
            }
            onClick={() => {

              const value =
                !lunch

              setLunch(value)

              saveHabitState({
                lunch: value
              })

            }}
          >

            {lunch
              ? '✓ Done'
              : 'Mark Done'}

          </button>

        </div>


        <div className="habit-item">

          <h3>
            🍽️ Dinner
          </h3>


          <button
            className={
              dinner
                ? 'habit-done'
                : 'habit-check'
            }
            onClick={() => {

              const value =
                !dinner

              setDinner(value)

              saveHabitState({
                dinner: value
              })

            }}
          >

            {dinner
              ? '✓ Done'
              : 'Mark Done'}

          </button>

        </div>


        <div className="habit-item">

          <h3>
            💊 Tablets
          </h3>


          <button
            className={
              tablets
                ? 'habit-done'
                : 'habit-check'
            }
            onClick={() => {

              const value =
                !tablets

              setTablets(value)

              saveHabitState({
                tablets: value
              })

            }}
          >

            {tablets
              ? '✓ Taken'
              : 'Mark Taken'}

          </button>

        </div>


        <div className="habit-item">

          <h3>
            📞 Family
          </h3>


          <button
            className={
              familyCall
                ? 'habit-done'
                : 'habit-check'
            }
            onClick={() => {

              const value =
                !familyCall

              setFamilyCall(value)

              saveHabitState({
                familyCall: value
              })

            }}
          >

            {familyCall
              ? '✓ Called'
              : 'Mark Called'}

          </button>

        </div>

      </section>


      <section className="journal-card">

        <h2>
          📔 Today's Thoughts
        </h2>


        <textarea
          placeholder="What are you thinking about today?"
          value={thoughts}
          onChange={(e) => {

            const value =
              e.target.value

            setThoughts(value)

            saveHabitState({
              thoughts: value
            })

          }}
        />

      </section>


      <section className="habit-stats">

        <div className="card">

          <h3>
            🔥 Start Streak
          </h3>


          <strong>
            {streak}
          </strong>


          <p>
            consecutive days started
          </p>

        </div>


        <div className="card">

          <h3>
            🌱 Today's Care
          </h3>


          <strong>
            {
              [
                breakfast,
                lunch,
                dinner,
                tablets,
                familyCall
              ].filter(Boolean).length
            } / 5
          </strong>


          <p>
            daily habits completed
          </p>

        </div>

      </section>

    </>
  )
}


export default Habits