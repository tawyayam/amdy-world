import { createDefaultSettings } from '@/lib/schema/settings'
import { createExportData } from './export-data'
import { isAlive, nowIso, sortByCreatedAt } from './records'
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

/**
 * In-memory adapter with the same contract as `DexieAdapter`. Used in tests so
 * the adapter contract runs without IndexedDB, and useful for future previews.
 */
export class InMemoryAdapter implements StorageAdapter {
  private readonly entries = new Map<string, Entry>()
  private readonly quests = new Map<string, Quest>()
  private readonly tags = new Map<string, Tag>()
  private readonly goalTemplates = new Map<string, GoalTemplate>()
  private readonly dailyGoals = new Map<string, DailyGoal>()
  private settings: Settings = createDefaultSettings()

  async listEntries(): Promise<Entry[]> {
    return liveSorted(this.entries)
  }

  async saveEntry(entry: Entry): Promise<Entry> {
    this.entries.set(entry.id, clone(entry))
    return entry
  }

  async deleteEntry(id: string): Promise<void> {
    softDelete(this.entries, id)
  }

  async listQuests(): Promise<Quest[]> {
    return liveSorted(this.quests)
  }

  async saveQuest(quest: Quest): Promise<Quest> {
    this.quests.set(quest.id, clone(quest))
    return quest
  }

  async deleteQuest(id: string): Promise<void> {
    softDelete(this.quests, id)
  }

  async listTags(): Promise<Tag[]> {
    return liveSorted(this.tags)
  }

  async saveTag(tag: Tag): Promise<Tag> {
    this.tags.set(tag.id, clone(tag))
    return tag
  }

  async deleteTag(id: string): Promise<void> {
    softDelete(this.tags, id)
  }

  async listGoalTemplates(): Promise<GoalTemplate[]> {
    return liveSorted(this.goalTemplates)
  }

  async saveGoalTemplate(template: GoalTemplate): Promise<GoalTemplate> {
    this.goalTemplates.set(template.id, clone(template))
    return template
  }

  async deleteGoalTemplate(id: string): Promise<void> {
    softDelete(this.goalTemplates, id)
  }

  async listDailyGoals(): Promise<DailyGoal[]> {
    return liveSorted(this.dailyGoals)
  }

  async listDailyGoalsIncludingDeleted(): Promise<DailyGoal[]> {
    return sortByCreatedAt([...this.dailyGoals.values()].map(clone))
  }

  async saveDailyGoal(goal: DailyGoal): Promise<DailyGoal> {
    this.dailyGoals.set(goal.id, clone(goal))
    return goal
  }

  async deleteDailyGoal(id: string): Promise<void> {
    softDelete(this.dailyGoals, id)
  }

  async getSettings(): Promise<Settings> {
    const s = this.settings
    return Promise.resolve({
      characterName: s.characterName,
      schemaVersion: s.schemaVersion,
      ...(s.timelineView ? { timelineView: s.timelineView } : {}),
      ...(s.lastExportedAt ? { lastExportedAt: s.lastExportedAt } : {}),
      ...(s.onboardedAt ? { onboardedAt: s.onboardedAt } : {}),
    })
  }

  async saveSettings(settings: Settings): Promise<Settings> {
    this.settings = clone(settings)
    return settings
  }

  async exportAll(): Promise<ExportData> {
    return createExportData({
      entries: [...this.entries.values()].map(clone),
      quests: [...this.quests.values()].map(clone),
      tags: [...this.tags.values()].map(clone),
      goalTemplates: [...this.goalTemplates.values()].map(clone),
      dailyGoals: [...this.dailyGoals.values()].map(clone),
      settings: clone(this.settings),
    })
  }

  async importAll(data: ExportData): Promise<void> {
    // Build every map before touching current state, so a malformed payload (for
    // example a missing collection) throws first and leaves existing data intact.
    const entries = indexById(data.entries)
    const quests = indexById(data.quests)
    const tags = indexById(data.tags)
    const goalTemplates = indexById(data.goalTemplates)
    const dailyGoals = indexById(data.dailyGoals)
    const settings = clone(data.settings)

    replaceContents(this.entries, entries)
    replaceContents(this.quests, quests)
    replaceContents(this.tags, tags)
    replaceContents(this.goalTemplates, goalTemplates)
    replaceContents(this.dailyGoals, dailyGoals)
    this.settings = settings
  }

  async clearAll(): Promise<void> {
    this.entries.clear()
    this.quests.clear()
    this.tags.clear()
    this.goalTemplates.clear()
    this.dailyGoals.clear()
    this.settings = createDefaultSettings()
  }

  async removeSampleData(): Promise<void> {
    removeSamples(this.entries)
    removeSamples(this.quests)
    removeSamples(this.tags)
    removeSamples(this.goalTemplates)
    removeSamples(this.dailyGoals)
  }
}

function clone<T>(value: T): T {
  return globalThis.structuredClone(value)
}

function indexById<T extends { id: string }>(
  records: readonly T[],
): Map<string, T> {
  return new Map(records.map((record) => [record.id, clone(record)]))
}

function replaceContents<T>(
  target: Map<string, T>,
  source: Map<string, T>,
): void {
  target.clear()
  for (const [id, record] of source) {
    target.set(id, record)
  }
}

function liveSorted<
  T extends { createdAt: string; id: string; deletedAt: string | null },
>(records: Map<string, T>): Promise<T[]> {
  return Promise.resolve(
    sortByCreatedAt([...records.values()].filter(isAlive).map(clone)),
  )
}

function softDelete<
  T extends { id: string; updatedAt: string; deletedAt: string | null },
>(records: Map<string, T>, id: string): Promise<void> {
  const record = records.get(id)
  if (record) {
    const timestamp = nowIso()
    records.set(id, { ...record, deletedAt: timestamp, updatedAt: timestamp })
  }
  return Promise.resolve()
}

function removeSamples<T extends { isSample?: boolean }>(
  records: Map<string, T>,
): void {
  for (const [id, record] of records) {
    if (record.isSample === true) {
      records.delete(id)
    }
  }
}
