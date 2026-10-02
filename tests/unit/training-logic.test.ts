import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculateTrainingLoad } from '../../apps/web/src/training-load.ts'
import { buildDailySuggestion, ftpStatus, type SuggestionGoal } from '../../apps/web/src/daily-suggestion.ts'
import { calendarDateKey } from '../../apps/web/src/calendar-date.ts'
import { isLikelyDuplicate } from '../../apps/api/src/duplicates.ts'

const today = new Date('2026-09-10T12:00:00Z')
const ride = (date: string, watts: number | null, seconds: number | null = 3600) => ({ started_at: `${date}T07:00:00Z`, duration_seconds: seconds, average_power_watts: watts })

test('training load uses the FTP in effect on each ride date', () => {
  const trend = calculateTrainingLoad(
    [ride('2026-09-01', 200), ride('2026-09-05', 200)],
    [{ ftp_watts: 200, set_on: '2026-08-01' }, { ftp_watts: 250, set_on: '2026-09-03' }],
    'UTC', today,
  )
  assert.equal(trend.points.find((point) => point.date === '2026-09-01')?.dailyLoad, 100)
  assert.equal(trend.points.find((point) => point.date === '2026-09-05')?.dailyLoad, 64)
  assert.equal(trend.scoredRideCount, 2)
})

test('training load counts rides it cannot score and ignores future rides', () => {
  const trend = calculateTrainingLoad(
    [ride('2026-09-01', null), ride('2026-07-01', 200), ride('2026-09-20', 200)],
    [{ ftp_watts: 200, set_on: '2026-08-01' }],
    'UTC', today,
  )
  assert.equal(trend.missingPowerRideCount, 1)
  assert.equal(trend.missingFtpRideCount, 1)
  assert.equal(trend.scoredRideCount, 0)
  assert.equal(trend.latest, null)
})

test('CTL and ATL rise after load, ATL faster, and TSB uses the prior day', () => {
  const trend = calculateTrainingLoad([ride('2026-09-09', 200)], [{ ftp_watts: 200, set_on: '2026-08-01' }], 'UTC', today)
  const [rideDay, nextDay] = trend.points
  assert.ok(rideDay.atl > rideDay.ctl && rideDay.ctl > 0)
  assert.equal(rideDay.tsb, 0)
  assert.ok(Math.abs(nextDay.tsb - (rideDay.ctl - rideDay.atl)) <= 0.1)
})

test('rides are dated in the Cyclist time zone', () => {
  const late = { started_at: '2026-09-09T23:30:00Z', duration_seconds: 3600, average_power_watts: 200 }
  const trend = calculateTrainingLoad([late], [{ ftp_watts: 200, set_on: '2026-08-01' }], 'Europe/London', today)
  assert.equal(trend.historyStartDate, '2026-09-10')
})

const goal: SuggestionGoal = { goal_type: 'event', name: 'Sportive', event_date: '2027-06-12', weekly_target_type: null, weekly_target_value: null }
const scored = calculateTrainingLoad([ride('2026-09-09', 200)], [{ ftp_watts: 200, set_on: '2026-08-01' }], 'UTC', today)
const empty = calculateTrainingLoad([], [], 'UTC', today)

test('suggestions abstain without a goal, when ill, or when recovery is low', () => {
  assert.equal(buildDailySuggestion(null, scored, 'current', 4, false).suggestion, null)
  assert.match(buildDailySuggestion(goal, scored, 'current', 4, true).reason, /illness or injury/)
  assert.equal(buildDailySuggestion(goal, empty, 'missing', 2, false).suggestion, null)
})

test('missing FTP offers the Ramp Test; missing scored rides abstains', () => {
  assert.equal(buildDailySuggestion(goal, empty, 'missing', null, false).suggestion?.suggestion_type, 'ftp-assessment')
  assert.equal(buildDailySuggestion(goal, empty, 'current', null, false).suggestion, null)
})

test('a workout explains the goal and load context', () => {
  const { suggestion } = buildDailySuggestion(goal, scored, 'current', 4, false)
  assert.equal(suggestion?.suggestion_type, 'workout')
  assert.match(suggestion?.explanation ?? '', /Sportive event on 2027-06-12.*CTL/)
})

const base = { started_at: '2026-09-01T07:00:00Z', duration_seconds: 3600, total_distance_meters: 30000 }
test('likely duplicates need close start times and metrics', () => {
  assert.equal(isLikelyDuplicate({ ...base, started_at: '2026-09-01T07:01:59Z', total_distance_meters: 30500 }, base), true)
  assert.equal(isLikelyDuplicate({ ...base, started_at: '2026-09-01T07:02:01Z' }, base), false)
  assert.equal(isLikelyDuplicate({ ...base, total_distance_meters: 31000 }, base), false)
  assert.equal(isLikelyDuplicate({ ...base, total_distance_meters: null, duration_seconds: 3700 }, { ...base, total_distance_meters: null }), true)
  assert.equal(isLikelyDuplicate({ ...base, total_distance_meters: null, duration_seconds: null }, { ...base, total_distance_meters: null, duration_seconds: null }), false)
})

test('an unknown time zone falls back to UTC dates', () => {
  assert.equal(calendarDateKey(new Date('2026-09-09T23:30:00Z'), 'Not/AZone'), '2026-09-09')
  assert.equal(calendarDateKey(new Date('2026-09-09T23:30:00Z'), 'Europe/London'), '2026-09-10')
})

test('an FTP older than 12 weeks is stale and re-offers the Ramp Test with a reason', () => {
  assert.equal(ftpStatus(null, '2026-09-10'), 'missing')
  assert.equal(ftpStatus('2026-06-18', '2026-09-10'), 'current')
  assert.equal(ftpStatus('2026-06-17', '2026-09-10'), 'stale')
  const { suggestion } = buildDailySuggestion(goal, scored, 'stale', 4, false)
  assert.equal(suggestion?.suggestion_type, 'ftp-assessment')
  assert.match(suggestion?.explanation ?? '', /more than 12 weeks old/)
})
