import { createSyncFields } from './records'
import type { StorageAdapter } from './types'
import type { DailyGoal, Entry, GoalTemplate, Quest, Tag } from '@/lib/types'

export function entryFixture(overrides: Partial<Entry> = {}): Entry {
  return {
    ...createSyncFields(),
    type: 'learned',
    text: 'Learned something',
    skillId: 'learning',
    ...overrides,
  }
}

export function questFixture(overrides: Partial<Quest> = {}): Quest {
  return {
    ...createSyncFields(),
    title: 'Build Amdy.world',
    description: 'Ship the RPG tracker',
    status: 'active',
    skillId: 'programming',
    tagIds: [],
    kind: 'steps',
    steps: [],
    ...overrides,
  }
}

export function tagFixture(overrides: Partial<Tag> = {}): Tag {
  return {
    ...createSyncFields(),
    name: 'frontend',
    ...overrides,
  }
}

export function templateFixture(
  overrides: Partial<GoalTemplate> = {},
): GoalTemplate {
  return {
    ...createSyncFields(),
    title: 'Read 30 pages',
    skillId: 'reading',
    days: [0, 1, 2, 3, 4, 5, 6],
    active: true,
    ...overrides,
  }
}

export function goalFixture(overrides: Partial<DailyGoal> = {}): DailyGoal {
  return {
    ...createSyncFields(),
    date: '2026-10-13',
    title: 'Read 10 pages',
    skillId: 'reading',
    templateId: null,
    done: false,
    doneAt: null,
    ...overrides,
  }
}

/** An adapter under test plus a way to release its resources after each test. */
export interface AdapterHarness {
  adapter: StorageAdapter
  dispose: () => void
}
