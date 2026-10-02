export type GoalType = 'event' | 'general-fitness'
export type WeeklyTargetType = 'rides' | 'hours'
export type TrainingGoal = {
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
export type Ride = {
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
