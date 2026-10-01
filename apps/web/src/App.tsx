import { useEffect, useState, type FormEvent } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, { auth: { skipAutoInitialize: true } }) : null
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

type GoalType = 'event' | 'general-fitness'
type WeeklyTargetType = 'rides' | 'hours'
type TrainingGoal = {
  id: string
  cyclist_id: string
  goal_type: GoalType
  name: string
  event_date: string | null
  event_outcome: 'complete'
  target_finish_minutes: number | null
  weekly_target_type: WeeklyTargetType | null
  weekly_target_value: number | null
  ftp_target_watts: number | null
}
type GoalDraft = {
  goalType: GoalType
  name: string
  eventDate: string
  finishMinutes: string
  weeklyTargetType: WeeklyTargetType
  weeklyTargetValue: string
  ftpTargetWatts: string
}
type Ride = {
  id: string
  cyclist_id: string
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
  notes: string
  is_likely_duplicate: boolean
  possible_duplicate_of: string | null
}
type ImportResult = { fileName: string; message: string; rideId?: string; status: 'imported' | 'duplicate' | 'likely-duplicate' | 'error' }

const emptyGoalDraft: GoalDraft = {
  goalType: 'event', name: '', eventDate: '', finishMinutes: '',
  weeklyTargetType: 'rides', weeklyTargetValue: '', ftpTargetWatts: '',
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<'sign-in' | 'register' | 'reset' | 'new-password'>('sign-in')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [cyclistAccount, setCyclistAccount] = useState<'loading' | 'available' | 'unavailable'>('loading')
  const [goal, setGoal] = useState<TrainingGoal | null>(null)
  const [goalLoading, setGoalLoading] = useState(false)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState<GoalDraft>(emptyGoalDraft)
  const [goalTemplate, setGoalTemplate] = useState('custom')
  const [goalMessage, setGoalMessage] = useState('')
  const [rides, setRides] = useState<Ride[]>([])
  const [ridesLoading, setRidesLoading] = useState(false)
  const [rideMessage, setRideMessage] = useState('')
  const [calendarTimezone, setCalendarTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const [savedTimezone, setSavedTimezone] = useState('UTC')
  const [timezoneMessage, setTimezoneMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [uploading, setUploading] = useState(false)
  const [editingRideNotes, setEditingRideNotes] = useState<string | null>(null)
  const [rideNotesDraft, setRideNotesDraft] = useState('')
  const [savingRide, setSavingRide] = useState(false)

  useEffect(() => {
    if (!supabase) { setReady(true); return }
    if (window.location.hash.includes('type=recovery') || new URLSearchParams(window.location.search).get('type') === 'recovery') {
      setMode('new-password')
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      if (event === 'PASSWORD_RECOVERY') setMode('new-password')
    })
    void supabase.auth.initialize().then(() => supabase.auth.getSession()).then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session || !supabase) {
      setCyclistAccount('loading')
      setSavedTimezone('UTC')
      return
    }
    let currentCyclist = true
    setCyclistAccount('loading')
    void supabase.from('cyclists').select('id,calendar_timezone').maybeSingle().then(({ data, error }) => {
      if (!currentCyclist) return
      setCyclistAccount(!error && data ? 'available' : 'unavailable')
      if (!error && data) {
        setCalendarTimezone(data.calendar_timezone)
        setSavedTimezone(data.calendar_timezone)
      }
    })
    return () => { currentCyclist = false }
  }, [session?.user.id])

  useEffect(() => {
    if (!session || !supabase) {
      setRides([])
      setRidesLoading(false)
      setSelectedFiles([])
      setImportResults([])
      setEditingRideNotes(null)
      return
    }
    let currentCyclist = true
    setRides([])
    setRidesLoading(true)
    void supabase.from('rides').select('*').eq('cyclist_id', session.user.id).order('started_at', { ascending: false }).then(({ data, error }) => {
      if (!currentCyclist) return
      if (error) setRideMessage('Your Rides could not be loaded. Please refresh the page.')
      else setRides((data ?? []) as Ride[])
      setRidesLoading(false)
    })
    return () => { currentCyclist = false }
  }, [session?.user.id])

  useEffect(() => {
    if (!session || !supabase) {
      setGoal(null)
      setGoalLoading(false)
      setEditingGoal(false)
      return
    }
    let currentCyclist = true
    setGoal(null)
    setGoalLoading(true)
    setGoalMessage('')
    void supabase.from('training_goals').select('*').eq('cyclist_id', session.user.id).maybeSingle().then(({ data, error }) => {
      if (!currentCyclist) return
      if (error) {
        setGoal(null)
        setGoalMessage('Your training goal could not be loaded. Please refresh the page.')
      } else setGoal(data as TrainingGoal | null)
      setGoalLoading(false)
    })
    return () => { currentCyclist = false }
  }, [session?.user.id])

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
    try { new Intl.DateTimeFormat(undefined, { timeZone: calendarTimezone }) } catch {
      setTimezoneMessage('Enter a valid time zone, such as Europe/London.')
      return
    }
    setSavingRide(true)
    setTimezoneMessage('')
    const { error } = await supabase.from('cyclists').update({ calendar_timezone: calendarTimezone }).eq('id', session.user.id)
    if (error) setTimezoneMessage('Your calendar time zone could not be saved.')
    else {
      setSavedTimezone(calendarTimezone)
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
        const { parseCyclingRide } = await import('./fit-import')
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

  function displayTimestamp(timestamp: string) {
    try { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: savedTimezone }).format(new Date(timestamp)) }
    catch { return new Date(timestamp).toLocaleString() }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    setBusy(true)
    setMessage('')
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } })
        if (error) throw error
        setMessage('Check your email to verify your account before signing in.')
      } else if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin })
        if (error) throw error
        setMessage('If an account uses that email, a password reset link has been sent.')
      } else {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setMode('sign-in')
        setMessage('Password updated. Sign in with your new password.')
        await supabase.auth.signOut()
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally { setBusy(false) }
  }

  async function deleteAccount() {
    if (!supabase || !session) return
    if (!window.confirm('Permanently delete your account and all associated training data? This cannot be undone.')) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`${apiBaseUrl || '/api'}/auth/delete-account`, {
        method: 'POST',
        headers: { authorization: `Bearer ${session.access_token}` },
      })
      if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Account deletion failed.')
      await supabase.auth.signOut()
      setMessage('Your account and associated data have been deleted.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Account deletion failed.')
    } finally { setBusy(false) }
  }

  if (!ready) return <main className="page-shell"><p role="status">Loading your account…</p></main>

  return <main className="page-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="Cycle Pro home"><span className="brand-mark">C</span><span>cycle<span className="brand-light">pro</span></span></a><span className="topbar-note">Private cycling account</span></header>
    <section className="account-page" aria-labelledby="page-title">
      <p className="eyebrow">CYCLING TRAINING</p>
      <h1 id="page-title">{mode === 'new-password' ? 'Choose a new password' : session ? 'Your account' : mode === 'register' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}</h1>
      <p className="intro">{mode === 'new-password' ? 'Choose a new password for your account.' : session ? 'Your training account is private to you.' : 'Sign in to access your private cycling account.'}</p>
      {!supabase ? <p role="alert">Account access is not configured. Start the local Supabase services and reload.</p> : null}
      {session && mode !== 'new-password' ? <div className="account-card">
        <p>Signed in as <strong>{session.user.email}</strong></p>
        <p>{cyclistAccount === 'available' ? 'Your private Cyclist account is ready.' : cyclistAccount === 'loading' ? 'Loading your private account…' : 'Your private account could not be loaded. Refresh the page or contact support.'}</p>
        <button disabled={busy} onClick={() => void supabase?.auth.signOut()}>Sign out</button>
        <button className="danger-button" disabled={busy} onClick={() => void deleteAccount()}>Delete account</button>
      </div> : <form className="account-form" onSubmit={(event) => void submit(event)}>
        {mode !== 'new-password' ? <label>Email address<input type="email" name="email" autoComplete="email" required /></label> : null}
        {mode !== 'reset' ? <label>{mode === 'new-password' ? 'New password' : 'Password'}<input type="password" name="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength={8} required /></label> : null}
        <button disabled={busy || !supabase}>{busy ? 'Please wait…' : mode === 'register' ? 'Create account' : mode === 'reset' ? 'Send reset link' : mode === 'new-password' ? 'Update password' : 'Sign in'}</button>
        {mode === 'sign-in' ? <div className="account-links"><button type="button" className="text-button" onClick={() => { setMode('register'); setMessage('') }}>Create an account</button><button type="button" className="text-button" onClick={() => { setMode('reset'); setMessage('') }}>Forgot password?</button></div> : <button type="button" className="text-button" onClick={() => { setMode('sign-in'); setMessage('') }}>Back to sign in</button>}
      </form>}
      {session && mode !== 'new-password' ? <section className="goal-section" aria-labelledby="goal-heading">
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
        {goalMessage ? <p className="form-message" role="status">{goalMessage}</p> : null}
      </section> : null}
      {session && mode !== 'new-password' && cyclistAccount === 'available' ? <section className="goal-section" aria-labelledby="rides-heading">
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
        {rideMessage ? <p className="form-message" role="status">{rideMessage}</p> : null}
        {ridesLoading ? <p role="status">Loading rides…</p> : rides.length === 0 ? <p>No rides yet. Import a FIT file to get started.</p> : <div className="ride-list">{rides.map((ride) => <article className="goal-card" id={`ride-${ride.id}`} key={ride.id}>
          <p className="goal-kind">{displayTimestamp(ride.started_at)}{ride.is_likely_duplicate ? ' · Possible duplicate — review this ride' : ''}</p>
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
      {message ? <p className="form-message" role="status">{message}</p> : null}
    </section>
    <footer className="footer"><span>Made for the long ride.</span><span className="footer-mark">CYCLE PRO <span>·</span> ROAD CYCLING</span></footer>
  </main>
}

export default App
