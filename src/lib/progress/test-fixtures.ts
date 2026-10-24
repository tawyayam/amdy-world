// Deterministic record builders for progress and goals tests. Not a `.test`
// file, so Vitest does not run it, and it is only imported by tests.

import type {
  DailyGoal,
  Entry,
  GoalTemplate,
  Quest,
  QuestStep,
} from '@/lib/types'

const TIMESTAMP = '2026-10-13T08:00:00.000Z'

export function entryFixture(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'entry-1',
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    deletedAt: null,
    type: 'learned',
    text: 'Learned something',
    skillId: 'learning',
    ...overrides,
  }
}

export function stepFixture(overrides: Partial<QuestStep> = {}): QuestStep {
  return {
    id: 'step-1',
    title: 'A step',
    done: false,
    doneAt: null,
    ...overrides,
  }
}

export function questFixture(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'quest-1',
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    deletedAt: null,
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

/** A counter quest fixture; override the counter fields or the quest itself. */
export function counterQuestFixture(
  counter: Partial<NonNullable<Quest['counter']>> = {},
  overrides: Partial<Quest> = {},
): Quest {
  return questFixture({
    title: 'Complete the TypeScript course',
    kind: 'counter',
    steps: [],
    counter: {
      unit: 'lesson',
      total: 12,
      startValue: 0,
      updates: [],
      ...counter,
    },
    ...overrides,
  })
}

export function templateFixture(
  overrides: Partial<GoalTemplate> = {},
): GoalTemplate {
  return {
    id: 'template-1',
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    deletedAt: null,
    title: 'Read 30 pages',
    skillId: 'reading',
    days: [0, 1, 2, 3, 4, 5, 6],
    active: true,
    ...overrides,
  }
}

export function goalFixture(overrides: Partial<DailyGoal> = {}): DailyGoal {
  return {
    id: 'goal-1',
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    deletedAt: null,
    date: '2026-10-13',
    title: 'Read 10 pages',
    skillId: 'reading',
    templateId: null,
    done: false,
    doneAt: null,
    ...overrides,
  }
}
