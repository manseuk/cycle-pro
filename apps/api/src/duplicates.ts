function metricClose(first: number | null, second: number | null, tolerance: number) {
  return first !== null && second !== null && Math.abs(first - second) <= Math.max(tolerance, Math.max(first, second) * 0.02)
}

export function isLikelyDuplicate(candidate: {
  started_at: string
  duration_seconds: number | null
  total_distance_meters: number | null
}, previous: {
  started_at: string
  duration_seconds: number | null
  total_distance_meters: number | null
}) {
  const startDifference = Math.abs(Date.parse(candidate.started_at) - Date.parse(previous.started_at))
  if (!Number.isFinite(startDifference) || startDifference > 2 * 60 * 1000) return false
  if (candidate.total_distance_meters !== null && previous.total_distance_meters !== null) {
    return metricClose(candidate.total_distance_meters, previous.total_distance_meters, 100)
      && (candidate.duration_seconds === null || previous.duration_seconds === null
        || metricClose(candidate.duration_seconds, previous.duration_seconds, 120))
  }
  return metricClose(candidate.duration_seconds, previous.duration_seconds, 120)
}
