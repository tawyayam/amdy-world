// Local-day helpers. Streaks and the timeline group activity by the device's
// local day, so every function here takes an explicit time zone (an IANA name) and
// never reads the clock. Calendar arithmetic works on `YYYY-MM-DD` keys, which
// are time-zone independent, so it is safe across daylight-saving changes.

import type { Weekday } from '@/lib/types'

/** A local calendar day key in `YYYY-MM-DD` form. */
export type DateKey = string

const dateKeyFormatters = new Map<string, Intl.DateTimeFormat>()

function dateKeyFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = dateKeyFormatters.get(timeZone)
  if (cached) return cached
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  dateKeyFormatters.set(timeZone, formatter)
  return formatter
}

/** The local `YYYY-MM-DD` day an ISO UTC timestamp falls on, in `timeZone`. */
export function toLocalDateKey(timestamp: string, timeZone: string): DateKey {
  const parts = dateKeyFormatter(timeZone).formatToParts(new Date(timestamp))
  const values: Record<string, string> = {}
  for (const part of parts) {
    values[part.type] = part.value
  }
  return `${values.year}-${values.month}-${values.day}`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Builds a `YYYY-MM-DD` key from its parts. */
export function toDateKey(year: number, month: number, day: number): DateKey {
  return `${year}-${pad(month)}-${pad(day)}`
}

/** Splits a `YYYY-MM-DD` key into its numeric parts. */
export function fromDateKey(dateKey: DateKey): {
  year: number
  month: number
  day: number
} {
  const [year, month, day] = dateKey.split('-').map(Number)
  return { year, month, day }
}

/** The calendar day before `dateKey`, independent of any time zone. */
export function previousDateKey(dateKey: DateKey): DateKey {
  const { year, month, day } = fromDateKey(dateKey)
  const previousDay = new Date(Date.UTC(year, month - 1, day - 1))
  return toDateKey(
    previousDay.getUTCFullYear(),
    previousDay.getUTCMonth() + 1,
    previousDay.getUTCDate(),
  )
}

/**
 * Whole calendar days from `fromKey` to `toKey`. Both keys are treated as UTC
 * midnights, so the result counts dates, not elapsed hours, and is safe across
 * daylight-saving changes.
 */
export function daysBetweenDateKeys(fromKey: DateKey, toKey: DateKey): number {
  const from = Date.parse(`${fromKey}T00:00:00.000Z`)
  const to = Date.parse(`${toKey}T00:00:00.000Z`)
  return Math.round((to - from) / 86_400_000)
}

/**
 * True when `dateKey` falls after `referenceKey`. `YYYY-MM-DD` keys sort
 * chronologically as plain strings, so this is a direct comparison. Used to
 * ignore future-dated records: a goal dated after today is not "today's".
 */
export function isDateKeyAfter(
  dateKey: DateKey,
  referenceKey: DateKey,
): boolean {
  return dateKey > referenceKey
}

/** The weekday of a `YYYY-MM-DD` key, matching `Date.getDay()` (0 = Sunday). */
export function dateKeyWeekday(dateKey: DateKey): Weekday {
  const { year, month, day } = fromDateKey(dateKey)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() as Weekday
}

/** The Monday of the week containing `dateKey`; weeks start on Monday. */
export function startOfWeekDateKey(dateKey: DateKey): DateKey {
  const { year, month, day } = fromDateKey(dateKey)
  const daysSinceMonday = (dateKeyWeekday(dateKey) + 6) % 7
  const monday = new Date(Date.UTC(year, month - 1, day - daysSinceMonday))
  return toDateKey(
    monday.getUTCFullYear(),
    monday.getUTCMonth() + 1,
    monday.getUTCDate(),
  )
}
