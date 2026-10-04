import { schedule } from '../data/schedule'

export function getCurrentSchedule() {
  const now = new Date()

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes()

  for (const item of schedule) {
    const times = item.time.match(
      /(\d+):(\d+)\s*(AM|PM)\s*–\s*(\d+):(\d+)\s*(AM|PM)/
    )

    if (!times) {
      continue
    }

    let startHour = Number(times[1])
    const startMinute = Number(times[2])
    const startPeriod = times[3]

    let endHour = Number(times[4])
    const endMinute = Number(times[5])
    const endPeriod = times[6]

    if (startPeriod === 'PM' && startHour !== 12) {
      startHour += 12
    }

    if (startPeriod === 'AM' && startHour === 12) {
      startHour = 0
    }

    if (endPeriod === 'PM' && endHour !== 12) {
      endHour += 12
    }

    if (endPeriod === 'AM' && endHour === 12) {
      endHour = 0
    }

    const start =
      startHour * 60 + startMinute

    const end =
      endHour * 60 + endMinute

    if (
      currentMinutes >= start &&
      currentMinutes < end
    ) {
      return item
    }
  }

  return null
}