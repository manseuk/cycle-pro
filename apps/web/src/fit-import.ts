import FitParser from 'fit-file-parser'

export type ParsedRide = {
  activity_name: string
  started_at: string
  duration_seconds: number | null
  elapsed_seconds: number | null
  total_distance_meters: number | null
  total_ascent_meters: number | null
  average_power_watts: number | null
  max_power_watts: number | null
  average_heart_rate: number | null
  max_heart_rate: number | null
  average_cadence: number | null
}

export class FitImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FitImportError'
  }
}

function finiteValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function average(values: Array<number | undefined>): number | null {
  const present = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0)
  return present.length ? present.reduce((sum, value) => sum + value, 0) / present.length : null
}

function maximum(values: Array<number | undefined>): number | null {
  let maximumValue: number | null = null
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      maximumValue = maximumValue === null ? value : Math.max(maximumValue, value)
    }
  }
  return maximumValue
}

function rounded(value: number | null): number | null {
  return value === null ? null : Math.round(value)
}

export async function parseCyclingRide(fileBytes: ArrayBuffer, fileName: string) {
  const decodeStartedAt = performance.now()
  let decoded
  try {
    decoded = await new FitParser({ force: false, mode: 'cascade', lengthUnit: 'm', speedUnit: 'm/s' }).parseAsync(fileBytes)
  } catch {
    throw new FitImportError('This file is not a valid FIT activity. Choose a completed ride FIT file and try again.')
  }
  const parsingDurationMs = Math.max(0, performance.now() - decodeStartedAt)
  const sessions = decoded.activity?.sessions ?? []
  const session = sessions.find((item) => item.sport === 'cycling')
  if (!session) throw new FitImportError('No cycling activity was found in this FIT file.')

  const records = session.laps?.flatMap((lap) => lap.records ?? []) ?? []
  const startDate = session.start_time ?? records.find((record) => record.timestamp instanceof Date)?.timestamp
  if (!(startDate instanceof Date) || !Number.isFinite(startDate.getTime())) {
    throw new FitImportError('The FIT file does not contain a usable ride start time.')
  }

  const elapsedSeconds = finiteValue(session.total_elapsed_time)
    ?? (records.length > 1 && records[0]?.timestamp && records.at(-1)?.timestamp
      ? (records.at(-1)!.timestamp!.getTime() - records[0]!.timestamp!.getTime()) / 1000
      : null)
  const durationSeconds = finiteValue(session.total_timer_time) ?? elapsedSeconds
  const distanceMeters = finiteValue(session.total_distance) ?? finiteValue(records.at(-1)?.distance)
  const averagePower = finiteValue(session.avg_power) ?? average(records.map((record) => record.power))
  const maxPower = finiteValue(session.max_power) ?? maximum(records.map((record) => record.power))
  const averageHeartRate = finiteValue(session.avg_heart_rate) ?? average(records.map((record) => record.heart_rate))
  const maxHeartRate = finiteValue(session.max_heart_rate) ?? maximum(records.map((record) => record.heart_rate))
  const averageCadence = finiteValue(session.avg_cadence) ?? average(records.map((record) => record.cadence))

  if (durationSeconds === null && distanceMeters === null && averagePower === null && averageHeartRate === null) {
    throw new FitImportError('This FIT file has no usable ride duration, distance, or sensor measurements.')
  }

  const safeName = fileName.replace(/\.[^.]+$/, '').trim().slice(0, 120)
  return {
    ride: {
      activity_name: safeName || 'Cycling ride',
      started_at: startDate.toISOString(),
      duration_seconds: rounded(durationSeconds),
      elapsed_seconds: rounded(elapsedSeconds),
      total_distance_meters: distanceMeters === null ? null : Math.round(distanceMeters * 100) / 100,
      total_ascent_meters: rounded(finiteValue(session.total_ascent)),
      average_power_watts: rounded(averagePower),
      max_power_watts: rounded(maxPower),
      average_heart_rate: rounded(averageHeartRate),
      max_heart_rate: rounded(maxHeartRate),
      average_cadence: rounded(averageCadence),
    } satisfies ParsedRide,
    parsingDurationMs,
  }
}
