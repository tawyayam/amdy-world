import { useEffect, useMemo, useState } from 'react'
import { toLocalDateKey } from '@/lib/day'

/** Current local day context shared across screens. */
export interface TodayInfo {
  now: Date
  todayKey: string
  timeZone: string
  hour: number
}

const MINUTE_MS = 60 * 1000

/**
 * Current local day context: the `YYYY-MM-DD` day key, the IANA time zone, and
 * the local hour. It refreshes every minute and when the tab becomes visible, so
 * the greeting and "today" grouping stay correct across midnight.
 */
export function useToday(): TodayInfo {
  const [now, setNow] = useState(() => new Date())
  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  )

  useEffect(() => {
    const tick = () => setNow(new Date())
    const interval = window.setInterval(tick, MINUTE_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  return useMemo(
    () => ({
      now,
      timeZone,
      todayKey: toLocalDateKey(now.toISOString(), timeZone),
      hour: now.getHours(),
    }),
    [now, timeZone],
  )
}
