import { calendarDateKey } from './calendar-date'

export type LoadRide = {
  started_at: string
  duration_seconds: number | null
  average_power_watts: number | null
}

export type DatedFtp = { ftp_watts: number; set_on: string }

export type TrainingLoadPoint = {
  date: string
  dailyLoad: number
  ctl: number
  atl: number
  tsb: number
}

export type TrainingLoadTrend = {
  points: TrainingLoadPoint[]
  latest: TrainingLoadPoint | null
  latestRideLoad: { date: string; load: number } | null
  scoredRideCount: number
  missingPowerRideCount: number
  missingFtpRideCount: number
  historyStartDate: string | null
}

function nextDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

function round(value: number) {
  return Math.round(value * 10) / 10
}

/** Estimates daily relative load from moving time and average power against the FTP in effect that day. */
export function calculateTrainingLoad(
  rides: LoadRide[],
  ftpHistory: DatedFtp[],
  timeZone: string,
  today: Date = new Date(),
): TrainingLoadTrend {
  const ftpByDate = [...ftpHistory].sort((first, second) => second.set_on.localeCompare(first.set_on))
  const dailyLoads = new Map<string, number>()
  let scoredRideCount = 0
  let missingPowerRideCount = 0
  let missingFtpRideCount = 0
  let firstScoredDate: string | null = null
  const todayKey = calendarDateKey(today, timeZone)

  for (const ride of rides) {
    const rideDate = calendarDateKey(new Date(ride.started_at), timeZone)
    if (rideDate > todayKey) continue
    if (ride.average_power_watts === null || ride.duration_seconds === null || ride.duration_seconds <= 0) {
      missingPowerRideCount += 1
      continue
    }
    const ftp = ftpByDate.find((record) => record.set_on <= rideDate)
    if (!ftp) {
      missingFtpRideCount += 1
      continue
    }

    const intensityFactor = ride.average_power_watts / ftp.ftp_watts
    const relativeLoad = ride.duration_seconds / 3600 * intensityFactor * intensityFactor * 100
    dailyLoads.set(rideDate, (dailyLoads.get(rideDate) ?? 0) + relativeLoad)
    if (firstScoredDate === null || rideDate.localeCompare(firstScoredDate) < 0) firstScoredDate = rideDate
    scoredRideCount += 1
  }

  if (!firstScoredDate) {
    return { points: [], latest: null, latestRideLoad: null, scoredRideCount, missingPowerRideCount, missingFtpRideCount, historyStartDate: null }
  }

  const ctlAlpha = 1 - Math.exp(-1 / 42)
  const atlAlpha = 1 - Math.exp(-1 / 7)
  const points: TrainingLoadPoint[] = []
  let ctl = 0
  let atl = 0
  for (let day = firstScoredDate; day <= todayKey; day = nextDate(day)) {
    const priorCtl = ctl
    const priorAtl = atl
    const dailyLoad = dailyLoads.get(day) ?? 0
    ctl += ctlAlpha * (dailyLoad - ctl)
    atl += atlAlpha * (dailyLoad - atl)
    points.push({ date: day, dailyLoad: round(dailyLoad), ctl: round(ctl), atl: round(atl), tsb: round(priorCtl - priorAtl) })
  }
  const visiblePoints = points.slice(-28)
  return {
    points: visiblePoints,
    latest: points.at(-1) ?? null,
    latestRideLoad: [...dailyLoads.entries()].sort(([first], [second]) => second.localeCompare(first)).map(([date, load]) => ({ date, load: round(load) }))[0] ?? null,
    scoredRideCount,
    missingPowerRideCount,
    missingFtpRideCount,
    historyStartDate: firstScoredDate,
  }
}
