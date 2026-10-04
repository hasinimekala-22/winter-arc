import {
  useEffect,
  useState
} from 'react'

import {
  getWinterArcState
} from '../services/winterArcState'

import {
  getDailyHistory
} from '../services/historyEngine'

import {
  getAcademicProgress,
  getArcPriority,
  getNextTask,
  getLearningPriority
} from '../services/arcEngine'

import {
  getCurrentSchedule
} from '../services/timeEngine'

import {
  getWeeklyReview
} from '../services/weeklyReviewEngine'

import {
  getLearningSummary
} from '../services/learningEngine'

import {
  listenForWinterArcRefresh,
  listenForCrossTabRefresh
} from '../services/refreshEngine'


type ArcInsight = {
  type: string
  title: string
  message: string
}


type StudyRecommendation = {
  type: string
  title: string
  reason: string
  action: string
  duration: number
  topic: string | null
}


function Arc() {

  const [, setRefresh] =
    useState(0)

  const [insight, setInsight] =
    useState<ArcInsight>({
      type: 'status',
      title: 'ARC is watching',
      message:
        'Use the controls below when you need direction.'
    })


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

    const timer =
      window.setInterval(
        refreshPage,
        30000
      )

    return () => {
      removeLocal()
      removeCrossTab()
      window.clearInterval(timer)
    }

  }, [])


  const state =
    getWinterArcState()

  const history =
    getDailyHistory()

  const academicProgress =
    getAcademicProgress()

  const currentSchedule =
    getCurrentSchedule()

  const nextTask =
    getNextTask()

  const learning =
    getLearningSummary()

  const learningPriority =
    getLearningPriority()


  const mealsToday =
    [
      state.habits.breakfast,
      state.habits.lunch,
      state.habits.dinner
    ].filter(Boolean).length


  const arcPriority =
    getArcPriority({
      sleep:
        Number(state.habits.sleep) || 0,

      meals:
        mealsToday,

      water:
        state.habits.water,

      streak:
        state.streak
    })


  const weeklyReview =
    getWeeklyReview()


  /* ========================================
     STUDY DECISION ENGINE
     ======================================== */

  function getStudyRecommendation():
    StudyRecommendation {

    /*
     * 1. ARC already knows about urgent
     *    health/exam/task priorities.
     *
     *    These should override normal learning.
     */

    if (
      arcPriority.type === 'exam'
    ) {

      return {
        type: 'exam',
        title:
          arcPriority.title,
        reason:
          arcPriority.message,
        action:
          'Make exam preparation your main academic session today.',
        duration: 60,
        topic:
          null
      }

    }


    if (
      arcPriority.type === 'task' &&
      nextTask
    ) {

      return {
        type: 'task',
        title:
          `Complete: ${nextTask.title}`,
        reason:
          'You have a high-priority pending task that should be handled before starting another learning session.',
        action:
          `Open "${nextTask.title}" and work on it without switching tasks.`,
        duration: 45,
        topic:
          null
      }

    }


    /*
     * 2. Find the weakest academic subject.
     */

    const weakestSubject =
      [...academicProgress]
        .sort(
          (a, b) =>
            a.percentage -
            b.percentage
        )[0]


    if (
      weakestSubject &&
      weakestSubject.percentage < 40
    ) {

      return {
        type: 'academic',
        title:
          `Study ${weakestSubject.name}`,
        reason:
          `${weakestSubject.name} has only ${weakestSubject.percentage}% recorded unit progress, making it your weakest academic area.`,
        action:
          `Complete one focused ${weakestSubject.name} study session and update the relevant unit progress.`,
        duration: 60,
        topic:
          weakestSubject.name
      }

    }


    /*
     * 3. Find weak aptitude performance.
     */

    const aptitudeTopics =
      learning.aptitude.topicPerformance

    const weakAptitudeTopic =
      [...aptitudeTopics]
        .filter(
          topic =>
            topic.questions >= 3
        )
        .sort(
          (a, b) =>
            a.accuracy -
            b.accuracy
        )[0]


    if (
      learning.aptitude.sessions > 0 &&
      learning.aptitude.accuracy < 70
    ) {

      return {
        type: 'aptitude',
        title:
          weakAptitudeTopic
            ? `Practise ${weakAptitudeTopic.topic}`
            : 'Practise Aptitude',
        reason:
          `Your current aptitude accuracy is ${learning.aptitude.accuracy}%. Accuracy needs improvement before increasing difficulty.`,
        action:
          weakAptitudeTopic
            ? `Review ${weakAptitudeTopic.topic} mistakes and solve 10 new questions.`
            : 'Review your recent mistakes and solve 10 aptitude questions.',
        duration: 30,
        topic:
          weakAptitudeTopic?.topic || null
      }

    }


    /*
     * 4. If aptitude has never been started,
     *    start it.
     */

    if (
      learning.aptitude.sessions === 0
    ) {

      return {
        type: 'aptitude',
        title:
          'Start Aptitude',
        reason:
          'No aptitude practice has been recorded yet.',
        action:
          'Start with one basic topic and solve at least 10 questions.',
        duration: 30,
        topic:
          null
      }

    }


    /*
     * 5. AutoCAD confidence check.
     */

    const weakAutoCADTopic =
      [...learning.autocad.topicPerformance]
        .sort(
          (a, b) =>
            a.confidence -
            b.confidence
        )[0]


    if (
      learning.autocad.sessions > 0 &&
      learning.autocad.averageConfidence < 3
    ) {

      return {
        type: 'autocad',
        title:
          weakAutoCADTopic
            ? `Practise ${weakAutoCADTopic.topic}`
            : 'Practise AutoCAD',
        reason:
          `Your average AutoCAD confidence is ${learning.autocad.averageConfidence}/5.`,
        action:
          weakAutoCADTopic
            ? `Repeat a guided ${weakAutoCADTopic.topic} drawing and practise the commands you find difficult.`
            : 'Complete one guided drawing and practise the commands you find difficult.',
        duration: 45,
        topic:
          weakAutoCADTopic?.topic || null
      }

    }


    /*
     * 6. AutoCAD has never been started.
     */

    if (
      learning.autocad.sessions === 0
    ) {

      return {
        type: 'autocad',
        title:
          'Start AutoCAD Practice',
        reason:
          'No AutoCAD practice has been recorded yet.',
        action:
          'Complete one beginner drawing and record the commands you used.',
        duration: 45,
        topic:
          null
      }

    }


    /*
     * 7. Academic progress is healthy.
     *    Continue with the weakest remaining
     *    academic subject.
     */

    if (
      weakestSubject
    ) {

      return {
        type: 'academic',
        title:
          `Continue ${weakestSubject.name}`,
        reason:
          `${weakestSubject.name} is currently your lowest-progress academic subject.`,
        action:
          `Spend one focused session improving ${weakestSubject.name}.`,
        duration: 45,
        topic:
          weakestSubject.name
      }

    }


    /*
     * 8. Final fallback.
     */

    return {
      type: 'maintenance',
      title:
        'Continue your planned work',
      reason:
        'No major weakness has been detected from your current data.',
      action:
        'Follow your planned schedule and complete the next meaningful task.',
      duration: 45,
      topic:
        null
    }

  }


  const studyRecommendation =
    getStudyRecommendation()


  /* ========================================
     ARC BUTTON ACTIONS
     ======================================== */

  function handlePush() {

    const recommendation =
      getStudyRecommendation()

    setInsight({
      type:
        recommendation.type,

      title:
        recommendation.title,

      message:
        `${recommendation.action} Recommended focus: ${recommendation.duration} minutes.`
    })

  }


  function handleTired() {

    const sleep =
      Number(state.habits.sleep) || 0

    if (
      sleep > 0 &&
      sleep < 6
    ) {

      setInsight({
        type: 'health',

        title:
          'Protect your energy.',

        message:
          `You recorded ${sleep} hours of sleep. Do not try to compensate by pushing late into the night.`
      })

      return

    }


    const recommendation =
      getStudyRecommendation()


    setInsight({
      type: 'health',

      title:
        'Reduce the load, not the standard.',

      message:
        `Do one focused ${Math.min(
          recommendation.duration,
          30
        )}-minute session on ${recommendation.title}, then take a proper break.`
    })

  }


  function handleStudy() {

    const recommendation =
      getStudyRecommendation()


    setInsight({
      type:
        recommendation.type,

      title:
        recommendation.title,

      message:
        `${recommendation.reason} ${recommendation.action} Recommended time: ${recommendation.duration} minutes.`
    })

  }


  function handleProcrastinating() {

    const recommendation =
      getStudyRecommendation()

    setInsight({
      type:
        'discipline',

      title:
        'Stop planning. Start this.',

      message:
        `${recommendation.action} Set a ${Math.min(
          5,
          recommendation.duration
        )}-minute starting timer and begin immediately.`
    })

  }


  function handleWeeklyReview() {

    setInsight({
      type:
        'review',

      title:
        'Your weekly review',

      message:
        `${weeklyReview.daysStarted} of ${weeklyReview.daysRecorded} recorded days were started. Task completion is ${weeklyReview.taskCompletionRate}%, and academic progress is ${weeklyReview.academicPercentage}%.`
    })

  }


  function handleShutdown() {

    setInsight({
      type:
        'shutdown',

      title:
        'Shutdown mode.',

      message:
        'Finish the current small task, prepare tomorrow, close unnecessary tabs, and protect your sleep.'
    })

  }


  function handleReset() {

    setInsight({
      type:
        'reset',

      title:
        'ARC reset.',

      message:
        'ARC has returned to its neutral state. Your saved academic, habit, task, and history data remain unchanged.'
    })

  }


  return (

    <div className="arc-page">

      <h1>🤖 ARC</h1>

      <p className="page-subtitle">
        Accountability • Reflection • Control
      </p>


      {/* =====================================
          ARC HERO
          ===================================== */}

      <section className="arc-hero">

        <div>

          <span className="arc-hero-label">
            ACCOUNTABILITY • REFLECTION • CONTROL
          </span>

          <h2>
            Your personal Winter ARC controller.
          </h2>

          <p>
            ARC reads your academic progress,
            habits, tasks, learning and consistency
            to help you decide what deserves your attention.
          </p>

        </div>

        <div className="arc-hero-status">

          <span>
            STATUS
          </span>

          <strong>
            ACTIVE
          </strong>

        </div>

      </section>


      {/* =====================================
          CURRENT INSIGHT
          ===================================== */}

      <section className="arc-insight-card">

        <div className="arc-section-label">
          🧠 CURRENT INSIGHT
        </div>

        <div className="arc-insight-content">

          <span className="arc-insight-type">
            {insight.type.toUpperCase()}
          </span>

          <h2>
            {insight.title}
          </h2>

          <p>
            {insight.message}
          </p>

        </div>

      </section>


      {/* =====================================
          TALK TO ARC
          ===================================== */}

      <section className="arc-section">

        <div className="arc-section-heading">

          <div>

            <h2>
              🎛️ Talk to ARC
            </h2>

            <p>
              Choose what you need right now.
            </p>

          </div>

        </div>


        <div className="arc-options">

          <button
            type="button"
            onClick={handlePush}
          >
            <span>🚀</span>
            <strong>PUSH ME</strong>
            <small>
              Give me a direct action
            </small>
          </button>


          <button
            type="button"
            onClick={handleTired}
          >
            <span>😴</span>
            <strong>I'M TIRED</strong>
            <small>
              Help me reduce the load
            </small>
          </button>


          <button
            type="button"
            onClick={handleStudy}
          >
            <span>📚</span>
            <strong>
              WHAT SHOULD I STUDY?
            </strong>
            <small>
              Let ARC decide from your data
            </small>
          </button>


          <button
            type="button"
            onClick={handleProcrastinating}
          >
            <span>⏳</span>
            <strong>
              I'M PROCRASTINATING
            </strong>
            <small>
              Get me started
            </small>
          </button>


          <button
            type="button"
            onClick={handleWeeklyReview}
          >
            <span>📊</span>
            <strong>
              REVIEW MY WEEK
            </strong>
            <small>
              Show my recent performance
            </small>
          </button>


          <button
            type="button"
            onClick={handleShutdown}
          >
            <span>🌙</span>
            <strong>
              SHUTDOWN
            </strong>
            <small>
              Prepare to end the day
            </small>
          </button>


          <button
            type="button"
            onClick={handleReset}
          >
            <span>🧠</span>
            <strong>
              RESET ARC
            </strong>
            <small>
              Return to neutral insight
            </small>
          </button>

        </div>

      </section>


      {/* =====================================
          ARC PRIORITY
          ===================================== */}

      <section className="arc-priority-card">

        <div className="arc-section-label">
          🎯 CURRENT ARC PRIORITY
        </div>

        <span className="arc-priority-type">
          {arcPriority.type.toUpperCase()}
        </span>

        <h2>
          {arcPriority.title}
        </h2>

        <p>
          {arcPriority.message}
        </p>

      </section>


      {/* =====================================
          SMART STUDY RECOMMENDATION
          ===================================== */}

      <section className="arc-section">

        <div className="arc-section-heading">

          <div>

            <h2>
              🎯 Smart Study Recommendation
            </h2>

            <p>
              ARC's current decision based on your
              actual academic and learning data.
            </p>

          </div>

        </div>


        <div className="arc-smart-study-card">

          <div className="arc-smart-study-header">

            <div>

              <span className="arc-smart-study-type">
                {studyRecommendation.type.toUpperCase()}
              </span>

              <h2>
                {studyRecommendation.title}
              </h2>

            </div>

            <div className="arc-study-duration">

              <strong>
                {studyRecommendation.duration}
              </strong>

              <span>
                minutes
              </span>

            </div>

          </div>


          <div className="arc-smart-study-block">

            <span>
              WHY ARC CHOSE THIS
            </span>

            <p>
              {studyRecommendation.reason}
            </p>

          </div>


          <div className="arc-smart-study-block">

            <span>
              YOUR ACTION
            </span>

            <p>
              {studyRecommendation.action}
            </p>

          </div>


          {
            studyRecommendation.topic && (

              <div className="arc-learning-focus">

                <strong>
                  Focus topic
                </strong>

                <span>
                  {studyRecommendation.topic}
                </span>

              </div>

            )
          }

        </div>

      </section>


      {/* =====================================
          LEARNING INTELLIGENCE
          ===================================== */}

      <section className="arc-section arc-learning-section">

        <div className="arc-section-heading">

          <div>

            <h2>
              🧠 Learning Intelligence
            </h2>

            <p>
              ARC is monitoring your aptitude
              and AutoCAD practice.
            </p>

          </div>

        </div>


        <div className="arc-learning-grid">

          {/* APTITUDE */}

          <div className="arc-learning-card">

            <div className="arc-learning-card-header">

              <div>

                <span className="arc-learning-icon">
                  🧠
                </span>

                <h3>
                  Aptitude
                </h3>

              </div>

              <span
                className={
                  learning.aptitude.sessions > 0
                    ? 'arc-learning-status active'
                    : 'arc-learning-status empty'
                }
              >
                {
                  learning.aptitude.sessions > 0
                    ? 'ACTIVE'
                    : 'NO DATA'
                }
              </span>

            </div>


            <div className="arc-learning-metrics">

              <div>
                <strong>
                  {learning.aptitude.sessions}
                </strong>

                <span>
                  Sessions
                </span>
              </div>


              <div>
                <strong>
                  {learning.aptitude.questions}
                </strong>

                <span>
                  Questions
                </span>
              </div>


              <div>
                <strong>
                  {learning.aptitude.accuracy}%
                </strong>

                <span>
                  Accuracy
                </span>
              </div>


              <div>
                <strong>
                  {learning.aptitude.time}
                </strong>

                <span>
                  Minutes
                </span>
              </div>

            </div>


            <div className="arc-learning-message">

              {
                learning.aptitude.sessions === 0
                  ? 'Start your first aptitude session.'
                  : learning.aptitude.accuracy < 70
                    ? 'Accuracy needs attention. Review mistakes before increasing difficulty.'
                    : 'Aptitude practice is progressing well. Keep the consistency.'
              }

            </div>


            {learning.aptitude.topics.length > 0 && (

              <div className="arc-learning-topics">

                <span>
                  Topics
                </span>

                <p>
                  {learning.aptitude.topics.join(' • ')}
                </p>

              </div>

            )}

          </div>


          {/* AUTOCAD */}

          <div className="arc-learning-card">

            <div className="arc-learning-card-header">

              <div>

                <span className="arc-learning-icon">
                  📐
                </span>

                <h3>
                  AutoCAD
                </h3>

              </div>

              <span
                className={
                  learning.autocad.sessions > 0
                    ? 'arc-learning-status active'
                    : 'arc-learning-status empty'
                }
              >
                {
                  learning.autocad.sessions > 0
                    ? 'ACTIVE'
                    : 'NO DATA'
                }
              </span>

            </div>


            <div className="arc-learning-metrics">

              <div>
                <strong>
                  {learning.autocad.sessions}
                </strong>

                <span>
                  Sessions
                </span>
              </div>


              <div>
                <strong>
                  {learning.autocad.averageConfidence}
                </strong>

                <span>
                  Confidence
                </span>
              </div>


              <div>
                <strong>
                  {learning.autocad.time}
                </strong>

                <span>
                  Minutes
                </span>
              </div>


              <div>
                <strong>
                  {learning.autocad.practiceSessions}
                </strong>

                <span>
                  Practice
                </span>
              </div>

            </div>


            <div className="arc-learning-message">

              {
                learning.autocad.sessions === 0
                  ? 'Start your first AutoCAD practice session.'
                  : learning.autocad.averageConfidence < 3
                    ? 'Confidence is low. Complete another guided drawing practice.'
                    : 'AutoCAD practice is progressing well. Keep building.'
              }

            </div>


            {learning.autocad.topics.length > 0 && (

              <div className="arc-learning-topics">

                <span>
                  Topics
                </span>

                <p>
                  {learning.autocad.topics.join(' • ')}
                </p>

              </div>

            )}

          </div>

        </div>


        {/* ARC LEARNING RECOMMENDATION */}

        <div className="arc-learning-recommendation">

          <span>
            🎯 ARC LEARNING RECOMMENDATION
          </span>

          <h3>
            {learningPriority.title}
          </h3>

          <p>
            {learningPriority.message}
          </p>

          {learningPriority.topic && (

            <div className="arc-learning-focus">

              <strong>
                Focus topic
              </strong>

              <span>
                {learningPriority.topic}
              </span>

            </div>

          )}

        </div>

      </section>


      {/* =====================================
          TODAY STATUS
          ===================================== */}

      <section className="arc-section">

        <div className="arc-section-heading">

          <div>

            <h2>
              📅 Today's Status
            </h2>

            <p>
              A quick snapshot of your current
              Winter ARC state.
            </p>

          </div>

        </div>


        <div className="arc-status-grid">

          <div className="arc-status-card">
            <span>🔥</span>
            <strong>{state.streak}</strong>
            <small>Current streak</small>
          </div>


          <div className="arc-status-card">
            <span>💧</span>
            <strong>{state.habits.water}</strong>
            <small>Glasses of water</small>
          </div>


          <div className="arc-status-card">
            <span>😴</span>
            <strong>
              {state.habits.sleep || '—'}
            </strong>
            <small>Sleep hours</small>
          </div>


          <div className="arc-status-card">
            <span>🍽️</span>
            <strong>
              {mealsToday}/3
            </strong>
            <small>Meals logged</small>
          </div>


          <div className="arc-status-card">
            <span>📅</span>
            <strong>
              {history.length}
            </strong>
            <small>Days recorded</small>
          </div>


          <div className="arc-status-card">
            <span>📈</span>
            <strong>
              {weeklyReview.consistency}%
            </strong>
            <small>Recent consistency</small>
          </div>

        </div>

      </section>


      {/* =====================================
          ACADEMIC FOCUS
          ===================================== */}

      <section className="arc-section">

        <div className="arc-section-heading">

          <div>

            <h2>
              🎓 Academic Focus
            </h2>

            <p>
              Your current recorded progress
              across subjects.
            </p>

          </div>

        </div>


        <div className="arc-academic-grid">

          {
            academicProgress.map(
              subject => (

                <div
                  className="arc-academic-card"
                  key={subject.id}
                >

                  <div className="arc-academic-top">

                    <h3>
                      {subject.name}
                    </h3>

                    <strong>
                      {subject.percentage}%
                    </strong>

                  </div>

                  <p>
                    Recorded unit progress
                  </p>

                  <div className="progress-bar">

                    <div
                      className="progress-fill"
                      style={{
                        width:
                          `${subject.percentage}%`
                      }}
                    />

                  </div>

                </div>

              )
            )
          }

        </div>

      </section>


      {/* =====================================
          WEEKLY REVIEW
          ===================================== */}

      <section className="arc-section">

        <div className="arc-section-heading">

          <div>

            <h2>
              📊 Weekly ARC Review
            </h2>

            <p>
              What your recent data is saying.
            </p>

          </div>

        </div>


        <div className="arc-review-list">

          <div className="arc-review-item positive">

            <span>✓</span>

            <p>
              <strong>Consistency:</strong>{' '}
              {weeklyReview.daysStarted} of{' '}
              {weeklyReview.daysRecorded}{' '}
              recorded days started.
            </p>

          </div>


          <div className="arc-review-item">

            <span>💧</span>

            <p>
              <strong>Water:</strong>{' '}
              {weeklyReview.averageWater}{' '}
              glasses average.
            </p>

          </div>


          <div className="arc-review-item">

            <span>😴</span>

            <p>
              <strong>Sleep:</strong>{' '}

              {
                weeklyReview.averageSleep > 0
                  ? `${weeklyReview.averageSleep} hours average`
                  : 'No sleep data recorded'
              }.
            </p>

          </div>


          <div className="arc-review-item">

            <span>📝</span>

            <p>
              <strong>Tasks:</strong>{' '}
              {weeklyReview.completedTasks} completed /{' '}
              {weeklyReview.totalTasks} recorded.
            </p>

          </div>


          <div className="arc-review-item">

            <span>🎓</span>

            <p>
              <strong>Academics:</strong>{' '}
              {weeklyReview.completedUnits} of{' '}
              {weeklyReview.totalUnits} units completed.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================
          STRENGTHS
          ===================================== */}

      <section className="arc-section">

        <div className="arc-section-heading">

          <div>

            <h2>
              💪 Strengths
            </h2>

            <p>
              Areas where your recent behaviour
              is moving in the right direction.
            </p>

          </div>

        </div>


        <div className="arc-review-list">

          {
            weeklyReview.strengths.map(
              (strength, index) => (

                <div
                  className="arc-review-item positive"
                  key={index}
                >

                  <span>
                    ✓
                  </span>

                  <p>
                    {strength}
                  </p>

                </div>

              )
            )
          }

        </div>

      </section>


      {/* =====================================
          CONCERNS
          ===================================== */}

      <section className="arc-section">

        <div className="arc-section-heading">

          <div>

            <h2>
              ⚠️ Areas to Watch
            </h2>

            <p>
              Things ARC thinks you should pay
              attention to.
            </p>

          </div>

        </div>


        <div className="arc-review-list">

          {
            weeklyReview.concerns.map(
              (concern, index) => (

                <div
                  className="arc-review-item concern"
                  key={index}
                >

                  <span>
                    !
                  </span>

                  <p>
                    {concern}
                  </p>

                </div>

              )
            )
          }

        </div>

      </section>


      {/* =====================================
          ACTIONS
          ===================================== */}

      <section className="arc-section">

        <div className="arc-section-heading">

          <div>

            <h2>
              🎯 ARC Actions
            </h2>

            <p>
              Concrete actions generated from
              your recent data.
            </p>

          </div>

        </div>


        <div className="arc-review-list">

          {
            weeklyReview.actions.map(
              (action, index) => (

                <div
                  className="arc-review-item action"
                  key={index}
                >

                  <span>
                    {index + 1}
                  </span>

                  <p>
                    {action}
                  </p>

                </div>

              )
            )
          }

        </div>

      </section>


      {/* =====================================
          CURRENT SCHEDULE + NEXT TASK
          ===================================== */}

      <section className="arc-two-column">

        <div className="arc-info-card">

          <div className="arc-section-label">
            ⏰ CURRENT SCHEDULE
          </div>

          {
            currentSchedule ? (

              <>

                <h2>
                  {currentSchedule.title}
                </h2>

                <div className="arc-info-line">

                  <span>
                    Time
                  </span>

                  <strong>
                    {currentSchedule.time}
                  </strong>

                </div>

                <p>
                  {currentSchedule.activity}
                </p>

              </>

            ) : (

              <div className="arc-empty">
                No scheduled activity is active right now.
              </div>

            )
          }

        </div>


        <div className="arc-info-card">

          <div className="arc-section-label">
            📋 NEXT TASK
          </div>

          {
            nextTask ? (

              <>

                <h2>
                  {nextTask.title}
                </h2>

                <div className="arc-task-meta">

                  <span>
                    {nextTask.category}
                  </span>

                  <span>
                    {nextTask.priority}
                  </span>

                </div>

              </>

            ) : (

              <div className="arc-empty">
                No pending task for ARC to recommend.
              </div>

            )
          }

        </div>

      </section>


      {/* =====================================
          ARC SYSTEM STATUS
          ===================================== */}

      <section className="arc-system-card">

        <div className="arc-section-heading">

          <div>

            <h2>
              🤖 ARC System Status
            </h2>

            <p>
              Current health of the accountability
              layer.
            </p>

          </div>

          <span className="arc-active-badge">
            ● ACTIVE
          </span>

        </div>


        <div className="arc-system-list">

          <div>
            <span>
              System
            </span>

            <strong>
              Active
            </strong>
          </div>


          <div>

            <span>
              Data tracking
            </span>

            <strong>
              {history.length > 0
                ? 'Collecting'
                : 'Waiting for data'}
            </strong>

          </div>


          <div>

            <span>
              Academic tracking
            </span>

            <strong>
              {academicProgress.length > 0
                ? 'Active'
                : 'Waiting for syllabus'}
            </strong>

          </div>


          <div>

            <span>
              Learning tracking
            </span>

            <strong>
              {
                learning.aptitude.sessions > 0 ||
                learning.autocad.sessions > 0
                  ? 'Aptitude + AutoCAD active'
                  : 'Waiting for learning data'
              }
            </strong>

          </div>


          <div>

            <span>
              Decision engine
            </span>

            <strong>
              Active
            </strong>

          </div>


          <div>

            <span>
              Task tracking
            </span>

            <strong>
              {nextTask
                ? 'Pending task detected'
                : 'No pending task'}
            </strong>

          </div>

        </div>

      </section>

    </div>

  )

}


export default Arc