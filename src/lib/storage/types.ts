import type {
  DailyGoal,
  Entry,
  ExportData,
  GoalTemplate,
  Quest,
  Settings,
  Tag,
} from '@/lib/types'

/**
 * The only door between the app and persistence. Business logic and UI depend on
 * this interface, never on Dexie or IndexedDB, so a server-backed `ApiAdapter`
 * can replace `DexieAdapter` by changing one line in `src/lib/storage/index.ts`.
 *
 * Conventions:
 * - `list*` returns only live records (`deletedAt === null`), oldest first by
 *   `createdAt` with `id` as a stable tie-breaker.
 * - `delete*` is a soft delete: it stamps `deletedAt` and `updatedAt` and keeps
 *   the record so sync and export stay lossless.
 * - `exportAll` snapshots everything, including soft-deleted records.
 * - Callers own `id`, `createdAt`, and `updatedAt` (see `createSyncFields`).
 */
export interface StorageAdapter {
  listEntries(): Promise<Entry[]>
  saveEntry(entry: Entry): Promise<Entry>
  deleteEntry(id: string): Promise<void>

  listQuests(): Promise<Quest[]>
  saveQuest(quest: Quest): Promise<Quest>
  deleteQuest(id: string): Promise<void>

  listTags(): Promise<Tag[]>
  saveTag(tag: Tag): Promise<Tag>
  deleteTag(id: string): Promise<void>

  listGoalTemplates(): Promise<GoalTemplate[]>
  saveGoalTemplate(template: GoalTemplate): Promise<GoalTemplate>
  deleteGoalTemplate(id: string): Promise<void>

  listDailyGoals(): Promise<DailyGoal[]>
  /**
   * Every daily goal ever stored, soft-deleted ones included, oldest first.
   * `ensureTodayGoals` needs this so a goal the person deleted for today is not
   * recreated from its template on the next run.
   */
  listDailyGoalsIncludingDeleted(): Promise<DailyGoal[]>
  saveDailyGoal(goal: DailyGoal): Promise<DailyGoal>
  deleteDailyGoal(id: string): Promise<void>

  getSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<Settings>

  exportAll(): Promise<ExportData>
  importAll(data: ExportData): Promise<void>

  /** Hard-deletes every record, including settings. Used by "reset all data". */
  clearAll(): Promise<void>

  /** Hard-deletes only records flagged `isSample`, leaving real data intact. */
  removeSampleData(): Promise<void>
}
