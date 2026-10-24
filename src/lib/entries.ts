// Pure helpers for showing entries. They keep day-grouping and sorting out of
// the components, which only render what they are given.

import { toLocalDateKey } from '@/lib/day'
import type { Entry } from '@/lib/types'

export type EntryDetailSegment =
  { kind: 'text'; value: string } | { kind: 'user'; value: string }

/** Newest first, so the most recent log sits on top. Returns a copy. */
export function sortEntriesNewestFirst(entries: readonly Entry[]): Entry[] {
  return [...entries].sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt),
  )
}

/** Live entries whose local day is `todayKey`, newest first. */
export function entriesForDay(
  entries: readonly Entry[],
  todayKey: string,
  timeZone: string,
): Entry[] {
  return sortEntriesNewestFirst(
    entries.filter(
      (entry) => toLocalDateKey(entry.createdAt, timeZone) === todayKey,
    ),
  )
}

/** Short meta line for reading and session entries; empty for the rest. */
export function entryDetail(entry: Entry): string {
  if (entry.type === 'reading') {
    const parts: string[] = []
    if (entry.meta?.pages !== undefined) parts.push(`${entry.meta.pages} pages`)
    if (entry.meta?.bookTitle) parts.push(entry.meta.bookTitle)
    return parts.join(' · ')
  }
  if (entry.type === 'session' && entry.meta?.minutes !== undefined) {
    return `${entry.meta.minutes} min`
  }
  return ''
}

/** Segments for rendering the meta line with correct bidi order. */
export function entryDetailSegments(entry: Entry): EntryDetailSegment[] {
  if (entry.type === 'reading') {
    const segments: EntryDetailSegment[] = []
    if (entry.meta?.pages !== undefined) {
      segments.push({ kind: 'text', value: `${entry.meta.pages} pages` })
    }
    if (entry.meta?.bookTitle) {
      segments.push({ kind: 'user', value: entry.meta.bookTitle })
    }
    return segments
  }
  if (entry.type === 'session' && entry.meta?.minutes !== undefined) {
    return [{ kind: 'text', value: `${entry.meta.minutes} min` }]
  }
  return []
}

/** The most recent entries for one skill, newest first. */
export function recentEntriesForSkill(
  entries: readonly Entry[],
  skillId: string,
  limit: number,
): Entry[] {
  return sortEntriesNewestFirst(
    entries.filter((entry) => entry.skillId === skillId),
  ).slice(0, limit)
}
