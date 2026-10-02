import { Fragment, useState, type ReactNode } from 'react'
import { calendarDateKey, dateLabel, displayTimestamp } from './calendar-date'
import { linkedToGoal, type ZwiftOption } from './SavedZwiftOptionsSection'

export type CalendarRide = {
  id: string
  activity_name: string
  started_at: string
  duration_seconds: number | null
  total_distance_meters: number | null
  average_power_watts: number | null
  average_heart_rate: number | null
}
export type PlannedSuggestion = { id: string; suggestion_date: string; workout_type: string; duration_minutes: number; intensity_target: string; explanation: string; suggestion_type: 'workout' | 'ftp-assessment'; status: 'accepted' }
type OpenItem = { kind: 'ride' | 'planned' | 'zwift'; id: string }

type Props = {
  rides: CalendarRide[]
  planned: PlannedSuggestion[]
  zwiftOptions: ZwiftOption[]
  goal: { id: string; name: string } | null
  timeZone: string
}

function shiftCalendarMonth(monthKey: string, amount: number) {
  const month = new Date(`${monthKey}-01T00:00:00Z`)
  month.setUTCMonth(month.getUTCMonth() + amount)
  return `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, '0')}`
}

function groupByDate<T>(items: T[], dateOf: (item: T) => string) {
  const groups = new Map<string, T[]>()
  for (const item of items) groups.set(dateOf(item), [...(groups.get(dateOf(item)) ?? []), item])
  return groups
}

const itemStyles = {
  ride: { className: 'calendar-ride-item', mark: 'completed-ride-mark', symbol: '✓' },
  planned: { className: 'calendar-ride-item planned-item', mark: 'planned-workout-mark', symbol: '↗' },
  zwift: { className: 'calendar-ride-item zwift-item', mark: 'zwift-mark', symbol: 'Z' },
}

function CalendarItem({ kind, title, detail, onOpen }: { kind: OpenItem['kind']; title: string; detail: string; onOpen: () => void }) {
  const style = itemStyles[kind]
  return <button className={style.className} onClick={onOpen}>
    <span className={style.mark} aria-hidden="true">{style.symbol}</span><span><strong>{title}</strong><small>{detail}</small></span>
  </button>
}

/** Owner-only month/list calendar. Remount (key) on time zone change to reset to that zone's today. */
export function TrainingCalendar({ rides, planned, zwiftOptions, goal, timeZone }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => calendarDateKey(new Date(), timeZone))
  const [month, setMonth] = useState(() => selectedDate.slice(0, 7))
  const [view, setView] = useState<'month' | 'list'>(() => window.matchMedia('(max-width: 600px)').matches ? 'list' : 'month')
  const [openItem, setOpenItem] = useState<OpenItem | null>(null)

  const ridesByDate = groupByDate(rides, (ride) => calendarDateKey(new Date(ride.started_at), timeZone))
  const plannedByDate = groupByDate(planned, (item) => item.suggestion_date)
  const zwiftByDate = groupByDate(zwiftOptions, (option) => option.option_date)

  const monthStart = new Date(`${month}-01T00:00:00Z`)
  const monthTitle = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(monthStart)
  const firstGridDay = new Date(monthStart)
  firstGridDay.setUTCDate(firstGridDay.getUTCDate() - firstGridDay.getUTCDay())
  const gridDays = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstGridDay)
    day.setUTCDate(firstGridDay.getUTCDate() + index)
    return day.toISOString().slice(0, 10)
  })
  const monthDates = [...new Set([...ridesByDate.keys(), ...plannedByDate.keys(), ...zwiftByDate.keys()])].filter((dateKey) => dateKey.startsWith(month)).sort((first, second) => second.localeCompare(first))

  const openRide = openItem?.kind === 'ride' ? rides.find((ride) => ride.id === openItem.id) ?? null : null
  const openPlanned = openItem?.kind === 'planned' ? planned.find((item) => item.id === openItem.id) ?? null : null
  const openZwift = openItem?.kind === 'zwift' ? zwiftOptions.find((option) => option.id === openItem.id) ?? null : null

  function dayItems(dateKey: string, selectOnOpen: boolean) {
    const open = (item: OpenItem) => { if (selectOnOpen) setSelectedDate(dateKey); setOpenItem(item) }
    const item = (kind: OpenItem['kind'], id: string, title: string, detail: string) => ({ key: id, node: <CalendarItem kind={kind} title={title} detail={detail} onOpen={() => open({ kind, id })} /> })
    return {
      rides: (ridesByDate.get(dateKey) ?? []).map((ride) => item('ride', ride.id, ride.activity_name, `Completed Ride · ${displayTimestamp(ride.started_at, timeZone)}`)),
      planned: (plannedByDate.get(dateKey) ?? []).map((plan) => item('planned', plan.id, plan.workout_type, `Planned workout · ${plan.duration_minutes} min`)),
      zwift: (zwiftByDate.get(dateKey) ?? []).map((option) => item('zwift', option.id, option.name, `Saved Zwift ${option.option_type}${option.option_time ? ` · ${option.option_time.slice(0, 5)}` : ''}`)),
    }
  }
  const asList = (items: Array<{ key: string; node: ReactNode }>, label?: string) => items.length ? <ul aria-label={label}>{items.map((entry) => <li key={entry.key}>{entry.node}</li>)}</ul> : null

  const selected = dayItems(selectedDate, false)
  const closeButton = <button className="text-button" onClick={() => setOpenItem(null)}>Close details</button>

  return <section className="calendar-section" aria-labelledby="calendar-heading">
    <div className="calendar-heading-row">
      <div><p className="eyebrow">COMPLETED + PLANNED</p><h2 id="calendar-heading">Training calendar</h2></div>
      <div className="calendar-view-switch" aria-label="Calendar view">
        <button aria-pressed={view === 'month'} onClick={() => setView('month')}>Month</button>
        <button aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button>
      </div>
    </div>
    <div className="calendar-toolbar">
      <div className="calendar-month-controls">
        <button aria-label="Previous month" onClick={() => setMonth((current) => shiftCalendarMonth(current, -1))}>‹</button>
        <h3>{monthTitle}</h3>
        <button aria-label="Next month" onClick={() => setMonth((current) => shiftCalendarMonth(current, 1))}>›</button>
      </div>
      <button className="calendar-today" onClick={() => {
        const today = calendarDateKey(new Date(), timeZone)
        setSelectedDate(today)
        setMonth(today.slice(0, 7))
      }}>Today</button>
    </div>
    {view === 'month' ? <div className="calendar-month-view">
      <div className="calendar-weekdays" aria-hidden="true">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">{gridDays.map((dateKey) => {
        const dayRides = ridesByDate.get(dateKey) ?? []
        const dayPlans = plannedByDate.get(dateKey) ?? []
        const dayZwift = zwiftByDate.get(dateKey) ?? []
        return <button
          className={`calendar-day${dateKey.startsWith(month) ? '' : ' calendar-day-outside'}${selectedDate === dateKey ? ' calendar-day-selected' : ''}`}
          key={dateKey}
          aria-label={`${dateLabel(dateKey)}, ${dayRides.length} completed ${dayRides.length === 1 ? 'ride' : 'rides'}, ${dayPlans.length} planned ${dayPlans.length === 1 ? 'workout' : 'workouts'}, ${dayZwift.length} saved Zwift ${dayZwift.length === 1 ? 'option' : 'options'}`}
          aria-pressed={selectedDate === dateKey}
          onClick={() => { setSelectedDate(dateKey); setMonth(dateKey.slice(0, 7)) }}
        ><span className="calendar-day-number">{Number(dateKey.slice(-2))}</span>
          {dayRides.length ? <span className="calendar-day-activity">{dayRides.length} {dayRides.length === 1 ? 'ride' : 'rides'}</span> : null}
          {dayPlans.length ? <span className="calendar-day-planned">{dayPlans.length} planned</span> : null}
          {dayZwift.length ? <span className="calendar-day-zwift">{dayZwift.length} Zwift</span> : null}
        </button>
      })}</div>
    </div> : <div className="calendar-list-view">
      {monthDates.length ? monthDates.map((dateKey) => <section className="calendar-list-day" key={dateKey}>
        <button className="calendar-list-date" aria-pressed={selectedDate === dateKey} onClick={() => setSelectedDate(dateKey)}>{dateLabel(dateKey)}</button>
        {Object.values(dayItems(dateKey, true)).flat().map((entry) => <Fragment key={entry.key}>{entry.node}</Fragment>)}
      </section>) : <p>No completed rides this month.</p>}
    </div>}
    <section className="calendar-selected-date" aria-labelledby="calendar-selected-date-heading">
      <h3 id="calendar-selected-date-heading">{dateLabel(selectedDate)}</h3>
      {asList(selected.rides)}
      {asList(selected.planned, 'Planned workouts')}
      {asList(selected.zwift, 'Saved Zwift options')}
      {!selected.rides.length && !selected.planned.length && !selected.zwift.length ? <p>No completed Rides, planned workouts, or saved Zwift options on this date.</p> : null}
    </section>
    {openRide ? <section className="calendar-ride-detail" aria-labelledby="calendar-ride-detail-heading">
      <div className="calendar-detail-heading"><div><p className="goal-kind">COMPLETED RIDE</p><h3 id="calendar-ride-detail-heading">{openRide.activity_name}</h3></div>{closeButton}</div>
      <p>{displayTimestamp(openRide.started_at, timeZone)}</p>
      <dl className="ride-metrics">
        <div><dt>Moving time</dt><dd>{openRide.duration_seconds === null ? 'Unavailable' : `${Math.round(openRide.duration_seconds / 60)} min`}</dd></div>
        <div><dt>Distance</dt><dd>{openRide.total_distance_meters === null ? 'Unavailable' : `${(openRide.total_distance_meters / 1000).toFixed(1)} km`}</dd></div>
        <div><dt>Average power</dt><dd>{openRide.average_power_watts === null ? 'Unavailable' : `${openRide.average_power_watts} W`}</dd></div>
        <div><dt>Average heart rate</dt><dd>{openRide.average_heart_rate === null ? 'Unavailable' : `${openRide.average_heart_rate} bpm`}</dd></div>
      </dl>
      <a href={`#ride-${openRide.id}`}>Open ride management details</a>
    </section> : null}
    {openPlanned ? <section className="calendar-ride-detail planned-detail" aria-labelledby="calendar-planned-detail-heading">
      <div className="calendar-detail-heading"><div><p className="goal-kind">ACCEPTED WORKOUT · PLANNED</p><h3 id="calendar-planned-detail-heading">{openPlanned.workout_type}</h3></div>{closeButton}</div>
      <p>{dateLabel(openPlanned.suggestion_date)} · {openPlanned.duration_minutes} minutes</p>
      <p><strong>Intensity target:</strong> {openPlanned.intensity_target}</p>
      <p>{openPlanned.explanation}</p>
    </section> : null}
    {openZwift ? <section className="calendar-ride-detail zwift-detail" aria-labelledby="calendar-zwift-detail-heading">
      <div className="calendar-detail-heading"><div><p className="goal-kind">SAVED ZWIFT {openZwift.option_type.toUpperCase()} · NOT COMPLETED</p><h3 id="calendar-zwift-detail-heading">{openZwift.name}</h3></div>{closeButton}</div>
      <p>{dateLabel(openZwift.option_date)}{openZwift.option_time ? ` · ${openZwift.option_time.slice(0, 5)}` : ''}</p>
      <p><strong>Route:</strong> {openZwift.route}</p>
      {linkedToGoal(openZwift, goal) ? <p>Associated with your Primary active goal.</p> : openZwift.goal_name ? <p>Saved for an earlier goal: {openZwift.goal_name}</p> : null}
      {openZwift.notes ? <p>{openZwift.notes}</p> : null}
      <a href={openZwift.url} target="_blank" rel="noopener noreferrer">Open in Zwift</a>
    </section> : null}
  </section>
}
