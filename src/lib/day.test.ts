import { describe, expect, it } from 'vitest'
import {
  dateKeyWeekday,
  fromDateKey,
  isDateKeyAfter,
  previousDateKey,
  startOfWeekDateKey,
  toDateKey,
  toLocalDateKey,
} from '@/lib/day'

describe('toLocalDateKey', () => {
  it('formats a timestamp as the local day in the given time zone', () => {
    expect(toLocalDateKey('2026-10-13T08:30:00.000Z', 'UTC')).toBe('2026-10-13')
  })

  it('shifts the day back when the local time is before midnight UTC', () => {
    // 02:00 UTC is 21:00 the previous day in New York (UTC-5 in winter).
    expect(toLocalDateKey('2026-01-05T02:00:00.000Z', 'America/New_York')).toBe(
      '2026-01-04',
    )
  })

  it('shifts the day forward when the local time is after midnight UTC', () => {
    // 23:00 UTC is 08:00 the next day in Tokyo (UTC+9).
    expect(toLocalDateKey('2026-01-05T23:00:00.000Z', 'Asia/Tokyo')).toBe(
      '2026-01-06',
    )
  })
})

describe('toDateKey / fromDateKey', () => {
  it('pads single-digit months and days', () => {
    expect(toDateKey(2026, 1, 5)).toBe('2026-01-05')
    expect(fromDateKey('2026-01-05')).toEqual({ year: 2026, month: 1, day: 5 })
  })
})

describe('previousDateKey', () => {
  it('walks back within a month', () => {
    expect(previousDateKey('2026-10-13')).toBe('2026-10-12')
  })

  it('crosses a month boundary', () => {
    expect(previousDateKey('2026-03-01')).toBe('2026-02-28')
  })

  it('crosses a year boundary', () => {
    expect(previousDateKey('2026-01-01')).toBe('2025-12-31')
  })

  it('handles a leap day', () => {
    expect(previousDateKey('2028-03-01')).toBe('2028-02-29')
  })
})

describe('isDateKeyAfter', () => {
  it('is true only when the key is later than the reference', () => {
    expect(isDateKeyAfter('2026-10-14', '2026-10-13')).toBe(true)
    expect(isDateKeyAfter('2026-10-13', '2026-10-13')).toBe(false)
    expect(isDateKeyAfter('2026-10-12', '2026-10-13')).toBe(false)
  })

  it('compares across month and year boundaries', () => {
    expect(isDateKeyAfter('2026-11-01', '2026-10-31')).toBe(true)
    expect(isDateKeyAfter('2027-01-01', '2026-12-31')).toBe(true)
  })
})

describe('dateKeyWeekday', () => {
  it('returns 0 for a Sunday and 6 for a Saturday', () => {
    expect(dateKeyWeekday('2026-10-11')).toBe(0)
    expect(dateKeyWeekday('2026-10-17')).toBe(6)
  })

  it('returns the matching weekday for a known date', () => {
    // 2026-10-13 is a Tuesday.
    expect(dateKeyWeekday('2026-10-13')).toBe(2)
  })
})

describe('startOfWeekDateKey', () => {
  it('returns the same day for a Monday', () => {
    expect(startOfWeekDateKey('2026-10-12')).toBe('2026-10-12')
  })

  it('walks back to Monday from mid-week', () => {
    expect(startOfWeekDateKey('2026-10-14')).toBe('2026-10-12')
    expect(startOfWeekDateKey('2026-10-17')).toBe('2026-10-12')
  })

  it('treats Sunday as the end of the previous week', () => {
    expect(startOfWeekDateKey('2026-10-11')).toBe('2026-10-05')
  })

  it('crosses a month boundary', () => {
    // 2026-11-01 is a Sunday, so its week starts on Monday 2026-10-26.
    expect(startOfWeekDateKey('2026-11-01')).toBe('2026-10-26')
  })
})
