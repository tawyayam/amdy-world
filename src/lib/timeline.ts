// Timeline shaping: filter the log, then bucket it for display according to the
// saved view options (group by day/week/skill, sort, layout). Pure, so the page
// only maps over the result.

import { TIMELINE_COPY } from '@/lib/copy'
import {
  previousDateKey,
  startOfWeekDateKey,
  toLocalDateKey,
  type DateKey,
} from '@/lib/day'
import { sortEntriesNewestFirst } from '@/lib/entries'
import { formatDateKeyLong, formatDateKeyShort } from '@/lib/format'
import { summarizeGoalsByDay, type GoalDaySummary } from '@/lib/goals'
import type { SkillId } from '@/lib/skills'
import { SKILLS } from '@/lib/skills'
import type {
  DailyGoal,
  Entry,
  EntryType,
  TimelineSort,
  TimelineViewOptions,
} from '@/lib/types'

/** Selected timeline filters; `all` means "do not narrow this dimension". */
export interface TimelineFilters {
  type: EntryType | 'all'
  skillId: SkillId | 'all'
  /** Free text matched against an entry's text and book title. */
  query: string
}

export const DEFAULT_TIMELINE_FILTERS: TimelineFilters = {
  type: 'all',
  skillId: 'all',
  query: '',
}

/** True when any filter narrows the log (so the toolbar can offer a reset). */
export function hasActiveTimelineFilters(filters: TimelineFilters): boolean {
  return filters.skillId !== 'all' || filters.query.trim() !== ''
}

export const DEFAULT_TIMELINE_VIEW: TimelineViewOptions = {
  groupBy: 'day',
  sort: 'newest',
  layout: 'list',
}

/**
 * Coerces a stored view preference into the current shape so old data still
 * loads: a retired `density` is dropped (layout defaults to `list`), and a
 * retired `groupBy: 'type'` falls back to `day`. Unknown values also fall back.
 */
export function normalizeTimelineView(
  value: Partial<TimelineViewOptions> | undefined,
): TimelineViewOptions {
  const groupBy = value?.groupBy
  return {
    groupBy: groupBy === 'week' || groupBy === 'skill' ? groupBy : 'day',
    sort: value?.sort === 'oldest' ? 'oldest' : 'newest',
    layout: value?.layout === 'grid' ? 'grid' : 'list',
  }
}

/** One local day of the timeline, newest entries first. */
export interface TimelineDay {
  dateKey: DateKey
  entries: Entry[]
}

/** One rendered section of the timeline: a heading and its entries. */
export interface TimelineGroup {
  key: string
  heading: string
  entries: Entry[]
  /** Done/total daily goals for the day, when that day has goals. */
  goals?: GoalDaySummary
}

/**
 * Case-insensitive text match against an entry's text and book title. Lower
 * casing is a no-op for Arabic, so mixed scripts all match; an empty query
 * matches everything.
 */
function matchesQuery(entry: Entry, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = `${entry.text} ${entry.meta?.bookTitle ?? ''}`.toLowerCase()
  return haystack.includes(needle)
}

/** Keeps only entries matching the type, skill, and text filters. */
export function filterEntries(
  entries: readonly Entry[],
  filters: TimelineFilters,
): Entry[] {
  return entries.filter(
    (entry) =>
      entry.type !== 'note' &&
      (filters.skillId === 'all' || entry.skillId === filters.skillId) &&
      matchesQuery(entry, filters.query),
  )
}

/** Buckets entries into local days, newest day first. */
export function groupEntriesByDay(
  entries: readonly Entry[],
  timeZone: string,
): TimelineDay[] {
  const days = new Map<DateKey, Entry[]>()
  for (const entry of entries) {
    const dateKey = toLocalDateKey(entry.createdAt, timeZone)
    const bucket = days.get(dateKey)
    if (bucket) bucket.push(entry)
    else days.set(dateKey, [entry])
  }
  return [...days.entries()]
    .sort(([first], [second]) => second.localeCompare(first))
    .map(([dateKey, dayEntries]) => ({
      dateKey,
      entries: sortEntriesNewestFirst(dayEntries),
    }))
}

/** "Today", "Yesterday", or a long date, for a timeline day heading. */
export function dayHeading(dateKey: DateKey, todayKey: DateKey): string {
  if (dateKey === todayKey) return TIMELINE_COPY.today
  if (dateKey === previousDateKey(todayKey)) return TIMELINE_COPY.yesterday
  return formatDateKeyLong(dateKey)
}

/** Lists entries newest or oldest first, per the chosen sort. */
function sortEntries(entries: readonly Entry[], sort: TimelineSort): Entry[] {
  const newestFirst = sortEntriesNewestFirst(entries)
  return sort === 'newest' ? newestFirst : newestFirst.reverse()
}

function groupByDay(
  entries: readonly Entry[],
  view: TimelineViewOptions,
  timeZone: string,
  todayKey: DateKey,
  goals: readonly DailyGoal[],
): TimelineGroup[] {
  const summaries = summarizeGoalsByDay(goals, todayKey)
  // Only days that have entries get a group; a day with goals but nothing logged
  // has no timeline of its own, so it is not synthesized here. Days that do have
  // entries keep their compact "Goals X/Y" annotation.
  const groups = groupEntriesByDay(entries, timeZone).map((day) => {
    const summary = summaries.get(day.dateKey)
    return {
      key: day.dateKey,
      heading: dayHeading(day.dateKey, todayKey),
      entries: sortEntries(day.entries, view.sort),
      ...(summary ? { goals: summary } : {}),
    }
  })

  return view.sort === 'newest' ? groups : groups.reverse()
}

function groupByWeek(
  entries: readonly Entry[],
  view: TimelineViewOptions,
  timeZone: string,
): TimelineGroup[] {
  const weeks = new Map<DateKey, Entry[]>()
  for (const entry of entries) {
    const weekKey = startOfWeekDateKey(
      toLocalDateKey(entry.createdAt, timeZone),
    )
    const bucket = weeks.get(weekKey)
    if (bucket) bucket.push(entry)
    else weeks.set(weekKey, [entry])
  }
  const groups = [...weeks.entries()]
    .sort(([first], [second]) => second.localeCompare(first))
    .map(([weekKey, weekEntries]) => ({
      key: weekKey,
      heading: TIMELINE_COPY.weekOf(formatDateKeyShort(weekKey)),
      entries: sortEntries(weekEntries, view.sort),
    }))
  return view.sort === 'newest' ? groups : groups.reverse()
}

function groupBySkill(
  entries: readonly Entry[],
  view: TimelineViewOptions,
): TimelineGroup[] {
  const groups: TimelineGroup[] = []
  for (const skill of SKILLS) {
    const skillEntries = entries.filter((entry) => entry.skillId === skill.id)
    if (skillEntries.length > 0) {
      groups.push({
        key: skill.id,
        heading: skill.name,
        entries: sortEntries(skillEntries, view.sort),
      })
    }
  }
  const withoutSkill = entries.filter((entry) => entry.skillId === null)
  if (withoutSkill.length > 0) {
    groups.push({
      key: 'none',
      heading: TIMELINE_COPY.noSkill,
      entries: sortEntries(withoutSkill, view.sort),
    })
  }
  return groups
}

/** Groups and orders the filtered log the way the chosen view asks for. */
export function shapeTimeline(
  entries: readonly Entry[],
  view: TimelineViewOptions,
  timeZone: string,
  todayKey: DateKey,
  goals: readonly DailyGoal[] = [],
): TimelineGroup[] {
  const withoutNotes = entries.filter((entry) => entry.type !== 'note')
  switch (view.groupBy) {
    case 'day':
      return groupByDay(withoutNotes, view, timeZone, todayKey, goals)
    case 'week':
      return groupByWeek(withoutNotes, view, timeZone)
    case 'skill':
      return groupBySkill(withoutNotes, view)
  }
}
