import type { TrainingLoadTrend } from './training-load'

export type SuggestionGoal = {
  goal_type: 'event' | 'general-fitness'
  name: string
  event_date: string | null
  weekly_target_type: 'rides' | 'hours' | null
  weekly_target_value: number | null
}

export type DailySuggestionDraft = {
  suggestion_type: 'workout' | 'ftp-assessment'
  workout_type: string
  duration_minutes: number
  intensity_target: string
  explanation: string
}

export function buildDailySuggestion(
  goal: SuggestionGoal | null,
  load: TrainingLoadTrend,
  ftpIsCurrent: boolean,
  recoveryScore: number | null,
  illnessOrInjury: boolean,
): { suggestion: DailySuggestionDraft | null; reason: string } {
  if (!goal) return { suggestion: null, reason: 'Set a Primary active goal to get a personalized workout suggestion.' }
  if (illnessOrInjury) return { suggestion: null, reason: 'Your check-in reports illness or injury. Workout intensity and the FTP assessment are withheld today.' }
  if (recoveryScore !== null && recoveryScore <= 2) return {
    suggestion: null,
    reason: 'Your recovery check-in is low. No workout or FTP assessment is suggested today; consider resting or choosing an easy activity yourself.',
  }
  if (!ftpIsCurrent) return {
    suggestion: {
      suggestion_type: 'ftp-assessment',
      workout_type: 'Optional Zwift Ramp Test FTP assessment',
      duration_minutes: 30,
      intensity_target: 'Follow the Zwift Ramp Test steps; this is an assessment, not a training workout.',
      explanation: `An FTP estimate is needed to explain power-based targets for your ${goal.name} goal. After testing, enter the estimated FTP and test date in FTP history. You can also use another FTP assessment method.`,
    },
    reason: '',
  }
  if (load.scoredRideCount === 0 || !load.latest) return {
    suggestion: null,
    reason: 'A recent Ride with usable average power and an applicable dated FTP is needed before a power-targeted suggestion can be explained.',
  }
  const recentLoad = load.latest.tsb
  const rideTarget = goal.goal_type === 'event'
    ? `Your ${goal.name} event${goal.event_date ? ` on ${goal.event_date}` : ''} is the current goal.`
    : `Your current goal is ${goal.weekly_target_value} ${goal.weekly_target_type} per week for ${goal.name}.`
  return {
    suggestion: {
      suggestion_type: 'workout',
      workout_type: 'Steady endurance ride',
      duration_minutes: 60,
      intensity_target: '65–75% FTP, steady aerobic effort',
      explanation: `${rideTarget} Your recent relative load trends are CTL ${load.latest.ctl.toFixed(1)}, ATL ${load.latest.atl.toFixed(1)}, and TSB ${recentLoad.toFixed(1)}. This is one steady aerobic session toward your goal; the trend values are context, not readiness thresholds.`,
    },
    reason: '',
  }
}
