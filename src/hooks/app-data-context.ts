// The single spot where screens read data and trigger writes. Kept in a plain
// `.ts` file (no component) so the React fast-refresh lint rule stays happy.

import { createContext } from 'react'
import type { LevelUp, Progress } from '@/lib/progress'
import type { CounterChange, StepDirection } from '@/lib/quests'
import type { SkillId } from '@/lib/skills'
import type {
  CaptureType,
  DailyGoal,
  Entry,
  EntryMeta,
  EntryType,
  ExportData,
  GoalTemplate,
  Quest,
  QuestCounterSection,
  QuestKind,
  QuestStatus,
  Settings,
  Tag,
  TagColor,
  Weekday,
} from '@/lib/types'

/** Where the app data is in its lifecycle. */
export type AppStatus = 'loading' | 'ready' | 'unavailable' | 'error'

/** Every live record, loaded together so progress can be derived from it. */
export interface LoadedData {
  entries: Entry[]
  quests: Quest[]
  tags: Tag[]
  goals: DailyGoal[]
  /**
   * Every daily goal, soft-deleted ones included. Only `ensureTodayGoals` reads
   * it, so a goal the person deleted for today is not recreated by its template.
   */
  allGoals: DailyGoal[]
  templates: GoalTemplate[]
  settings: Settings
}

/** What the quick capture form hands to `addEntry`. */
export interface NewEntryInput {
  type: EntryType
  text: string
  /** Overrides the type's default skill when the person picks another one. */
  skillId?: SkillId
  meta?: EntryMeta
}

/** Result of saving an entry, ready to show "+15 XP · Learning". */
export interface CaptureResult {
  entry: Entry
  xp: number
  skillId: SkillId | null
  levelUps: LevelUp[]
}

/** Editable fields of an entry, changed from the edit dialog. */
export interface EntryChanges {
  text: string
  skillId?: SkillId | null
  meta?: EntryMeta
}

/** The counter fields the quest form can change. */
export interface QuestCounterInput {
  unit: string
  total: number
  /** Only used on create; the starting value never changes afterwards. */
  startValue?: number
  /** Sections keep their ids across edits so saved records stay stable. */
  sections?: QuestCounterSection[]
}

/** Editable fields of a quest, changed from the quest form. */
export interface QuestDetailsInput {
  title: string
  description: string
  skillId: SkillId
  tagIds: string[]
  /** Only set on create; a quest never changes progress model afterwards. */
  kind?: QuestKind
  counter?: QuestCounterInput
}

/** Result of changing a counter, ready for the +1 toast and the Undo action. */
export interface CounterUpdateResult {
  quest: Quest
  /** The value after the change. */
  value: number
  /** Milestones this change crossed (only upward crossings count). */
  milestonesReached: number[]
  /** Derived XP the quest gained or lost; negative when a correction removed it. */
  xpDelta: number
  /** True when this change was what completed the quest. */
  completed: boolean
  levelUps: LevelUp[]
}

/** Editable fields of a tag, changed from the manage-tags dialog. */
export interface TagInput {
  name: string
  colorToken?: TagColor
}

/** Result of turning an entry into a quest, for the celebration toast. */
export interface PromotionResult {
  quest: Quest
  xp: number
  skillId: SkillId
  levelUps: LevelUp[]
}

/** Editable fields of a daily goal, changed from the goal form. */
export interface GoalDetailsInput {
  title: string
  skillId: SkillId
}

/** Editable fields of a recurring goal template, changed from the template form. */
export interface GoalTemplateInput {
  title: string
  skillId: SkillId
  days: Weekday[]
  active: boolean
}

/** Result of ticking a goal, for the inline XP line and the all-goals bonus. */
export interface GoalToggleResult {
  goal: DailyGoal
  xp: number
  skillId: SkillId
  levelUps: LevelUp[]
  /** True when this tick completed the last outstanding goal of the day. */
  completedAllGoals: boolean
}

export interface AppDataContextValue {
  status: AppStatus
  errorMessage: string | null
  entries: Entry[]
  quests: Quest[]
  tags: Tag[]
  goals: DailyGoal[]
  /** Every daily goal ever, soft-deleted ones included; used for backup counts. */
  allGoals: DailyGoal[]
  templates: GoalTemplate[]
  settings: Settings
  progress: Progress
  todayKey: string
  timeZone: string
  hour: number
  now: Date
  lastCaptureType: CaptureType
  setLastCaptureType: (type: CaptureType) => void
  addEntry: (input: NewEntryInput) => Promise<CaptureResult>
  updateEntry: (entryId: string, changes: EntryChanges) => Promise<void>
  deleteEntry: (entryId: string) => Promise<void>
  restoreEntry: (entry: Entry) => Promise<void>
  promoteEntryToQuest: (
    entryId: string,
    input: QuestDetailsInput,
  ) => Promise<PromotionResult>
  addDailyGoal: (input: GoalDetailsInput) => Promise<DailyGoal>
  updateDailyGoal: (goalId: string, input: GoalDetailsInput) => Promise<void>
  toggleDailyGoal: (goalId: string) => Promise<GoalToggleResult | null>
  deleteDailyGoal: (goalId: string) => Promise<void>
  restoreDailyGoal: (goal: DailyGoal) => Promise<void>
  createTemplate: (input: GoalTemplateInput) => Promise<GoalTemplate>
  updateTemplate: (
    templateId: string,
    input: GoalTemplateInput,
  ) => Promise<void>
  deleteTemplate: (templateId: string) => Promise<void>
  restoreTemplate: (template: GoalTemplate) => Promise<void>
  /** Creates today's missing goals from active templates; safe to call often. */
  ensureTodayGoals: () => Promise<void>
  createQuest: (input: QuestDetailsInput) => Promise<Quest>
  updateQuestDetails: (
    questId: string,
    input: QuestDetailsInput,
  ) => Promise<void>
  /** Moves a counter by a delta or sets it to an absolute value. */
  updateCounter: (
    questId: string,
    change: CounterChange,
  ) => Promise<CounterUpdateResult | null>
  /** Removes the counter's most recent update. */
  undoCounterUpdate: (questId: string) => Promise<CounterUpdateResult | null>
  addQuestStep: (questId: string, title: string) => Promise<void>
  toggleQuestStep: (questId: string, stepId: string) => Promise<void>
  moveQuestStep: (
    questId: string,
    stepId: string,
    direction: StepDirection,
  ) => Promise<void>
  setQuestStatus: (questId: string, status: QuestStatus) => Promise<void>
  deleteQuest: (questId: string) => Promise<void>
  restoreQuest: (quest: Quest) => Promise<void>
  createTag: (input: TagInput) => Promise<Tag>
  updateTag: (tagId: string, input: TagInput) => Promise<void>
  deleteTag: (tagId: string) => Promise<void>
  restoreTag: (tag: Tag) => Promise<void>
  /** Exports all data as a versioned snapshot. */
  exportBackup: () => Promise<void>
  /** Imports a versioned snapshot, replacing all data. */
  importBackup: (data: ExportData) => Promise<void>
  /** Clears all data, including settings. */
  resetAll: () => Promise<void>
  /** Loads sample data into storage. */
  loadSampleData: () => Promise<void>
  /** Removes sample records flagged `isSample`. */
  removeSampleData: () => Promise<void>
  /** First run: saves the name, marks onboarding done, and enters the app. */
  startFresh: (name: string) => Promise<void>
  /** First run: saves the name, marks onboarding done, and loads sample data. */
  startWithSampleData: (name: string) => Promise<void>
  /** Marks onboarding done on the current settings, e.g. after an import. */
  finishOnboarding: () => Promise<void>
  /** True only for a brand-new install with nothing saved yet. */
  showWelcome: boolean
  saveSettings: (settings: Settings) => Promise<void>
  reload: () => Promise<void>
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)
