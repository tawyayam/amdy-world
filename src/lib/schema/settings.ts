import { z } from 'zod'
import { SCHEMA_VERSION } from './common'
import { DEFAULT_CHARACTER_NAME } from '@/lib/copy'
import { isoDateTime } from './common'
import type { Settings } from '@/lib/types'

/** Saved timeline display preferences; optional so older data stays valid. */
export const timelineViewSchema = z.object({
  groupBy: z.enum(['day', 'week', 'skill']),
  sort: z.enum(['newest', 'oldest']),
  layout: z.enum(['list', 'grid']),
})

/** Longest allowed character name, shared by validation and the name input. */
export const CHARACTER_NAME_MAX_LENGTH = 30

export const settingsSchema: z.ZodType<Settings> = z.object({
  characterName: z.string().min(1).max(CHARACTER_NAME_MAX_LENGTH),
  schemaVersion: z.number().int().positive(),
  timelineView: timelineViewSchema.optional(),
  lastExportedAt: isoDateTime.optional(),
  onboardedAt: isoDateTime.optional(),
})

/** Fresh settings for a new install or when none have been saved yet. */
export function createDefaultSettings(): Settings {
  return {
    characterName: DEFAULT_CHARACTER_NAME,
    schemaVersion: SCHEMA_VERSION,
  }
}
