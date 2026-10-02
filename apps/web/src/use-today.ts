import { useEffect, useState } from 'react'
import { calendarDateKey } from './calendar-date'

/** The Cyclist's local date, updated when it rolls over while the tab stays open. */
export function useToday(timeZone: string) {
  const [today, setToday] = useState(() => calendarDateKey(new Date(), timeZone))
  useEffect(() => {
    const update = () => setToday(calendarDateKey(new Date(), timeZone))
    update()
    const timer = window.setInterval(update, 60_000)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [timeZone])
  return today
}
