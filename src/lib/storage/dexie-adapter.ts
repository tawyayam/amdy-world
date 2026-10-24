import { createDefaultSettings } from '@/lib/schema/settings'
import {
  DEFAULT_DATABASE_NAME,
  SETTINGS_ROW_ID,
  createDatabase,
  type AmdyDatabase,
} from './dexie-database'
import { SoftDeleteCollection } from './dexie-collection'
import { isIndexedDbAvailable, StorageUnavailableError } from './errors'
import { createExportData } from './export-data'
import type { StorageAdapter } from './types'
import type {
  DailyGoal,
  Entry,
  ExportData,
  GoalTemplate,
  Quest,
  Settings,
  Tag,
} from '@/lib/types'

/** IndexedDB-backed adapter. The only module that imports Dexie. */
export class DexieAdapter implements StorageAdapter {
  private readonly database: AmdyDatabase
  private readonly entries: SoftDeleteCollection<Entry>
  private readonly quests: SoftDeleteCollection<Quest>
  private readonly tags: SoftDeleteCollection<Tag>
  private readonly goalTemplates: SoftDeleteCollection<GoalTemplate>
  private readonly dailyGoals: SoftDeleteCollection<DailyGoal>

  constructor(databaseName: string = DEFAULT_DATABASE_NAME) {
    this.database = createDatabase(databaseName)
    this.entries = new SoftDeleteCollection<Entry>(this.database.entries)
    this.quests = new SoftDeleteCollection<Quest>(this.database.quests)
    this.tags = new SoftDeleteCollection<Tag>(this.database.tags)
    this.goalTemplates = new SoftDeleteCollection<GoalTemplate>(
      this.database.goalTemplates,
    )
    this.dailyGoals = new SoftDeleteCollection<DailyGoal>(
      this.database.dailyGoals,
    )
  }

  /** Releases the IndexedDB connection. Used by tests; not part of the contract. */
  close(): void {
    this.database.close()
  }

  listEntries(): Promise<Entry[]> {
    return this.available(() => this.entries.list())
  }

  saveEntry(entry: Entry): Promise<Entry> {
    return this.available(() => this.entries.save(entry))
  }

  deleteEntry(id: string): Promise<void> {
    return this.available(() => this.entries.remove(id))
  }

  listQuests(): Promise<Quest[]> {
    return this.available(() => this.quests.list())
  }

  saveQuest(quest: Quest): Promise<Quest> {
    return this.available(() => this.quests.save(quest))
  }

  deleteQuest(id: string): Promise<void> {
    return this.available(() => this.quests.remove(id))
  }

  listTags(): Promise<Tag[]> {
    return this.available(() => this.tags.list())
  }

  saveTag(tag: Tag): Promise<Tag> {
    return this.available(() => this.tags.save(tag))
  }

  deleteTag(id: string): Promise<void> {
    return this.available(() => this.tags.remove(id))
  }

  listGoalTemplates(): Promise<GoalTemplate[]> {
    return this.available(() => this.goalTemplates.list())
  }

  saveGoalTemplate(template: GoalTemplate): Promise<GoalTemplate> {
    return this.available(() => this.goalTemplates.save(template))
  }

  deleteGoalTemplate(id: string): Promise<void> {
    return this.available(() => this.goalTemplates.remove(id))
  }

  listDailyGoals(): Promise<DailyGoal[]> {
    return this.available(() => this.dailyGoals.list())
  }

  listDailyGoalsIncludingDeleted(): Promise<DailyGoal[]> {
    return this.available(() => this.dailyGoals.listAll())
  }

  saveDailyGoal(goal: DailyGoal): Promise<DailyGoal> {
    return this.available(() => this.dailyGoals.save(goal))
  }

  deleteDailyGoal(id: string): Promise<void> {
    return this.available(() => this.dailyGoals.remove(id))
  }

  getSettings(): Promise<Settings> {
    return this.available(async () => {
      const row = await this.database.settings.get(SETTINGS_ROW_ID)
      if (!row) {
        return createDefaultSettings()
      }
      return {
        characterName: row.characterName,
        schemaVersion: row.schemaVersion,
        ...(row.timelineView ? { timelineView: row.timelineView } : {}),
        ...(row.lastExportedAt ? { lastExportedAt: row.lastExportedAt } : {}),
        ...(row.onboardedAt ? { onboardedAt: row.onboardedAt } : {}),
      }
    })
  }

  saveSettings(settings: Settings): Promise<Settings> {
    return this.available(async () => {
      await this.database.settings.put({ ...settings, id: SETTINGS_ROW_ID })
      return settings
    })
  }

  exportAll(): Promise<ExportData> {
    return this.available(async () => {
      const [entries, quests, tags, goalTemplates, dailyGoals, settings] =
        await Promise.all([
          this.database.entries.toArray(),
          this.database.quests.toArray(),
          this.database.tags.toArray(),
          this.database.goalTemplates.toArray(),
          this.database.dailyGoals.toArray(),
          this.getSettings(),
        ])
      return createExportData({
        entries,
        quests,
        tags,
        goalTemplates,
        dailyGoals,
        settings,
      })
    })
  }

  importAll(data: ExportData): Promise<void> {
    return this.available(() =>
      this.inTransaction(async () => {
        await this.clearTables()
        await Promise.all([
          this.database.entries.bulkPut(data.entries),
          this.database.quests.bulkPut(data.quests),
          this.database.tags.bulkPut(data.tags),
          this.database.goalTemplates.bulkPut(data.goalTemplates),
          this.database.dailyGoals.bulkPut(data.dailyGoals),
          this.database.settings.put({ ...data.settings, id: SETTINGS_ROW_ID }),
        ])
      }),
    )
  }

  clearAll(): Promise<void> {
    return this.available(() => this.inTransaction(() => this.clearTables()))
  }

  removeSampleData(): Promise<void> {
    const { entries, quests, tags, goalTemplates, dailyGoals } = this
    return this.available(() =>
      this.inTransaction(async () => {
        await Promise.all([
          entries.removeSamples(),
          quests.removeSamples(),
          tags.removeSamples(),
          goalTemplates.removeSamples(),
          dailyGoals.removeSamples(),
        ])
      }),
    )
  }

  private available<T>(operation: () => Promise<T>): Promise<T> {
    if (!isIndexedDbAvailable()) {
      return Promise.reject(new StorageUnavailableError())
    }
    return operation()
  }

  private inTransaction(operation: () => Promise<void>): Promise<void> {
    return this.database.transaction('rw', this.database.tables, operation)
  }

  private async clearTables(): Promise<void> {
    await Promise.all(this.database.tables.map((table) => table.clear()))
  }
}
