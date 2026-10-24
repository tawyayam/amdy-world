// Builds a small, believable demo history so the UI can be explored before any
// real data exists. It is pure except for id creation: every record is stamped
// `isSample` so it can be removed later, and timestamps are derived from the
// caller-supplied `now`, never from the clock.

import { SKILL_FOR_ENTRY_TYPE } from '@/lib/progress'
import { newId } from '@/lib/storage/records'
import type {
  DailyGoal,
  Entry,
  EntryMeta,
  EntryType,
  GoalTemplate,
  Quest,
  QuestStep,
  Tag,
  TagColor,
  Weekday,
} from '@/lib/types'

const HOUR_MS = 60 * 60 * 1000

const ALL_WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

/** Demo records ready to be saved through the storage adapter. */
export interface SampleData {
  entries: Entry[]
  quests: Quest[]
  tags: Tag[]
  goalTemplates: GoalTemplate[]
  dailyGoals: DailyGoal[]
}

/** The live records a sample count is taken from. */
export interface SampleCountable {
  entries: readonly Entry[]
  quests: readonly Quest[]
  tags: readonly Tag[]
  goalTemplates: readonly GoalTemplate[]
  dailyGoals: readonly DailyGoal[]
}

/** How many records are currently flagged as sample data. */
export function countSampleRecords(data: SampleCountable): number {
  const flagged = (record: { isSample?: boolean }) => record.isSample === true
  return (
    data.entries.filter(flagged).length +
    data.quests.filter(flagged).length +
    data.tags.filter(flagged).length +
    data.goalTemplates.filter(flagged).length +
    data.dailyGoals.filter(flagged).length
  )
}

function isoHoursAgo(nowMs: number, hours: number): string {
  return new Date(nowMs - hours * HOUR_MS).toISOString()
}

function step(title: string, doneAt: string | null): QuestStep {
  return { id: newId(), title, done: doneAt !== null, doneAt }
}

/**
 * Builds demo entries, quests, tags, and goals relative to `now` (an ISO
 * timestamp) so the sample history lands on the last few local days and the
 * streak looks alive. `todayKey` is the local day the sample daily goals belong
 * to; when it is omitted no daily goals are produced.
 */
export function buildSampleData(now: string, todayKey?: string): SampleData {
  const nowMs = Date.parse(now)

  const entry = (
    type: EntryType,
    text: string,
    hoursAgo: number,
    meta?: EntryMeta,
    id: string = newId(),
  ): Entry => {
    const createdAt = isoHoursAgo(nowMs, hoursAgo)
    return {
      id,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      type,
      text,
      skillId: SKILL_FOR_ENTRY_TYPE[type],
      meta,
      isSample: true,
    }
  }

  const promotedIdeaId = newId()
  const genericsQuestId = newId()
  const courseQuestId = newId()

  const tag = (name: string, colorToken: TagColor): Tag => {
    const createdAt = isoHoursAgo(nowMs, 130)
    return {
      id: newId(),
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      name,
      colorToken,
      isSample: true,
    }
  }

  const frontendTag = tag('frontend', 'purple')
  const booksTag = tag('books', 'teal')
  const courseTag = tag('course', 'orange')
  const arabicTag = tag('arabic', 'rose')
  const tags: Tag[] = [frontendTag, booksTag, courseTag, arabicTag]

  const entries: Entry[] = [
    entry('session', 'Built the quick capture form', 2, { minutes: 45 }),
    entry('learned', 'Learned about React Server Components', 3),
    entry('learned', 'راجعت مفاهيم JavaScript closures', 4),
    entry('learned', 'تعلّمت عن الفهرسة داخل IndexedDB', 5),
    entry(
      'note',
      'Module 3 was tough; the conditional types exercise finally clicked.',
      7,
      { questId: courseQuestId },
    ),
    entry(
      'note',
      'Started the course timer sessions; 5 of 12 lessons done.',
      19,
      { questId: courseQuestId },
    ),
    entry('reading', 'Finished a chapter of Deep Work', 26, {
      pages: 40,
      bookTitle: 'Deep Work',
    }),
    entry('idea', 'A habit tracker with streaks', 27),
    entry('note', 'Felt good about today.', 28),
    entry('idea', 'فكرة: أداة عربية لتتبّع العادات', 29),
    entry('learned', 'Studied IndexedDB transactions', 50),
    entry('session', 'Refactored the storage adapter', 51, { minutes: 30 }),
    entry(
      'idea',
      'Generic types could power the progress functions',
      74,
      { promotedToQuestId: genericsQuestId },
      promotedIdeaId,
    ),
    entry('learned', 'Read a post on type inference', 98),
    entry('reading', 'قرأت عن تاريخ اللغة العربية', 100, {
      pages: 12,
      bookTitle: 'تاريخ اللغة العربية',
    }),
    entry('session', 'Paired on the level curve', 122, { minutes: 90 }),
  ]

  const quests: Quest[] = [
    {
      id: newId(),
      createdAt: isoHoursAgo(nowMs, 120),
      updatedAt: isoHoursAgo(nowMs, 72),
      deletedAt: null,
      title: 'Build Amdy.world',
      description: 'My personal life tracker, dressed as an RPG.',
      status: 'active',
      skillId: 'programming',
      tagIds: [frontendTag.id],
      kind: 'steps',
      steps: [
        step('Model the data layer', isoHoursAgo(nowMs, 96)),
        step('Lock the RPG theme', isoHoursAgo(nowMs, 72)),
        step('Wire the progress logic', null),
        step('Ship the Quests screen', null),
      ],
      isSample: true,
    },
    {
      id: newId(),
      createdAt: isoHoursAgo(nowMs, 40),
      updatedAt: isoHoursAgo(nowMs, 24),
      deletedAt: null,
      title: 'Read Deep Work',
      description: 'Work through the book and keep notes.',
      status: 'active',
      skillId: 'reading',
      tagIds: [booksTag.id],
      kind: 'steps',
      steps: [
        step('Finish part one', isoHoursAgo(nowMs, 24)),
        step('Write a summary', null),
      ],
      isSample: true,
    },
    {
      id: courseQuestId,
      createdAt: isoHoursAgo(nowMs, 34),
      updatedAt: isoHoursAgo(nowMs, 6),
      deletedAt: null,
      title: 'Complete the TypeScript course',
      description: 'Counting every lesson of the advanced TypeScript course.',
      status: 'active',
      skillId: 'learning',
      tagIds: [courseTag.id, frontendTag.id],
      kind: 'counter',
      steps: [],
      counter: {
        unit: 'lesson',
        total: 12,
        startValue: 0,
        sections: [
          { id: newId(), title: 'Fundamentals', endAt: 4 },
          { id: newId(), title: 'Generics in practice', endAt: 8 },
          { id: newId(), title: 'Capstone', endAt: 12 },
        ],
        updates: [
          {
            id: newId(),
            at: isoHoursAgo(nowMs, 20),
            delta: 3,
          },
          {
            id: newId(),
            at: isoHoursAgo(nowMs, 6),
            delta: 2,
          },
        ],
      },
      isSample: true,
    },
    {
      id: genericsQuestId,
      createdAt: isoHoursAgo(nowMs, 72),
      updatedAt: isoHoursAgo(nowMs, 48),
      deletedAt: null,
      title: 'Learn TypeScript generics',
      description: 'Get comfortable with reusable, typed utilities.',
      status: 'done',
      skillId: 'learning',
      tagIds: [courseTag.id],
      kind: 'steps',
      originIdeaId: promotedIdeaId,
      completedAt: isoHoursAgo(nowMs, 48),
      steps: [
        step('Read the handbook chapter', isoHoursAgo(nowMs, 70)),
        step('Write a generic utility', isoHoursAgo(nowMs, 50)),
      ],
      isSample: true,
    },
    {
      id: newId(),
      createdAt: isoHoursAgo(nowMs, 30),
      updatedAt: isoHoursAgo(nowMs, 10),
      deletedAt: null,
      title: 'تعلّم اللغة العربية الفصحى',
      description: 'قراءة وكتابة كل يوم (reading and writing every day).',
      status: 'active',
      skillId: 'learning',
      tagIds: [arabicTag.id],
      kind: 'steps',
      steps: [
        step('حفظ مئة كلمة جديدة', null),
        step('Write a short paragraph', isoHoursAgo(nowMs, 10)),
      ],
      isSample: true,
    },
  ]

  // Sample goals are kept inactive on purpose: an active sample template would
  // make the app generate a *real* goal on the next day, which "Remove sample
  // data" would then have to leave behind. A paused template still shows what a
  // recurring goal looks like without that side effect.
  const readingTemplate: GoalTemplate = {
    id: newId(),
    createdAt: isoHoursAgo(nowMs, 130),
    updatedAt: isoHoursAgo(nowMs, 130),
    deletedAt: null,
    title: 'Read for 20 minutes',
    skillId: 'reading',
    days: ALL_WEEKDAYS,
    active: false,
    isSample: true,
  }

  const dailyGoal = (
    title: string,
    skillId: DailyGoal['skillId'],
    done: boolean,
    templateId: string | null,
  ): DailyGoal => {
    const createdAt = isoHoursAgo(nowMs, 1)
    return {
      id: newId(),
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      date: todayKey ?? '',
      title,
      skillId,
      templateId,
      done,
      doneAt: done ? createdAt : null,
      isSample: true,
    }
  }

  const dailyGoals: DailyGoal[] = todayKey
    ? [
        dailyGoal('Read for 20 minutes', 'reading', false, readingTemplate.id),
        dailyGoal('Ship one small improvement', 'programming', true, null),
      ]
    : []

  return {
    entries,
    quests,
    tags,
    goalTemplates: [readingTemplate],
    dailyGoals,
  }
}
