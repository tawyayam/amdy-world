import Dexie, { type EntityTable } from 'dexie'
import type {
  DailyGoal,
  Entry,
  GoalTemplate,
  Quest,
  Settings,
  Tag,
} from '@/lib/types'

export const DEFAULT_DATABASE_NAME = 'amdy-world'

/** Settings live in a single row, so they carry one fixed id. */
export const SETTINGS_ROW_ID = 'app'

export interface StoredSettings extends Settings {
  id: string
}

export type AmdyDatabase = Dexie & {
  entries: EntityTable<Entry, 'id'>
  quests: EntityTable<Quest, 'id'>
  tags: EntityTable<Tag, 'id'>
  goalTemplates: EntityTable<GoalTemplate, 'id'>
  dailyGoals: EntityTable<DailyGoal, 'id'>
  settings: EntityTable<StoredSettings, 'id'>
}

/**
 * Builds a typed Dexie database. Opening is lazy: IndexedDB is only touched on
 * the first query, so constructing this is safe even where IndexedDB is missing.
 * Booleans (`isSample`) and nulls (`deletedAt`) are not indexed because they are
 * not valid IndexedDB keys; those are filtered in JavaScript instead.
 */
export function createDatabase(name = DEFAULT_DATABASE_NAME): AmdyDatabase {
  const database = new Dexie(name) as AmdyDatabase
  database.version(1).stores({
    entries: 'id, createdAt',
    quests: 'id, createdAt',
    goalTemplates: 'id, createdAt',
    dailyGoals: 'id, createdAt, date',
    settings: 'id',
  })
  // v2 adds tags and gives quests the skill and tag fields they now require.
  database
    .version(2)
    .stores({
      entries: 'id, createdAt',
      quests: 'id, createdAt',
      tags: 'id, createdAt',
      goalTemplates: 'id, createdAt',
      dailyGoals: 'id, createdAt, date',
      settings: 'id',
    })
    .upgrade((transaction) =>
      transaction
        .table('quests')
        .toCollection()
        .modify((quest: Quest) => {
          quest.skillId = quest.skillId ?? 'programming'
          quest.tagIds = Array.isArray(quest.tagIds) ? quest.tagIds : []
        }),
    )
  // v3 adds the quest `kind` (and optional counter); no new indexes, so the
  // upgrade only fills the default kind on rows saved before it existed.
  database
    .version(3)
    .stores({
      entries: 'id, createdAt',
      quests: 'id, createdAt',
      tags: 'id, createdAt',
      goalTemplates: 'id, createdAt',
      dailyGoals: 'id, createdAt, date',
      settings: 'id',
    })
    .upgrade((transaction) =>
      transaction
        .table('quests')
        .toCollection()
        .modify((quest: Quest) => {
          quest.kind = quest.kind === 'counter' ? 'counter' : 'steps'
        }),
    )
  return database
}
