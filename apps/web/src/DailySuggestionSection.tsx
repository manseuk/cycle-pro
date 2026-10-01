import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { calendarDateKey } from './calendar-date'
import { buildDailySuggestion, type SuggestionGoal } from './daily-suggestion'
import { calculateTrainingLoad, type DatedFtp, type LoadRide } from './training-load'

type Suggestion = {
  id: string
  cyclist_id: string
  suggestion_date: string
  suggestion_type: 'workout' | 'ftp-assessment'
  workout_type: string
  duration_minutes: number
  intensity_target: string
  explanation: string
  status: 'suggested' | 'accepted' | 'skipped'
}

type Props = {
  client: SupabaseClient | null
  cyclistId: string
  goal: SuggestionGoal | null
  rides: LoadRide[]
  timeZone: string
  onCalendarChanged: () => void
  inputRevision: number
}

function dateLabel(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${dateKey}T12:00:00Z`))
}

export function DailySuggestionSection({ client, cyclistId, goal, rides, timeZone, onCalendarChanged, inputRevision }: Props) {
  const today = calendarDateKey(new Date(), timeZone)
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [abstention, setAbstention] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!client) { setLoading(false); setSuggestion(null); return }
    let active = true
    setLoading(true)
    setMessage('')
    setSuggestion(null)
    setAbstention('')
    void (async () => {
      const [existingResult, recoveryResult] = await Promise.all([
        client.from('workout_suggestions').select('*').eq('cyclist_id', cyclistId).eq('suggestion_date', today).maybeSingle(),
        client.from('daily_recovery_checkins').select('perceived_recovery,illness_or_injury').eq('cyclist_id', cyclistId).eq('checkin_date', today).maybeSingle(),
      ])
      const { data: existing, error: existingError } = existingResult
      if (!active) return
      if (existingError || recoveryResult.error) { setAbstention('Today’s suggestion could not be loaded. Please refresh the page.'); setLoading(false); return }
      const checkin = recoveryResult.data as { perceived_recovery: number; illness_or_injury: boolean } | null
      if (existing) {
        if (checkin?.illness_or_injury && existing.status === 'suggested') {
          const { data: suppressed, error } = await client.from('workout_suggestions').update({ status: 'skipped', decided_at: new Date().toISOString() }).eq('id', existing.id).eq('status', 'suggested').select('*').maybeSingle()
          if (!active) return
          if (!error && suppressed) { setSuggestion(suppressed as Suggestion); setAbstention('Your check-in reports illness or injury. Today’s unaccepted suggestion has been withheld.'); onCalendarChanged() }
          else setAbstention('Your check-in reports illness or injury. Workout intensity and the FTP assessment are withheld today.')
        } else if (checkin?.illness_or_injury && existing.status !== 'accepted') setAbstention('Your check-in reports illness or injury. Workout intensity and the FTP assessment are withheld today.')
        else setSuggestion(existing as Suggestion)
        setLoading(false)
        return
      }

      const [ftpResult] = await Promise.all([
        client.from('ftp_records').select('ftp_watts,set_on').eq('cyclist_id', cyclistId).lte('set_on', today).order('set_on', { ascending: false }),
      ])
      if (!active) return
      if (ftpResult.error) { setAbstention('Suggestion inputs could not be loaded. Please refresh the page.'); setLoading(false); return }
      const ftpHistory = (ftpResult.data ?? []) as DatedFtp[]
      const load = calculateTrainingLoad(rides, ftpHistory, timeZone)
      const decision = buildDailySuggestion(goal, load, ftpHistory.length > 0, checkin?.perceived_recovery ?? null, checkin?.illness_or_injury ?? false)
      if (!decision.suggestion) { setAbstention(decision.reason); setLoading(false); return }

      const { error: saveError } = await client.from('workout_suggestions').upsert({
        cyclist_id: cyclistId,
        suggestion_date: today,
        ...decision.suggestion,
      }, { onConflict: 'cyclist_id,suggestion_date', ignoreDuplicates: true })
      if (!active) return
      const { data: saved, error: readError } = await client.from('workout_suggestions').select('*').eq('cyclist_id', cyclistId).eq('suggestion_date', today).maybeSingle()
      if (saveError || readError) setAbstention('Today’s suggestion could not be saved. Please refresh the page.')
      else if (saved) { setSuggestion(saved as Suggestion); onCalendarChanged() }
      else setAbstention('A suggestion is already recorded for today.')
      if (saveError) setAbstention('Today’s suggestion could not be saved. Please refresh the page.')
      setLoading(false)
    })()
    return () => { active = false }
  }, [client, cyclistId, today, goal, rides, timeZone, inputRevision, onCalendarChanged])

  async function decide(status: 'accepted' | 'skipped') {
    if (!client || !suggestion || suggestion.status !== 'suggested') return
    setBusy(true)
    setMessage('')
    if (status === 'accepted') {
      const { data: currentCheckin, error: checkinError } = await client.from('daily_recovery_checkins').select('illness_or_injury').eq('cyclist_id', cyclistId).eq('checkin_date', today).maybeSingle()
      if (checkinError || currentCheckin?.illness_or_injury) {
        if (currentCheckin?.illness_or_injury) {
          const { data: suppressed } = await client.from('workout_suggestions').update({ status: 'skipped', decided_at: new Date().toISOString() }).eq('id', suggestion.id).eq('status', 'suggested').select('*').maybeSingle()
          if (suppressed) setSuggestion(suppressed as Suggestion)
          setMessage('Your check-in reports illness or injury. The suggestion has been withheld.')
        } else setMessage('Your recovery check-in could not be checked. Please try again.')
        setBusy(false)
        return
      }
    }
    const { data, error } = await client.from('workout_suggestions').update({ status, decided_at: new Date().toISOString() }).eq('id', suggestion.id).eq('status', 'suggested').select('*').maybeSingle()
    if (error || !data) setMessage('Your choice could not be saved. Please try again.')
    else {
      setSuggestion(data as Suggestion)
      setMessage(status === 'accepted' ? 'Suggestion accepted and added to your calendar.' : 'Suggestion skipped; nothing was added to your calendar.')
      onCalendarChanged()
    }
    setBusy(false)
  }

  return <section className="goal-section suggestion-section" aria-labelledby="suggestion-heading">
    <h2 id="suggestion-heading">Today’s workout suggestion</h2>
    <p>Suggestions are optional, limited to one per local date, and only become calendar plans when you accept them.</p>
    {loading ? <p role="status">Checking today’s training inputs…</p> : null}
    {!loading && abstention ? <p className="suggestion-abstention" role="status">{abstention}</p> : null}
    {!loading && suggestion ? <article className={`suggestion-card${suggestion.suggestion_type === 'ftp-assessment' ? ' assessment-card' : ''}`}>
      <p className="goal-kind">{suggestion.suggestion_type === 'ftp-assessment' ? 'OPTIONAL FTP SETUP' : 'ONE SUGGESTION FOR TODAY'}</p>
      <h3>{suggestion.workout_type}</h3>
      <p><strong>Duration:</strong> {suggestion.duration_minutes} minutes</p>
      <p><strong>Intensity target:</strong> {suggestion.intensity_target}</p>
      <p>{suggestion.explanation}</p>
      {suggestion.suggestion_type === 'ftp-assessment' ? <>
        <p>The Ramp Test is optional. After completing it in Zwift, manually save the estimated FTP and test date in FTP history above. You can record an FTP from another assessment method as well.</p>
        <a href="https://www.zwift.com/" target="_blank" rel="noreferrer">Open Zwift to find the Ramp Test</a>
      </> : null}
      {suggestion.status === 'suggested' ? <div className="suggestion-actions">
        <button disabled={busy} onClick={() => void decide('accepted')}>Accept and add to calendar</button>
        <button className="text-button" disabled={busy} onClick={() => void decide('skipped')}>Skip today</button>
      </div> : <p className="suggestion-state" role="status">{suggestion.status === 'accepted' ? 'Accepted · planned on your calendar' : 'Skipped · not added to your calendar'}</p>}
      <p className="goal-help">For {dateLabel(suggestion.suggestion_date)}. Training-load trends are estimates, not readiness advice.</p>
    </article> : null}
    {message ? <p role="status">{message}</p> : null}
  </section>
}
