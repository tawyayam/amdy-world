// XP of a single entry. Pure: it reads only the entry's fields, so the quick
// capture screen can show "+15 XP · Learning" from the record it just saved.

import {
  IDEA_XP,
  LEARNED_XP,
  PROMOTE_IDEA_XP,
  READING_MAX_XP,
  READING_PAGES_PER_XP,
  SESSION_MAX_XP,
  SESSION_MINUTES_PER_XP,
} from './rules'
import type { Entry } from '@/lib/types'

function clamp(value: number, maximum: number): number {
  return Math.max(0, Math.min(maximum, value))
}

/** Reading XP: 1 per `READING_PAGES_PER_XP` pages, capped per entry. */
export function readingXp(pages: number | undefined): number {
  if (pages === undefined) return 0
  return clamp(Math.floor(pages / READING_PAGES_PER_XP), READING_MAX_XP)
}

/** Session XP: 1 per `SESSION_MINUTES_PER_XP` minutes, capped per entry. */
export function sessionXp(minutes: number | undefined): number {
  if (minutes === undefined) return 0
  return clamp(Math.floor(minutes / SESSION_MINUTES_PER_XP), SESSION_MAX_XP)
}

/** XP a single entry grants its skill; notes and unknown types grant none. */
export function xpForEntry(entry: Entry): number {
  switch (entry.type) {
    case 'learned':
      return LEARNED_XP
    case 'idea':
      return IDEA_XP + (entry.meta?.promotedToQuestId ? PROMOTE_IDEA_XP : 0)
    case 'reading':
      return readingXp(entry.meta?.pages)
    case 'session':
      return sessionXp(entry.meta?.minutes)
    case 'note':
      return 0
  }
}
