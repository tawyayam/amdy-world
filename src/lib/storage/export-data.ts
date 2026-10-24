import { SCHEMA_VERSION } from '@/lib/schema/common'
import { nowIso } from './records'
import type {
  DailyGoal,
  Entry,
  ExportData,
  GoalTemplate,
  Quest,
  Settings,
  Tag,
} from '@/lib/types'

interface ExportDataInput {
  entries: Entry[]
  quests: Quest[]
  tags: Tag[]
  goalTemplates: GoalTemplate[]
  dailyGoals: DailyGoal[]
  settings: Settings
}

/** Wraps record collections into a versioned export payload. */
export function createExportData(input: ExportDataInput): ExportData {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowIso(),
    ...input,
  }
}
