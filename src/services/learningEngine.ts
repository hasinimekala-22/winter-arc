import {
  getStoredData,
  setStoredData
} from './storage'

import {
  refreshWinterArc
} from './refreshEngine'


/* =========================================
   TYPES
   ========================================= */

export type AptitudeDifficulty =
  | 'Easy'
  | 'Medium'
  | 'Hard'

export type AptitudeEntry = {
  id: string
  date: string
  topic: string
  learned: string
  attempted: number
  correct: number
  timeSpent: number
  difficulty: AptitudeDifficulty
  notes: string
}

export type AutoCADEEntry = {
  id: string
  date: string
  topic: string
  commands: string
  practice: string
  timeSpent: number
  confidence: number
  notes: string
}


/* =========================================
   STORAGE KEYS
   ========================================= */

const APTITUDE_KEY =
  'winterArcAptitudeEntries'

const AUTOCAD_KEY =
  'winterArcAutoCADEEntries'


/* =========================================
   APTITUDE
   ========================================= */

export function getAptitudeEntries(): AptitudeEntry[] {
  return getStoredData<AptitudeEntry[]>(
    APTITUDE_KEY,
    []
  )
}


export function saveAptitudeEntries(
  entries: AptitudeEntry[]
): void {
  setStoredData(
    APTITUDE_KEY,
    entries
  )

  refreshWinterArc()
}


export function addAptitudeEntry(
  entry: AptitudeEntry
): void {
  const entries =
    getAptitudeEntries()

  entries.unshift(entry)

  saveAptitudeEntries(entries)
}


export function deleteAptitudeEntry(
  id: string
): void {
  const entries =
    getAptitudeEntries()

  const updated =
    entries.filter(
      (entry) => entry.id !== id
    )

  saveAptitudeEntries(updated)
}


/* =========================================
   APTITUDE STATISTICS
   ========================================= */

export function getAptitudeSessions(): number {
  return getAptitudeEntries().length
}


export function getAptitudeQuestions(): number {
  return getAptitudeEntries().reduce(
    (total, entry) =>
      total + entry.attempted,
    0
  )
}


export function getAptitudeCorrect(): number {
  return getAptitudeEntries().reduce(
    (total, entry) =>
      total + entry.correct,
    0
  )
}


export function getAptitudeAccuracy(): number {
  const questions =
    getAptitudeQuestions()

  const correct =
    getAptitudeCorrect()

  if (questions === 0) {
    return 0
  }

  return Math.round(
    (correct / questions) * 100
  )
}


export function getAptitudeTime(): number {
  return getAptitudeEntries().reduce(
    (total, entry) =>
      total + entry.timeSpent,
    0
  )
}


/* =========================================
   TODAY'S APTITUDE
   ========================================= */

export function getTodayAptitudeEntries():
  AptitudeEntry[] {

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  return getAptitudeEntries().filter(
    (entry) =>
      entry.date === today
  )
}


export function getTodayAptitudeQuestions():
  number {

  return getTodayAptitudeEntries().reduce(
    (total, entry) =>
      total + entry.attempted,
    0
  )
}


/* =========================================
   APTITUDE TOPICS
   ========================================= */

export function getAptitudeTopics():
  string[] {

  const entries =
    getAptitudeEntries()

  return Array.from(
    new Set(
      entries.map(
        (entry) => entry.topic
      )
    )
  )
}


export function getAptitudeTopicPerformance() {
  const entries =
    getAptitudeEntries()

  const topics: Record<
    string,
    {
      topic: string
      questions: number
      correct: number
      accuracy: number
      sessions: number
      time: number
    }
  > = {}

  entries.forEach((entry) => {

    if (!topics[entry.topic]) {
      topics[entry.topic] = {
        topic: entry.topic,
        questions: 0,
        correct: 0,
        accuracy: 0,
        sessions: 0,
        time: 0
      }
    }

    topics[entry.topic].questions +=
      entry.attempted

    topics[entry.topic].correct +=
      entry.correct

    topics[entry.topic].sessions += 1

    topics[entry.topic].time +=
      entry.timeSpent
  })

  return Object.values(topics).map(
    (topic) => ({
      ...topic,
      accuracy:
        topic.questions > 0
          ? Math.round(
              (topic.correct /
                topic.questions) *
                100
            )
          : 0
    })
  )
}


/* =========================================
   AUTOCAD
   ========================================= */

export function getAutoCADEEntries():
  AutoCADEEntry[] {

  return getStoredData<AutoCADEEntry[]>(
    AUTOCAD_KEY,
    []
  )
}


export function saveAutoCADEEntries(
  entries: AutoCADEEntry[]
): void {

  setStoredData(
    AUTOCAD_KEY,
    entries
  )

  refreshWinterArc()
}


export function addAutoCADEEntry(
  entry: AutoCADEEntry
): void {

  const entries =
    getAutoCADEEntries()

  entries.unshift(entry)

  saveAutoCADEEntries(entries)
}


export function deleteAutoCADEEntry(
  id: string
): void {

  const entries =
    getAutoCADEEntries()

  const updated =
    entries.filter(
      (entry) => entry.id !== id
    )

  saveAutoCADEEntries(updated)
}


/* =========================================
   AUTOCAD STATISTICS
   ========================================= */

export function getAutoCADSessions():
  number {

  return getAutoCADEEntries().length
}


export function getAutoCADTime():
  number {

  return getAutoCADEEntries().reduce(
    (total, entry) =>
      total + entry.timeSpent,
    0
  )
}


export function getAutoCADAverageConfidence():
  number {

  const entries =
    getAutoCADEEntries()

  if (entries.length === 0) {
    return 0
  }

  const total =
    entries.reduce(
      (sum, entry) =>
        sum + entry.confidence,
      0
    )

  return Number(
    (total / entries.length).toFixed(1)
  )
}


/* =========================================
   TODAY'S AUTOCAD
   ========================================= */

export function getTodayAutoCADEEntries():
  AutoCADEEntry[] {

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  return getAutoCADEEntries().filter(
    (entry) =>
      entry.date === today
  )
}


/* =========================================
   AUTOCAD TOPICS
   ========================================= */

export function getAutoCADTopics():
  string[] {

  return Array.from(
    new Set(
      getAutoCADEEntries().map(
        (entry) => entry.topic
      )
    )
  )
}


export function getAutoCADCommands():
  string[] {

  const commands =
    getAutoCADEEntries()
      .flatMap(
        (entry) =>
          entry.commands
            .split(',')
            .map(
              (command) =>
                command.trim()
            )
            .filter(Boolean)
      )

  return Array.from(
    new Set(commands)
  )
}


export function getAutoCADPracticeSessions():
  number {

  return getAutoCADEEntries().filter(
    (entry) =>
      entry.practice.trim().length > 0
  ).length
}


export function getAutoCADTopicPerformance() {

  const entries =
    getAutoCADEEntries()

  const topics: Record<
    string,
    {
      topic: string
      sessions: number
      time: number
      confidence: number
    }
  > = {}

  entries.forEach((entry) => {

    if (!topics[entry.topic]) {
      topics[entry.topic] = {
        topic: entry.topic,
        sessions: 0,
        time: 0,
        confidence: 0
      }
    }

    topics[entry.topic].sessions += 1

    topics[entry.topic].time +=
      entry.timeSpent

    topics[entry.topic].confidence +=
      entry.confidence
  })

  return Object.values(topics).map(
    (topic) => ({
      ...topic,
      confidence:
        topic.sessions > 0
          ? Number(
              (
                topic.confidence /
                topic.sessions
              ).toFixed(1)
            )
          : 0
    })
  )
}


/* =========================================
   COMPLETE LEARNING SUMMARY
   ========================================= */

export function getLearningSummary() {

  const aptitudeEntries =
    getAptitudeEntries()

  const autocadEntries =
    getAutoCADEEntries()

  return {

    aptitude: {
      sessions:
        aptitudeEntries.length,

      questions:
        getAptitudeQuestions(),

      correct:
        getAptitudeCorrect(),

      accuracy:
        getAptitudeAccuracy(),

      time:
        getAptitudeTime(),

      topics:
        getAptitudeTopics(),

      topicPerformance:
        getAptitudeTopicPerformance(),

      today:
        getTodayAptitudeEntries()
    },

    autocad: {
      sessions:
        autocadEntries.length,

      time:
        getAutoCADTime(),

      averageConfidence:
        getAutoCADAverageConfidence(),

      topics:
        getAutoCADTopics(),

      commands:
        getAutoCADCommands(),

      practiceSessions:
        getAutoCADPracticeSessions(),

      topicPerformance:
        getAutoCADTopicPerformance(),

      today:
        getTodayAutoCADEEntries()
    }

  }
}