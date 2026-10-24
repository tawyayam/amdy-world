import type { SkillId } from '@/lib/skills'

// Domain model shared by storage, validation, and progress logic. Records are
// sync-ready: UUID ids, ISO timestamps, and soft deletes, so a server database
// can replace local storage later without changing the shapes.

/** Fields every stored record shares so records can be merged or synced. */
export interface SyncFields {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type EntryType = 'learned' | 'idea' | 'reading' | 'session' | 'note'

/** Entry types a person can pick in quick capture; `note` is created elsewhere. */
export type CaptureType = Exclude<EntryType, 'note'>

/** Optional extras that depend on the entry type. */
export interface EntryMeta {
  pages?: number
  bookTitle?: string
  minutes?: number
  questId?: string
  promotedToQuestId?: string
}

export interface Entry extends SyncFields {
  type: EntryType
  text: string
  /** `null` for notes, which belong to no skill. */
  skillId: SkillId | null
  meta?: EntryMeta
  isSample?: boolean
}

export type QuestStatus = 'active' | 'paused' | 'done'

/** How a quest tracks progress: checklist steps, or a counting number. */
export type QuestKind = 'steps' | 'counter'

export interface QuestStep {
  id: string
  title: string
  done: boolean
  doneAt: string | null
}

/** A named range inside a counter quest, used as a milestone and a heading. */
export interface QuestCounterSection {
  id: string
  title: string
  /** The value the section ends at; strictly increasing, the last equals total. */
  endAt: number
}

/** One recorded change to a counter quest's value. */
export interface QuestCounterUpdate {
  id: string
  /** ISO timestamp of the change. */
  at: string
  /** Signed change; non-zero. Positive moves toward the total, negative corrects. */
  delta: number
}

/** The counting half of a quest: a target, optional sections, and an update log. */
export interface QuestCounter {
  /** Free-text unit the progress is counted in, e.g. "lesson". */
  unit: string
  /** Target value; the quest completes when the current value reaches it. */
  total: number
  /** The value the counter started at; the current value is derived from this. */
  startValue: number
  /** Optional milestone sections; the current value never includes them. */
  sections?: QuestCounterSection[]
  /** Chronological log of changes; the current value is never stored. */
  updates: QuestCounterUpdate[]
}

export interface Quest extends SyncFields {
  title: string
  description: string
  status: QuestStatus
  /** Which skill the quest's step and completion XP go to. */
  skillId: SkillId
  /** Ids of tags attached to this quest, resolved against live tags for display. */
  tagIds: string[]
  /** Progress model; quests saved before this field existed behave as "steps". */
  kind: QuestKind
  steps: QuestStep[]
  /** Present only when `kind` is "counter". */
  counter?: QuestCounter
  /** Set only when the quest was promoted from an idea; drives the idea bonus. */
  originIdeaId?: string
  completedAt?: string | null
  isSample?: boolean
}

/** Colors a tag can take; each maps to a theme token in `src/index.css`. */
export type TagColor =
  'neutral' | 'gold' | 'purple' | 'teal' | 'orange' | 'rose'

/**
 * A free-form label that groups quests. The shape stays generic (no quest-only
 * fields) so entries could carry tags later without a data migration.
 */
export interface Tag extends SyncFields {
  /** Unique among live tags, compared case-insensitively. */
  name: string
  /** Optional theme color token; tags without one render as neutral. */
  colorToken?: TagColor
  isSample?: boolean
}

/** Weekday numbers follow `Date.getDay()`: 0 is Sunday, 6 is Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** How the timeline log is bucketed. */
export type TimelineGroupBy = 'day' | 'week' | 'skill'
/** Direction the timeline lists entries and groups. */
export type TimelineSort = 'newest' | 'oldest'
/** How the timeline lays entries out: rows in a list, or cards in a grid. */
export type TimelineLayout = 'list' | 'grid'

/** The saved timeline display preferences. */
export interface TimelineViewOptions {
  groupBy: TimelineGroupBy
  sort: TimelineSort
  layout: TimelineLayout
}

export interface GoalTemplate extends SyncFields {
  title: string
  skillId: SkillId
  days: Weekday[]
  active: boolean
  isSample?: boolean
}

export interface DailyGoal extends SyncFields {
  /** Local day as `YYYY-MM-DD`. */
  date: string
  title: string
  skillId: SkillId
  /** Set when the goal was created from a template. */
  templateId: string | null
  done: boolean
  doneAt: string | null
  isSample?: boolean
}

export interface Settings {
  characterName: string
  schemaVersion: number
  /** Optional so exports and data saved before this field stay valid. */
  timelineView?: TimelineViewOptions
  /** When the user last downloaded a backup, ISO datetime. */
  lastExportedAt?: string
  /** When the user finished the welcome screen, ISO datetime; absent for old installs. */
  onboardedAt?: string
}

/** Full JSON snapshot used for export and import. */
export interface ExportData {
  schemaVersion: number
  exportedAt: string
  entries: Entry[]
  quests: Quest[]
  tags: Tag[]
  goalTemplates: GoalTemplate[]
  dailyGoals: DailyGoal[]
  settings: Settings
}
