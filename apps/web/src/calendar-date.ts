export function calendarDateKey(date: Date, timeZone: string) {
  let format: Intl.DateTimeFormat
  // An unknown stored zone falls back to UTC rather than crashing every date-dependent view.
  try { format = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }) }
  catch { format = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }) }
  const parts = format.formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

/** Formats a calendar date key (YYYY-MM-DD) without shifting it through a time zone. */
export function dateLabel(dateKey: string, options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) {
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' }).format(new Date(`${dateKey}T12:00:00Z`))
}

export function displayTimestamp(timestamp: string, timeZone: string) {
  try { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(new Date(timestamp)) }
  catch { return new Date(timestamp).toLocaleString() }
}
