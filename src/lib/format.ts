// Locale-aware formatting for dates and times, using `Intl` with the browser
// locale. Pure: the same input always formats the same way for a given locale.

import { fromDateKey } from '@/lib/day'

/** Long, friendly date such as "Tuesday, October 13". */
export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/** The same long date for a local `YYYY-MM-DD` key. */
export function formatDateKeyLong(dateKey: string): string {
  const { year, month, day } = fromDateKey(dateKey)
  return formatLongDate(new Date(year, month - 1, day))
}

/** Short date such as "Oct 13", for dense headings like a week label. */
export function formatDateKeyShort(dateKey: string): string {
  const { year, month, day } = fromDateKey(dateKey)
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, day))
}

/** Local clock time such as "9:05 AM". */
export function formatTime(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

/** Date and time such as "Oct 13, 9:05 AM", for a stored ISO timestamp. */
export function formatDateTime(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}
