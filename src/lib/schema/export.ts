import { z } from 'zod'
import { isoDateTime } from './common'
import { entrySchema } from './entry'
import { dailyGoalSchema, goalTemplateSchema } from './goals'
import { questSchema } from './quest'
import { settingsSchema } from './settings'
import { tagSchema } from './tag'
import type { ExportData } from '@/lib/types'

export const exportDataSchema: z.ZodType<ExportData> = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: isoDateTime,
  entries: z.array(entrySchema),
  quests: z.array(questSchema),
  tags: z.array(tagSchema),
  goalTemplates: z.array(goalTemplateSchema),
  dailyGoals: z.array(dailyGoalSchema),
  settings: settingsSchema,
})

/** Old quests predate `skillId`, `tagIds`, and `kind`; give them the defaults. */
function normalizeQuests(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  return value.map((quest) => {
    if (typeof quest !== 'object' || quest === null) return quest
    const record = quest as Record<string, unknown>
    return {
      ...record,
      skillId: record.skillId ?? 'programming',
      tagIds: Array.isArray(record.tagIds) ? record.tagIds : [],
      kind: record.kind === 'counter' ? 'counter' : 'steps',
    }
  })
}

/**
 * Older settings carried a timeline `density` instead of `layout`, and could
 * group by `type`, which was retired. Keep the sort, drop the retired field,
 * map an unknown or retired `groupBy` to `day`, and default the layout to
 * `list`, so an old file still imports.
 */
function normalizeSettings(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value
  const settings = value as Record<string, unknown>
  const timelineView = settings.timelineView
  const normalized = { ...settings }
  if (typeof timelineView !== 'object' || timelineView === null) {
    return normalized
  }
  const view = timelineView as Record<string, unknown>
  const groupBy = view.groupBy
  return {
    ...normalized,
    timelineView: {
      groupBy: groupBy === 'type' ? 'day' : (groupBy ?? 'day'),
      sort: view.sort === 'oldest' ? 'oldest' : 'newest',
      layout: view.layout === 'grid' ? 'grid' : 'list',
    },
  }
}

/**
 * Fills in fields added after the first export format so older files stay
 * importable: quests without a skill or tags, payloads without a tag list, and
 * settings whose timeline view predates the `layout` option.
 */
function withImportDefaults(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input
  const record = input as Record<string, unknown>
  return {
    ...record,
    quests: normalizeQuests(record.quests),
    tags: Array.isArray(record.tags) ? record.tags : [],
    settings: normalizeSettings(record.settings),
  }
}

/**
 * Validates an untrusted import payload with Zod. Throws `ZodError` when the
 * payload does not match the export format, so nothing is written on failure.
 */
export function parseExportData(input: unknown): ExportData {
  return exportDataSchema.parse(withImportDefaults(input))
}
