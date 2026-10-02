import { useEffect, useState, type FormEvent } from 'react'
import { useAppData } from '../AppData'
import { displayTimestamp } from '../calendar-date'
import { PageHeading } from '../PageHeading'
import { TrainingLoadSection } from '../TrainingLoadSection'
import { DailySuggestionSection } from '../DailySuggestionSection'
import { SavedZwiftOptionsSection } from '../SavedZwiftOptionsSection'
import { TrainingCalendar } from '../TrainingCalendar'
import { apiBaseUrl, supabase } from '../supabase'
import type { GoalType, Ride, TrainingGoal, WeeklyTargetType } from '../types'

type GoalDraft = {
  goalType: GoalType
  name: string
  eventDate: string
  finishMinutes: string
  weeklyTargetType: WeeklyTargetType
  weeklyTargetValue: string
  ftpTargetWatts: string
}
type ImportResult = { fileName: string; message: string; rideId?: string; status: 'imported' | 'duplicate' | 'likely-duplicate' | 'error' }

const emptyGoalDraft: GoalDraft = {
  goalType: 'event', name: '', eventDate: '', finishMinutes: '',
  weeklyTargetType: 'rides', weeklyTargetValue: '', ftpTargetWatts: '',
}

// All of the previous single page's training content, moved here unchanged. Later slices peel each part onto its own page.
export default function Today() {
  const {
    session, cyclistAccount, savedTimezone, setSavedTimezone, goal, setGoal, goalLoading, goalLoadError, rides, setRides, ridesLoading, ridesLoadError,
    plannedSuggestions, refreshPlannedSuggestions, zwiftOptions, refreshZwiftOptions,
  } = useAppData()
  const [busy, setBusy] = useState(false)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState<GoalDraft>(emptyGoalDraft)
  const [goalTemplate, setGoalTemplate] = useState('custom')
  const [goalMessage, setGoalMessage] = useState('')
  const [rideMessage, setRideMessage] = useState('')
  const [calendarTimezone, setCalendarTimezone] = useState(savedTimezone)
  const [timezoneMessage, setTimezoneMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [uploading, setUploading] = useState(false)
  const [editingRideNotes, setEditingRideNotes] = useState<string | null>(null)
  const [rideNotesDraft, setRideNotesDraft] = useState('')
  const [savingRide, setSavingRide] = useState(false)
  const [suggestionInputRevision, setSuggestionInputRevision] = useState(0)
  const showTraining = Boolean(session) && cyclistAccount === 'available'
  useEffect(() => { setCalendarTimezone(savedTimezone) }, [savedTimezone])

  function startGoalEditor() {
    setGoalDraft(goal ? {
      goalType: goal.goal_type,
      name: goal.name,
      eventDate: goal.event_date ?? '',
      finishMinutes: goal.target_finish_minutes?.toString() ?? '',
      weeklyTargetType: goal.weekly_target_type ?? 'rides',
      weeklyTargetValue: goal.weekly_target_value?.toString() ?? '',
      ftpTargetWatts: goal.ftp_target_watts?.toString() ?? '',
    } : emptyGoalDraft)
    setGoalTemplate('custom')
    setGoalMessage('')
    setEditingGoal(true)
  }

  function applyGoalTemplate(template: string) {
    setGoalTemplate(template)
    if (template === 'event-century') {
      setGoalDraft({ ...emptyGoalDraft, goalType: 'event', name: 'Century ride' })
    } else if (template === 'event-sportive') {
      setGoalDraft({ ...emptyGoalDraft, goalType: 'event', name: 'Sportive' })
    } else if (template === 'fitness-frequency') {
      setGoalDraft({ ...emptyGoalDraft, goalType: 'general-fitness', name: 'Ride more often', weeklyTargetType: 'rides', weeklyTargetValue: '3' })
    } else if (template === 'fitness-time') {
      setGoalDraft({ ...emptyGoalDraft, goalType: 'general-fitness', name: 'Build weekly riding time', weeklyTargetType: 'hours', weeklyTargetValue: '5' })
    }
  }

  async function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !session) return
    setBusy(true)
    setGoalMessage('')
    const eventGoal = goalDraft.goalType === 'event'
    const goalValues = {
      cyclist_id: session.user.id,
      goal_type: goalDraft.goalType,
      name: goalDraft.name.trim(),
      event_date: eventGoal ? goalDraft.eventDate : null,
      event_outcome: 'complete' as const,
      target_finish_minutes: eventGoal && goalDraft.finishMinutes ? Number(goalDraft.finishMinutes) : null,
      weekly_target_type: eventGoal ? null : goalDraft.weeklyTargetType,
      weekly_target_value: eventGoal ? null : Number(goalDraft.weeklyTargetValue),
      ftp_target_watts: !eventGoal && goalDraft.ftpTargetWatts ? Number(goalDraft.ftpTargetWatts) : null,
      updated_at: new Date().toISOString(),
    }
    try {
      const { data, error } = await supabase.from('training_goals').upsert(goalValues, { onConflict: 'cyclist_id' }).select('*').single()
      if (error) throw error
      setGoal(data as TrainingGoal)
      setEditingGoal(false)
    } catch (error) {
      setGoalMessage(error instanceof Error ? error.message : 'Could not save your goal. Please try again.')
    } finally { setBusy(false) }
  }

  async function saveCalendarTimezone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !session) return
    let timeZone: string
    // Save the canonical name (e.g. europe/london → Europe/London); the database matches names exactly.
    try { timeZone = new Intl.DateTimeFormat(undefined, { timeZone: calendarTimezone.trim() }).resolvedOptions().timeZone } catch {
      setTimezoneMessage('Enter a valid time zone, such as Europe/London.')
      return
    }
    setSavingRide(true)
    setTimezoneMessage('')
    const { error } = await supabase.from('cyclists').update({ calendar_timezone: timeZone }).eq('id', session.user.id)
    if (error) setTimezoneMessage(error.code === '22023' ? 'Enter a named time zone, such as Europe/London; UTC offsets are not supported.' : 'Your calendar time zone could not be saved.')
    else {
      setCalendarTimezone(timeZone)
      setSavedTimezone(timeZone)
      setTimezoneMessage('Calendar time zone saved.')
    }
    setSavingRide(false)
  }

  async function importRides(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session || selectedFiles.length === 0) return
    const form = event.currentTarget
    setUploading(true)
    setImportResults([])
    setRideMessage('')
    let importedAny = false
    for (const file of selectedFiles) {
      try {
        if (file.size === 0) throw new Error('This file is empty.')
        if (file.size > 20 * 1024 * 1024) throw new Error('This FIT file is too large. The maximum size is 20 MB.')
        const { parseCyclingRide } = await import('../fit-import')
        const fileBytes = await file.arrayBuffer()
        const [{ ride }, digest] = await Promise.all([
          parseCyclingRide(fileBytes, file.name),
          crypto.subtle.digest('SHA-256', fileBytes),
        ])
        const fileHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
        const response = await fetch(`${apiBaseUrl || '/api'}/rides/import`, {
          method: 'POST',
          headers: { authorization: `Bearer ${session.access_token}`, 'content-type': 'application/json' },
          body: JSON.stringify({ file_sha256: fileHash, ride }),
        })
        const result = await response.json() as {
          status?: 'imported' | 'duplicate'
          error?: string
          ride?: Ride
          likelyDuplicate?: boolean
        }
        if (!response.ok) throw new Error(result.error ?? 'This file could not be imported.')
        if (result.status === 'duplicate' && result.ride) {
          setImportResults((previous) => [...previous, { fileName: file.name, status: 'duplicate', rideId: result.ride!.id, message: `Exact duplicate skipped. Existing Ride: ${result.ride!.activity_name}.` }])
        } else if (result.status === 'imported' && result.ride) {
          importedAny = true
          setImportResults((previous) => [...previous, {
            fileName: file.name,
            status: result.likelyDuplicate ? 'likely-duplicate' : 'imported',
            rideId: result.ride!.id,
            message: result.likelyDuplicate ? 'Imported as a separate Ride. It may duplicate an existing activity; please review.' : 'Ride imported successfully.',
          }])
        } else throw new Error('The import service returned an unexpected result.')
      } catch (error) {
        setImportResults((previous) => [...previous, {
          fileName: file.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'This file could not be imported.',
        }])
      }
    }
    if (importedAny && supabase) {
      const { data, error } = await supabase.from('rides').select('*').eq('cyclist_id', session.user.id).order('started_at', { ascending: false })
      if (!error) setRides((data ?? []) as Ride[])
    }
    setSelectedFiles([])
    form.reset()
    setUploading(false)
  }

  async function saveRideNotes(rideId: string) {
    if (!supabase || !session) return
    setSavingRide(true)
    const { data, error } = await supabase.from('rides').update({ notes: rideNotesDraft }).eq('id', rideId).eq('cyclist_id', session.user.id).select('*').single()
    if (error) setRideMessage('Ride notes could not be saved. Please try again.')
    else {
      setRides((previous) => previous.map((ride) => ride.id === rideId ? data as Ride : ride))
      setEditingRideNotes(null)
      setRideMessage('Ride notes saved.')
    }
    setSavingRide(false)
  }

  async function deleteRide(ride: Ride) {
    if (!supabase || !session || !window.confirm(`Delete “${ride.activity_name}”? This removes the Ride from your account.`)) return
    setSavingRide(true)
    const { error } = await supabase.from('rides').delete().eq('id', ride.id).eq('cyclist_id', session.user.id)
    if (error) setRideMessage('This Ride could not be deleted. Please try again.')
    else {
      setRides((previous) => previous.filter((item) => item.id !== ride.id))
      setRideMessage('Ride deleted.')
    }
    setSavingRide(false)
  }

  return <section className="account-page" aria-labelledby="page-title">
    <p className="eyebrow">CYCLING TRAINING</p>
    <PageHeading>Today</PageHeading>
      {session ? <section className="goal-section" aria-labelledby="goal-heading">
        <h2 id="goal-heading">Your training goal</h2>
        {goalLoading ? <p role="status">Loading your goal…</p> : goal ? <div className="goal-card">
          <p className="goal-kind">Primary active goal · {goal.goal_type === 'event' ? 'Event goal' : 'General-fitness goal'}</p>
          <h3>{goal.name}</h3>
          {goal.goal_type === 'event' ? <>
            <p>Event date: {goal.event_date}</p>
            <p>Complete the event</p>
            {goal.target_finish_minutes ? <p>Target finish time: {goal.target_finish_minutes} minutes</p> : null}
          </> : <>
            <p>{goal.weekly_target_value} {goal.weekly_target_type === 'rides' ? 'rides' : 'hours'} per week</p>
            {goal.ftp_target_watts ? <p>FTP target: {goal.ftp_target_watts} W</p> : <p>No power target set</p>}
          </>}
          <button onClick={startGoalEditor}>Edit goal</button>
        </div> : <>
          <p>You do not have a Primary active goal yet.</p>
          <p>You can continue using the app without a goal; personalized workout suggestions need one first.</p>
          {!editingGoal ? <button onClick={startGoalEditor}>Set a goal</button> : null}
        </>}
        {editingGoal ? <form className="goal-form" onSubmit={(event) => void saveGoal(event)}>
          <label>Start from a template<select value={goalTemplate} onChange={(event) => applyGoalTemplate(event.currentTarget.value)}>
            <option value="custom">Custom goal</option>
            <option value="event-century">Complete a century ride</option>
            <option value="event-sportive">Complete a sportive</option>
            <option value="fitness-frequency">Ride more often</option>
            <option value="fitness-time">Build weekly riding time</option>
          </select></label>
          <label>Goal type<select value={goalDraft.goalType} onChange={(event) => setGoalDraft({ ...goalDraft, goalType: event.currentTarget.value as GoalType })}>
            <option value="event">Event goal</option>
            <option value="general-fitness">General-fitness goal</option>
          </select></label>
          <label>Goal name<input value={goalDraft.name} onChange={(event) => setGoalDraft({ ...goalDraft, name: event.currentTarget.value })} required maxLength={120} /></label>
          {goalDraft.goalType === 'event' ? <>
            <label>Event date<input type="date" value={goalDraft.eventDate} onChange={(event) => setGoalDraft({ ...goalDraft, eventDate: event.currentTarget.value })} required /></label>
            <p className="goal-help">The default outcome is to complete the event.</p>
            <label>Target finish time in minutes (optional)<input type="number" min="1" step="1" value={goalDraft.finishMinutes} onChange={(event) => setGoalDraft({ ...goalDraft, finishMinutes: event.currentTarget.value })} /></label>
          </> : <>
            <label>Weekly goal measure<select value={goalDraft.weeklyTargetType} onChange={(event) => setGoalDraft({ ...goalDraft, weeklyTargetType: event.currentTarget.value as WeeklyTargetType })}>
              <option value="rides">Rides per week</option>
              <option value="hours">Hours per week</option>
            </select></label>
            <label>{goalDraft.weeklyTargetType === 'rides' ? 'Rides per week' : 'Hours per week'}<input type="number" min="1" max="40" step={goalDraft.weeklyTargetType === 'hours' ? '0.5' : '1'} value={goalDraft.weeklyTargetValue} onChange={(event) => setGoalDraft({ ...goalDraft, weeklyTargetValue: event.currentTarget.value })} required /></label>
            <label>FTP target (optional)<input type="number" min="1" max="1000" step="1" value={goalDraft.ftpTargetWatts} onChange={(event) => setGoalDraft({ ...goalDraft, ftpTargetWatts: event.currentTarget.value })} /></label>
          </>}
          <div className="goal-actions"><button disabled={busy}>{busy ? 'Saving…' : 'Save primary goal'}</button><button type="button" className="text-button" onClick={() => setEditingGoal(false)}>Cancel</button></div>
        </form> : null}
        {goalMessage || goalLoadError ? <p className="form-message" role="status">{goalMessage || goalLoadError}</p> : null}
      </section> : null}
      {showTraining && session ? <section className="goal-section" aria-labelledby="rides-heading">
        <h2 id="rides-heading">Your rides</h2>
        <p>Import completed rides from FIT files. Each file is processed separately; uploads are discarded after parsing.</p>
        <form className="goal-form" onSubmit={(event) => void importRides(event)}>
          <label>FIT files<input type="file" accept=".fit,application/octet-stream" multiple onChange={(event) => setSelectedFiles(Array.from(event.currentTarget.files ?? []))} /></label>
          <p className="goal-help">Files up to 20 MB. Sensor measurements are kept as recorded.</p>
          <button disabled={uploading || selectedFiles.length === 0}>{uploading ? 'Importing…' : `Import ${selectedFiles.length || ''} FIT file${selectedFiles.length === 1 ? '' : 's'}`}</button>
        </form>
        {importResults.length ? <ul aria-label="FIT import results">{importResults.map((result, index) => <li key={`${result.fileName}-${index}`}>
          <strong>{result.fileName}</strong> — {result.message}{result.rideId ? <> <a href={`#ride-${result.rideId}`}>View Ride</a></> : null}
        </li>)}</ul> : null}
        <form className="goal-form" onSubmit={(event) => void saveCalendarTimezone(event)}>
          <label>Calendar time zone<input value={calendarTimezone} onChange={(event) => setCalendarTimezone(event.currentTarget.value)} placeholder="Europe/London" /></label>
          <p className="goal-help">Ride times are displayed in this time zone. Currently saved: {savedTimezone}.</p>
          <button disabled={savingRide || calendarTimezone === savedTimezone}>Save time zone</button>
          {timezoneMessage ? <p role="status">{timezoneMessage}</p> : null}
        </form>
        {rideMessage || ridesLoadError ? <p className="form-message" role="status">{rideMessage || ridesLoadError}</p> : null}
        {ridesLoading ? <p role="status">Loading rides…</p> : rides.length === 0 ? <p>No rides yet. Import a FIT file to get started.</p> : <div className="ride-list">{rides.map((ride) => <article className="goal-card" id={`ride-${ride.id}`} key={ride.id}>
          <p className="goal-kind">{displayTimestamp(ride.started_at, savedTimezone)}{ride.is_likely_duplicate ? ' · Possible duplicate — review this ride' : ''}</p>
          <h3>{ride.activity_name}</h3>
          <dl className="ride-metrics">
            <div><dt>Moving time</dt><dd>{ride.duration_seconds === null ? 'Unavailable' : `${Math.round(ride.duration_seconds / 60)} min`}</dd></div>
            <div><dt>Distance</dt><dd>{ride.total_distance_meters === null ? 'Unavailable' : `${(ride.total_distance_meters / 1000).toFixed(1)} km`}</dd></div>
            <div><dt>Ascent</dt><dd>{ride.total_ascent_meters === null ? 'Unavailable' : `${ride.total_ascent_meters} m`}</dd></div>
            <div><dt>Average power</dt><dd>{ride.average_power_watts === null ? 'Unavailable' : `${ride.average_power_watts} W`}</dd></div>
            <div><dt>Average heart rate</dt><dd>{ride.average_heart_rate === null ? 'Unavailable' : `${ride.average_heart_rate} bpm`}</dd></div>
            <div><dt>Average cadence</dt><dd>{ride.average_cadence === null ? 'Unavailable' : `${ride.average_cadence} rpm`}</dd></div>
          </dl>
          {editingRideNotes === ride.id ? <form onSubmit={(event) => { event.preventDefault(); void saveRideNotes(ride.id) }}>
            <label>Ride notes<textarea value={rideNotesDraft} onChange={(event) => setRideNotesDraft(event.currentTarget.value)} maxLength={4000} /></label>
            <button disabled={savingRide}>{savingRide ? 'Saving…' : 'Save notes'}</button>
            <button type="button" className="text-button" onClick={() => setEditingRideNotes(null)}>Cancel</button>
          </form> : <><p>{ride.notes || 'No notes.'}</p><button onClick={() => { setEditingRideNotes(ride.id); setRideNotesDraft(ride.notes) }}>Edit notes</button></>}
          <button className="danger-button" disabled={savingRide} onClick={() => void deleteRide(ride)}>Delete ride</button>
        </article>)}</div>}
      </section> : null}
      {showTraining && session ? <TrainingLoadSection client={supabase} cyclistId={session.user.id} rides={rides} timeZone={savedTimezone} onRecoverySaved={() => setSuggestionInputRevision((revision) => revision + 1)} /> : null}
      {showTraining && session ? <DailySuggestionSection client={supabase} cyclistId={session.user.id} goal={goal} rides={rides} timeZone={savedTimezone} onCalendarChanged={refreshPlannedSuggestions} inputRevision={suggestionInputRevision} /> : null}
      {showTraining && session ? <SavedZwiftOptionsSection client={supabase} cyclistId={session.user.id} goal={goal} options={zwiftOptions} onChanged={refreshZwiftOptions} /> : null}
      {showTraining ? <TrainingCalendar key={savedTimezone} rides={rides} planned={plannedSuggestions} zwiftOptions={zwiftOptions} goal={goal} timeZone={savedTimezone} /> : null}
  </section>
}
