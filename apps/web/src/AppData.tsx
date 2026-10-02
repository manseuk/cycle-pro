import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Ride, TrainingGoal } from './types'
import type { ZwiftOption } from './SavedZwiftOptionsSection'
import type { PlannedSuggestion } from './TrainingCalendar'

type AppData = {
  ready: boolean
  session: Session | null
  recovery: boolean
  endRecovery: () => void
  notice: string
  setNotice: (notice: string) => void
  cyclistAccount: 'loading' | 'available' | 'unavailable'
  savedTimezone: string
  setSavedTimezone: (timeZone: string) => void
  goal: TrainingGoal | null
  setGoal: (goal: TrainingGoal | null) => void
  goalLoading: boolean
  goalLoadError: string
  rides: Ride[]
  setRides: Dispatch<SetStateAction<Ride[]>>
  ridesLoading: boolean
  ridesLoadError: string
  plannedSuggestions: PlannedSuggestion[]
  refreshPlannedSuggestions: () => void
  zwiftOptions: ZwiftOption[]
  refreshZwiftOptions: () => void
}

const AppDataContext = createContext<AppData | null>(null)

export function useAppData() {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData must be used inside AppDataProvider')
  return value
}

// Signed-in data shared by every page. Form drafts, messages and busy flags stay in the page that uses them.
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [notice, setNotice] = useState('')
  const [cyclistAccount, setCyclistAccount] = useState<AppData['cyclistAccount']>('loading')
  const [savedTimezone, setSavedTimezone] = useState('UTC')
  const [goal, setGoal] = useState<TrainingGoal | null>(null)
  const [goalLoading, setGoalLoading] = useState(false)
  const [goalLoadError, setGoalLoadError] = useState('')
  const [rides, setRides] = useState<Ride[]>([])
  const [ridesLoading, setRidesLoading] = useState(false)
  const [ridesLoadError, setRidesLoadError] = useState('')
  const [plannedSuggestions, setPlannedSuggestions] = useState<PlannedSuggestion[]>([])
  const [zwiftOptions, setZwiftOptions] = useState<ZwiftOption[]>([])
  const userId = session?.user.id

  const refreshPlannedSuggestions = useCallback(() => {
    if (!userId || !supabase) { setPlannedSuggestions([]); return }
    void supabase.from('workout_suggestions').select('id,suggestion_date,workout_type,duration_minutes,intensity_target,explanation,suggestion_type,status').eq('cyclist_id', userId).eq('status', 'accepted').order('suggestion_date', { ascending: true }).then(({ data, error }) => {
      if (!error) setPlannedSuggestions((data ?? []) as PlannedSuggestion[])
    })
  }, [userId])

  const refreshZwiftOptions = useCallback(() => {
    if (!userId || !supabase) { setZwiftOptions([]); return }
    void supabase.from('saved_zwift_options').select('id,option_type,name,option_date,option_time,route,url,notes,goal_id,goal_name').eq('cyclist_id', userId).order('option_date', { ascending: true }).then(({ data, error }) => {
      if (!error) setZwiftOptions((data ?? []) as ZwiftOption[])
    })
  }, [userId])
  useEffect(() => { refreshZwiftOptions() }, [refreshZwiftOptions])
  useEffect(() => { refreshPlannedSuggestions() }, [refreshPlannedSuggestions])

  useEffect(() => {
    const client = supabase
    if (!client) { setReady(true); return }
    if (window.location.hash.includes('type=recovery') || new URLSearchParams(window.location.search).get('type') === 'recovery') {
      setRecovery(true)
    }
    const { data: { subscription } } = client.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
    })
    void client.auth.initialize().then(() => client.auth.getSession()).then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId || !supabase) {
      setCyclistAccount('loading')
      setSavedTimezone('UTC')
      return
    }
    let currentCyclist = true
    setCyclistAccount('loading')
    void supabase.from('cyclists').select('id,calendar_timezone').maybeSingle().then(({ data, error }) => {
      if (!currentCyclist) return
      setCyclistAccount(!error && data ? 'available' : 'unavailable')
      if (!error && data) setSavedTimezone(data.calendar_timezone)
    })
    return () => { currentCyclist = false }
  }, [userId])

  useEffect(() => {
    if (!userId || !supabase) {
      setRides([])
      setRidesLoading(false)
      return
    }
    let currentCyclist = true
    setRides([])
    setRidesLoading(true)
    setRidesLoadError('')
    void supabase.from('rides').select('*').eq('cyclist_id', userId).order('started_at', { ascending: false }).then(({ data, error }) => {
      if (!currentCyclist) return
      if (error) setRidesLoadError('Your Rides could not be loaded. Please refresh the page.')
      else setRides((data ?? []) as Ride[])
      setRidesLoading(false)
    })
    return () => { currentCyclist = false }
  }, [userId])

  useEffect(() => {
    if (!userId || !supabase) {
      setGoal(null)
      setGoalLoading(false)
      return
    }
    let currentCyclist = true
    setGoal(null)
    setGoalLoading(true)
    setGoalLoadError('')
    void supabase.from('training_goals').select('*').eq('cyclist_id', userId).maybeSingle().then(({ data, error }) => {
      if (!currentCyclist) return
      if (error) {
        setGoal(null)
        setGoalLoadError('Your training goal could not be loaded. Please refresh the page.')
      } else setGoal(data as TrainingGoal | null)
      setGoalLoading(false)
    })
    return () => { currentCyclist = false }
  }, [userId])

  const endRecovery = useCallback(() => setRecovery(false), [])
  const value = useMemo<AppData>(() => ({
    ready, session, recovery, endRecovery, notice, setNotice, cyclistAccount, savedTimezone, setSavedTimezone, goal, setGoal, goalLoading, goalLoadError,
    rides, setRides, ridesLoading, ridesLoadError, plannedSuggestions, refreshPlannedSuggestions, zwiftOptions, refreshZwiftOptions,
  }), [ready, session, recovery, endRecovery, notice, cyclistAccount, savedTimezone, goal, goalLoading, goalLoadError, rides, ridesLoading, ridesLoadError, plannedSuggestions, refreshPlannedSuggestions, zwiftOptions, refreshZwiftOptions])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
