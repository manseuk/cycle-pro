import { useEffect, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { calendarDateKey } from './calendar-date'
import { calculateTrainingLoad, type DatedFtp, type LoadRide } from './training-load'

type Ride = LoadRide
type FtpRecord = DatedFtp & { id: string; cyclist_id: string }
type RecoveryCheckin = {
  id: string
  cyclist_id: string
  checkin_date: string
  perceived_recovery: number
  illness_or_injury: boolean
}

type Props = {
  client: SupabaseClient | null
  cyclistId: string
  rides: Ride[]
  timeZone: string
}

const recoveryLabels: Record<number, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Very good',
}

function displayDate(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${dateKey}T12:00:00Z`))
}

function chartPoints(values: number[], maximum: number) {
  if (values.length === 0) return ''
  return values.map((value, index) => {
    const x = values.length === 1 ? 160 : index / (values.length - 1) * 320
    const y = 92 - value / maximum * 82
    return `${x},${y}`
  }).join(' ')
}

export function TrainingLoadSection({ client, cyclistId, rides, timeZone }: Props) {
  const today = calendarDateKey(new Date(), timeZone)
  const [ftpRecords, setFtpRecords] = useState<FtpRecord[]>([])
  const [ftpWatts, setFtpWatts] = useState('')
  const [ftpDate, setFtpDate] = useState(today)
  const [ftpMessage, setFtpMessage] = useState('')
  const [checkin, setCheckin] = useState<RecoveryCheckin | null>(null)
  const [recoveryScore, setRecoveryScore] = useState('3')
  const [illnessOrInjury, setIllnessOrInjury] = useState(false)
  const [checkinMessage, setCheckinMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!client) { setFtpRecords([]); return }
    let active = true
    void client.from('ftp_records').select('id,cyclist_id,ftp_watts,set_on').eq('cyclist_id', cyclistId).order('set_on', { ascending: false }).then(({ data, error }) => {
      if (!active) return
      if (!error) setFtpRecords((data ?? []) as FtpRecord[])
    })
    return () => { active = false }
  }, [client, cyclistId])

  useEffect(() => {
    setFtpDate(today)
    if (!client) { setCheckin(null); return }
    let active = true
    void client.from('daily_recovery_checkins').select('*').eq('cyclist_id', cyclistId).eq('checkin_date', today).maybeSingle().then(({ data, error }) => {
      if (!active) return
      if (error) { setCheckinMessage('Today’s check-in could not be loaded.'); return }
      const saved = data as RecoveryCheckin | null
      setCheckin(saved)
      if (saved) {
        setRecoveryScore(String(saved.perceived_recovery))
        setIllnessOrInjury(saved.illness_or_injury)
      } else {
        setRecoveryScore('3')
        setIllnessOrInjury(false)
      }
    })
    return () => { active = false }
  }, [client, cyclistId, today])

  const trend = calculateTrainingLoad(rides, ftpRecords, timeZone)
  const chartMax = Math.max(1, ...trend.points.flatMap((point) => [point.ctl, point.atl]))

  async function saveFtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!client) return
    setSaving(true)
    setFtpMessage('')
    const { data, error } = await client.from('ftp_records').upsert({ cyclist_id: cyclistId, ftp_watts: Number(ftpWatts), set_on: ftpDate }, { onConflict: 'cyclist_id,set_on' }).select('id,cyclist_id,ftp_watts,set_on').single()
    if (error) setFtpMessage('FTP could not be saved. Check the value and date, then try again.')
    else {
      const savedFtp = data as FtpRecord
      setFtpRecords((previous) => [savedFtp, ...previous.filter((record) => record.set_on !== savedFtp.set_on)].sort((first, second) => second.set_on.localeCompare(first.set_on)))
      setFtpWatts('')
      setFtpMessage(`FTP ${savedFtp.ftp_watts} W saved for ${displayDate(savedFtp.set_on)}.`)
    }
    setSaving(false)
  }

  async function saveCheckin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!client) return
    setSaving(true)
    setCheckinMessage('')
    const { data, error } = await client.from('daily_recovery_checkins').upsert({
      cyclist_id: cyclistId,
      checkin_date: today,
      perceived_recovery: Number(recoveryScore),
      illness_or_injury: illnessOrInjury,
    }, { onConflict: 'cyclist_id,checkin_date' }).select('*').single()
    if (error) setCheckinMessage('Today’s check-in could not be saved. Please try again.')
    else {
      setCheckin(data as RecoveryCheckin)
      setCheckinMessage('Today’s recovery check-in saved.')
    }
    setSaving(false)
  }

  return <section className="goal-section training-load-section" aria-labelledby="training-load-heading">
    <h2 id="training-load-heading">Training load and recovery</h2>
    <p>Power-based load uses completed Rides and the dated FTP that was active on each Ride date. FTP is never inferred or changed automatically.</p>
    <form className="goal-form" onSubmit={(event) => void saveFtp(event)}>
      <h3>FTP history</h3>
      <label>FTP in watts<input type="number" min="1" max="1000" step="1" value={ftpWatts} onChange={(event) => setFtpWatts(event.currentTarget.value)} required /></label>
      <label>FTP effective date<input type="date" value={ftpDate} onChange={(event) => setFtpDate(event.currentTarget.value)} required /></label>
      <p className="goal-help">Saving a second estimate for the same date updates that date’s value.</p>
      <button disabled={saving}>{saving ? 'Saving…' : 'Save FTP'}</button>
      {ftpMessage ? <p role="status">{ftpMessage}</p> : null}
    </form>
    {ftpRecords.length ? <ul className="ftp-history" aria-label="FTP history">{ftpRecords.map((record) => <li key={record.id}><strong>{record.ftp_watts} W</strong> · {displayDate(record.set_on)}</li>)}</ul> : <p>No dated FTP estimates saved.</p>}

    <form className="goal-form" onSubmit={(event) => void saveCheckin(event)}>
      <h3>Today’s recovery check-in</h3>
      <label>Recovery feeling<select value={recoveryScore} onChange={(event) => setRecoveryScore(event.currentTarget.value)}>
        {Object.entries(recoveryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <label className="checkin-checkbox"><input type="checkbox" checked={illnessOrInjury} onChange={(event) => setIllnessOrInjury(event.currentTarget.checked)} /> Illness or injury today</label>
      <p className="goal-help">Check-ins are optional. An illness or injury report will suppress intensity suggestions.</p>
      <button disabled={saving}>{saving ? 'Saving…' : 'Save today’s check-in'}</button>
      {checkinMessage ? <p role="status">{checkinMessage}</p> : null}
    </form>
    {checkin ? <p className="recovery-summary" role="status">Today: {recoveryLabels[checkin.perceived_recovery]} recovery; {checkin.illness_or_injury ? 'illness or injury reported' : 'no illness or injury reported'}.</p> : <p>No recovery check-in saved for today.</p>}

    <section className="load-trends" aria-labelledby="load-trends-heading">
      <h3 id="load-trends-heading">Power training load</h3>
      <p>Daily relative load = moving time (hours) × (average power ÷ active FTP)² × 100. It is a simple average-power estimate, not a standardized TSS score; heart-rate load is not calculated.</p>
      {trend.latest ? <>
        {trend.latestRideLoad ? <p>Power load on {displayDate(trend.latestRideLoad.date)}: {trend.latestRideLoad.load.toFixed(1)} relative points.</p> : null}
        <div className="load-values">
          <div><strong>CTL</strong><span>{trend.latest.ctl.toFixed(1)}</span><small>Longer-term trend · 42-day time constant</small></div>
          <div><strong>ATL</strong><span>{trend.latest.atl.toFixed(1)}</span><small>Recent trend · 7-day time constant</small></div>
          <div><strong>TSB</strong><span>{trend.latest.tsb.toFixed(1)}</span><small>Yesterday’s CTL minus ATL</small></div>
        </div>
        <svg className="load-chart" viewBox="0 0 320 104" role="img" aria-label="Recent relative CTL and ATL trends">
          <line x1="0" y1="92" x2="320" y2="92" />
          <polyline className="ctl-line" points={chartPoints(trend.points.map((point) => point.ctl), chartMax)} />
          <polyline className="atl-line" points={chartPoints(trend.points.map((point) => point.atl), chartMax)} />
        </svg>
        <p className="chart-legend"><span className="ctl-key">CTL</span><span className="atl-key">ATL</span> · Last 28 days</p>
        {trend.historyStartDate ? <p className="goal-help">Trend history starts {displayDate(trend.historyStartDate)} and builds from there; early values are limited by available history.</p> : null}
        <p className="load-caveat">These are relative load trends, not a readiness or performance score, and should not be read as training advice.</p>
      </> : <p>No power load trend yet. A Ride needs recorded average power and a dated FTP that applies on the Ride date.</p>}
      {trend.missingPowerRideCount || trend.missingFtpRideCount ? <p className="load-warning" role="status">
        {trend.missingPowerRideCount ? `${trend.missingPowerRideCount} Ride${trend.missingPowerRideCount === 1 ? '' : 's'} without usable average power excluded. ` : ''}
        {trend.missingFtpRideCount ? `${trend.missingFtpRideCount} Ride${trend.missingFtpRideCount === 1 ? '' : 's'} without an active dated FTP excluded.` : ''}
      </p> : null}
      {checkin?.illness_or_injury ? <p className="load-warning">Your check-in reports illness or injury; intensity suggestions should be suppressed.</p> : null}
    </section>
  </section>
}
