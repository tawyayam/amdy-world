// Every user-facing string lives here so wording is easy to change in one place.

import { unitLabel } from '@/lib/unit-words'
import type { Weekday } from '@/lib/types'

export const BRAND = {
  name: 'Amdy',
  suffix: '.world',
} as const

/** Default character name for a new install, editable later in Settings. */
export const DEFAULT_CHARACTER_NAME = 'Amdy'

export const STORAGE_COPY = {
  unavailable:
    'Your browser storage is unavailable, so nothing can be saved. Turn off private mode or try another browser.',
} as const

export const PRIMARY_NAV_LABEL = 'Main navigation'

export const SKIP_LINK_LABEL = 'Skip to main content'

const GREETINGS = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
} as const

/**
 * Greeting that fits the local hour, so the Home screen feels personal. The
 * hour is passed in (never read here) to keep the function pure and testable.
 */
export function greetingForHour(hour: number): string {
  if (hour < 12) return GREETINGS.morning
  if (hour < 18) return GREETINGS.afternoon
  return GREETINGS.evening
}

export const NAV_LABELS = {
  today: 'Today',
  skills: 'Skills',
  quests: 'Quests',
  timeline: 'Timeline',
  settings: 'Settings',
} as const

export const SKILL_NAMES = {
  programming: 'Programming',
  reading: 'Reading',
  learning: 'Learning',
  ideas: 'Ideas',
} as const

/** Display label for each capturable entry type. */
export const ENTRY_TYPE_LABELS = {
  learned: 'Learned',
  idea: 'Idea',
  reading: 'Reading',
  session: 'Coding session',
} as const

export const COMMON_COPY = {
  cancel: 'Cancel',
  save: 'Save',
  add: 'Add',
  delete: 'Delete',
  edit: 'Edit',
  undo: 'Undo',
  actionFailed: 'That did not work. Please try again.',
} as const

export const SETTINGS_COPY = {
  profileTitle: 'Profile',
  characterNameLabel: 'Character name',
  characterNamePlaceholder: 'Your name',
  characterNameHelp: 'Shown on the home screen and in the nav.',
  backupTitle: 'Backup',
  downloadBackup: 'Download backup',
  lastBackupNever: 'Last backup: Never',
  lastBackup: (date: string) => `Last backup: ${date}`,
  importTitle: 'Import',
  importHint: 'JSON files from this app (.json)',
  importButton: 'Import backup',
  storageTitle: 'Storage',
  storageProtect: 'Protect my data',
  storageProtected: 'Protected',
  storageNotGuaranteed: 'Not guaranteed, back up regularly',
  storageDescription:
    'Request persistent storage so your data is less likely to be cleared by the browser.',
  storageStatusUnknown: 'Storage status unknown.',
  storagePersistError: 'Could not request persistent storage.',
  sampleDataTitle: 'Sample data',
  sampleDataDescription:
    'Add a little demo history to explore the app. You can remove it later.',
  sampleDataCount: (count: number) => `Sample records: ${count}`,
  sampleDataLoadFailed: 'Could not load sample data.',
  sampleDataRemoveFailed: 'Could not remove sample data.',
  loadSampleData: 'Load sample data',
  removeSampleData: 'Remove sample data',
  dangerTitle: 'Danger zone',
  resetDescription:
    'This erases all entries, quests, goals, tags, and settings. This cannot be undone.',
  resetConfirmLabel: 'Type RESET (case-sensitive) to enable the reset button.',
  resetConfirmPlaceholder: 'RESET',
  resetDownloadFirst: 'Download a backup first',
  resetButton: 'Reset all data',
  resetDialogTitle: 'Reset all data?',
  resetDialogBody:
    'Everything will be permanently removed. We suggest downloading a backup before continuing.',
  importDialogTitle: 'Import backup?',
  importDialogBody:
    'This will replace all current data with what is in this file.',
  importCurrentLabel: 'Current data',
  importFileLabel: 'Backup file',
  importCountEntries: 'Entries',
  importCountQuests: 'Quests',
  importCountTags: 'Tags',
  importCountGoals: 'Goals',
  importInvalidTitle: 'Invalid backup file',
  importInvalidBody:
    'This file does not look like an Amdy.world backup. No changes were made.',
  importUnsupportedVersionTitle: 'Backup from a newer version',
  importUnsupportedVersionBody:
    'This backup was made with a newer version of Amdy.world. Update the app to import it. No changes were made.',
  importSuccess: 'Backup imported successfully.',
  importFailed: 'Import failed. No changes were made.',
  exportFailed: 'Export failed.',
  resetSuccess: 'All data has been reset.',
  resetFailed: 'Reset failed.',
  nameRequired: 'Character name is required.',
  nameTooLong: 'Character name must be 30 characters or less.',
} as const

export const APP_STATE_COPY = {
  loading: 'Loading your journey…',
  errorTitle: 'Storage unavailable',
  errorBody: STORAGE_COPY.unavailable,
  unsupportedTitle: 'Something went wrong',
  unsupportedBody: 'Your data could not be loaded. Please reload the page.',
  retry: 'Try again',
  crashBody:
    'An unexpected error stopped the app. Retry, or download a backup of your data first.',
  downloadBackup: 'Download backup',
  backupWorking: 'Preparing your backup…',
  backupDownloaded: 'Backup downloaded.',
  backupFailed:
    'Could not create a backup. Reload the app, then export your data from Settings.',
} as const

export const WELCOME_COPY = {
  title: 'Welcome to Amdy.world',
  intro:
    'Everything lives in this browser only — no account, no server. Pick a name to begin.',
  nameLabel: 'What should we call you?',
  namePlaceholder: 'Your name',
  nameRequired: 'Enter a name to begin.',
  nameTooLong: 'Keep the name to 30 characters or less.',
  startFresh: 'Start fresh',
  trySampleData: 'Try with sample data',
  importBackup: 'I have a backup file',
  importHint: 'JSON files from this app (.json)',
  actionFailed: 'That did not work. Please try again.',
} as const

export const CHARACTER_COPY = {
  levelLabel: 'Level',
  /** Spoken and shown as text, e.g. "Level 2", not just the gold circle. */
  levelValue: (level: number) => `Level ${level}`,
  streakSingular: 'day streak',
  streakPlural: 'days streak',
  overallXpLabel: 'Overall XP',
  xpToNextLevel: (xp: number) => `${xp} XP to next level`,
} as const

/** Rank names, one list per skill plus the character, from lowest to highest. */
export const RANK_NAMES = {
  programming: ['Novice', 'Apprentice', 'Builder', 'Craftsman', 'Architect'],
  reading: ['Curious', 'Reader', 'Bookworm', 'Scholar', 'Sage'],
  learning: ['Beginner', 'Student', 'Explorer', 'Specialist', 'Master'],
  ideas: ['Dreamer', 'Tinkerer', 'Inventor', 'Visionary', 'Pioneer'],
  overall: ['Newcomer', 'Adventurer', 'Trailblazer', 'Veteran', 'Legend'],
} as const

export const RANK_COPY = {
  /** "Next rank: Builder at level 5"; the Home card has no levels-away count. */
  nextRank: (rank: string, level: number) =>
    `Next rank: ${rank} at level ${level}`,
  nextRankAway: (rank: string, level: number, levelsAway: number) =>
    `Next rank: ${rank} at level ${level} (${levelsAway} ${levelsAway === 1 ? 'level' : 'levels'} away)`,
  topRankReached: 'Top rank reached',
  /** Appended to a level-up when it also crossed a rank boundary. */
  nowRank: (rank: string) => `now ${rank}`,
  ladderLabel: (skillName: string) => `${skillName} ranks`,
} as const

export const NEXT_UP_COPY = {
  xpToLevel: (xp: number, level: number) => `${xp} XP to level ${level}`,
  about: (parts: readonly string[]) => `About ${parts.join(', or ')}.`,
  questSteps: (count: number) =>
    `${count} ${count === 1 ? 'quest step' : 'quest steps'}`,
  codingHours: (hours: number) =>
    `${hours} ${hours === 1 ? 'hour' : 'hours'} of coding`,
  pages: (count: number) => `${count} ${count === 1 ? 'page' : 'pages'}`,
  learnedNotes: (count: number) =>
    `${count} learned ${count === 1 ? 'note' : 'notes'}`,
  ideas: (count: number) => `${count} ${count === 1 ? 'idea' : 'ideas'}`,
} as const

export const HOME_COPY = {
  todayEntriesTitle: "Today's logs",
  todayEntriesEmpty: 'Write your first log for today.',
  todayEntriesSeeAll: 'See all',
  activeQuestsTitle: 'Active quests',
  activeQuestsEmpty: 'No active quest yet. Your next project could start here.',
  questSteps: (done: number, total: number) => `${done}/${total} steps`,
  questNoSteps: 'No steps yet',
} as const

export const CAPTURE_COPY = {
  title: 'Log something',
  textLabel: 'What happened?',
  textPlaceholder: 'Write one line about it…',
  save: 'Log it',
  typeGroupLabel: 'Type of log',
  typeLabels: {
    learned: ENTRY_TYPE_LABELS.learned,
    idea: ENTRY_TYPE_LABELS.idea,
    reading: ENTRY_TYPE_LABELS.reading,
    session: ENTRY_TYPE_LABELS.session,
  },
  pagesLabel: 'Pages read',
  bookTitleLabel: 'Book title',
  bookTitlePlaceholder: 'Which book?',
  minutesLabel: 'Minutes coded',
  skillLabel: 'Skill',
  skillNone: 'No skill',
  questLabel: 'Quest',
  questNone: 'No quest',
  textRequired: 'Write a line first.',
  saveFailed: 'That did not save. Your text is still here — try again.',
} as const

export const XP_COPY = {
  gained: (xp: number, skillName: string) => `+${xp} XP · ${skillName}`,
  skillLevelUp: (skillName: string, level: number) =>
    `${skillName} reached level ${level}`,
  overallLevelUp: (name: string, level: number) =>
    `${name} reached level ${level}`,
} as const

export const SKILLS_COPY = {
  recentEmpty: 'Nothing logged for this skill yet.',
  levelLabel: (level: number) => `Level ${level}`,
  empty: 'Your four skills will grow as you log and complete quests.',
} as const

export const ENTRY_COPY = {
  menuLabel: 'Log actions',
  editTitle: 'Edit log',
  editTextLabel: 'What happened?',
  deleted: 'Log deleted',
  promote: 'Turn into a quest',
  showMore: 'Show more',
  showLess: 'Show less',
} as const

export const TAGS_COPY = {
  label: 'Tags',
  pickerEmptyHint: 'No tags yet. Create them in',
  manageButton: 'Manage tags',
  manageTitle: 'Manage tags',
  manageBody: 'Group your quests with tags. Deleting a tag only hides it.',
  empty: 'No tags yet. Add one below.',
  nameLabel: 'Tag name',
  namePlaceholder: 'e.g. frontend',
  colorLabel: 'Color',
  add: 'Add tag',
  edit: 'Edit tag',
  renameLabel: 'Tag name',
  deleteTag: 'Delete tag',
  deleted: 'Tag deleted',
  nameRequired: 'Give the tag a name.',
  nameTaken: 'A tag with this name already exists.',
  colorNames: {
    neutral: 'Neutral',
    gold: 'Gold',
    purple: 'Purple',
    teal: 'Teal',
    orange: 'Orange',
    rose: 'Rose',
  },
} as const

export const QUEST_COPY = {
  newQuest: 'New quest',
  createTitle: 'New quest',
  editTitle: 'Edit quest',
  titleLabel: 'Title',
  titlePlaceholder: 'What are you building?',
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'A line about the goal…',
  titleRequired: 'Give your quest a title.',
  kindLabel: 'How you track it',
  kindSteps: 'Steps',
  kindCounter: 'Counter',
  kindStepsHint: 'A checklist you tick off.',
  kindCounterHint: 'A number you count up to a goal.',
  kindLocked: 'A quest keeps its progress model once created.',
  moreOptionsLabel: 'More options',
  counterUnitLabel: 'Unit',
  counterUnitPlaceholder: 'e.g. lesson, page, workout',
  counterUnitRequired: 'Add what you count, like “lesson”.',
  counterUnitTooLong: 'Keep the unit to 20 characters.',
  counterTotalLabel: 'Total',
  counterTotalRequired: 'Enter a whole number above zero.',
  counterTotalTooLow: 'The total can’t be lower than where you are now.',
  counterStartLabel: 'Starting value',
  counterStartHelp: 'Already started? Enter where you are now.',
  counterStartInvalid: 'Enter a starting value between 0 and the total.',
  counterSectionsTitle: 'Course sections (optional)',
  counterSectionsHelp:
    'Add each section’s name and the lesson number where it ends. These become your milestones.',
  counterSectionTitleLabel: 'Section name',
  counterSectionEndLabel: 'Ends at',
  counterSectionAdd: 'Add section',
  counterSectionRemove: 'Remove section',
  counterSectionTitleRequired: 'Give the section a name.',
  counterSectionEndRequired: 'Set where this section ends.',
  counterSectionEndTooLow: 'Each section must end after the one before it.',
  counterSectionEndAboveTotal: 'A section can’t end past the total.',
  counterSectionLastMustEndAtTotal: 'The last section must end at the total.',
  counterTotalTooHigh: 'Keep the total to 100,000 or less.',
  counterProgressTitle: 'Progress',
  counterValue: (value: number, total: number, unit: string) =>
    `${unitLabel(unit)} ${value} of ${total}`,
  counterPlusOne: '+1',
  counterPlusFive: '+5',
  counterAddOne: (unit: string) => `+1 ${unitLabel(unit)}`,
  counterAddFive: (unit: string) => `+5 ${unitLabel(unit)}`,
  counterSetTo: 'Set to…',
  counterSetDialogTitle: 'Set the count',
  counterSetDialogLabel: 'New value',
  counterSetDialogHelp: 'Your count will move to that number.',
  counterSetDialogReopenHint: 'Lowering the count reopens the quest.',
  counterSetInvalid: 'Enter a whole number between 0 and the total.',
  counterUndoLast: 'Undo last',
  counterCompleted: (title: string, xp: number) =>
    `Quest complete: ${title} · +${xp} XP`,
  counterMilestone: (value: number) => `Milestone reached: ${value}`,
  counterMilestoneItem: (unit: string, value: number) =>
    `${unitLabel(unit)} ${value}`,
  counterNextMilestone: (value: number, unit: string, milestoneXp: number) =>
    `Next milestone: ${unitLabel(unit)} ${value} (+${milestoneXp} XP)`,
  counterNoNextMilestone: 'Final stretch to the total.',
  counterSectionPosition: (title: string, value: number, size: number) =>
    `${title} · ${value} of ${size}`,
  counterSectionNumber: (number: number) => `Section ${number}`,
  counterMilestonesTitle: 'Milestones',
  counterMilestoneDone: 'Reached',
  counterMilestonePending: 'Not yet',
  nextUpLabel: 'Next',
  nextUpCounter: (value: number, unit: string) => `${unitLabel(unit)} ${value}`,
  stalledLabel: (days: number) =>
    `No progress for ${days} ${days === 1 ? 'day' : 'days'}`,
  filterStatusLabel: 'Status',
  filterSkillLabel: 'Skill',
  filterTagLabel: 'Tag',
  allStatuses: 'All statuses',
  allSkills: 'All skills',
  allTags: 'All tags',
  noMatches: 'No quests match these filters.',
  empty: 'No quest yet. Turn an idea into one, or start a new quest.',
  statusActive: 'Active',
  statusPaused: 'Paused',
  statusDone: 'Done',
  sectionActive: 'Active',
  sectionPaused: 'Paused',
  sectionCompleted: 'Completed',
  sectionCompletedCount: (count: number) => `Completed (${count})`,
  complete: 'Complete quest',
  reopen: 'Reopen quest',
  pause: 'Pause',
  resume: 'Resume',
  deleteTitle: 'Delete this quest?',
  deleteBody:
    'This removes the quest and the XP it gave. You can undo right after.',
  deleted: 'Quest deleted',
  stepsTitle: 'Steps',
  stepPlaceholder: 'Add a step…',
  addStep: 'Add step',
  noSteps: 'No steps yet. Break the quest into small steps.',
  moveUp: 'Move step up',
  moveDown: 'Move step down',
  stepProgress: (done: number, total: number) => `${done}/${total} steps`,
  originIdea: 'Started from an idea',
  notFound: 'This quest no longer exists.',
  backToQuests: 'Back to quests',
  actionsLabel: 'Quest actions',
  journeyTitle: 'Journey',
  journeyIntro: 'Notes and logs linked to this quest, newest first.',
  journeyEmpty: 'Nothing logged for this quest yet.',
  journeyAddLabel: 'Add a note to this quest',
  journeyAddPlaceholder: 'What happened on this quest?',
  journeyAdd: 'Add note',
  journeyAdded: 'Note added to the quest',
} as const

/** Single-letter weekday labels for the compact picker, Monday-first is not used. */
export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

/** Full weekday names, used for the accessible name of each picker button. */
export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** Human summary of the days a template repeats on, e.g. "Every day". */
export function weekdaysSummary(days: readonly Weekday[]): string {
  if (days.length === 7) return 'Every day'
  const sorted = [...days].sort((first, second) => first - second)
  const key = sorted.join(',')
  if (key === '1,2,3,4,5') return 'Weekdays'
  if (key === '0,6') return 'Weekends'
  return sorted.map((day) => WEEKDAY_SHORT[day]).join(', ')
}

export const GOALS_COPY = {
  todayTitle: "Today's goals",
  progress: (done: number, total: number) => `${done}/${total} goals`,
  todayEmpty: 'No goals for today yet. Add one below.',
  manage: 'Manage',
  addPlaceholder: 'Add a goal for today…',
  add: 'Add goal',
  addLabel: 'New goal',
  titleRequired: 'Write a goal first.',
  addFailed: 'That did not save. Try again.',
  editTitle: 'Edit goal',
  save: 'Save goal',
  goalMenuLabel: 'Goal actions',
  allDoneBonus: (xp: number) => `All goals done — +${xp} XP`,
  templatesTitle: 'Recurring goals',
  templatesIntro: 'These show up automatically on the days you pick.',
  templatesEmpty:
    'No recurring goals yet. Add one to make it part of every day.',
  newTemplate: 'New recurring goal',
  createTemplateTitle: 'New recurring goal',
  editTemplateTitle: 'Edit recurring goal',
  titleLabel: 'Title',
  titlePlaceholder: 'e.g. Read for 30 minutes',
  daysLabel: 'Repeat on',
  daysRequired: 'Pick at least one day.',
  activeLabel: 'Active',
  templateMenuLabel: 'Recurring goal actions',
  editTemplate: 'Edit',
  deleteTemplate: 'Delete',
  templateDeleted: 'Recurring goal deleted',
  recentDaysTitle: 'Recent days',
  recentDaysIntro: 'The last two weeks of goals, newest first.',
  recentDaysEmpty: 'No goal history yet. Days with goals will show up here.',
} as const

export const TIMELINE_COPY = {
  empty: 'Nothing logged yet. Your first entry starts the journey.',
  noMatches: 'No logs match these filters yet.',
  searchLabel: 'Search logs',
  searchPlaceholder: 'Search logs…',
  clearSearch: 'Clear search',
  clearFilters: 'Clear filters',
  logCount: (count: number) => `${count} ${count === 1 ? 'log' : 'logs'}`,
  filterSkillLabel: 'Filter by skill',
  allSkills: 'All skills',
  today: 'Today',
  yesterday: 'Yesterday',
  viewLabel: 'View',
  groupByLabel: 'Group by',
  sortLabel: 'Sort',
  layoutLabel: 'Layout',
  groupByDay: 'Day',
  groupByWeek: 'Week',
  groupBySkill: 'Skill',
  sortNewest: 'Newest first',
  sortOldest: 'Oldest first',
  layoutList: 'List',
  layoutGrid: 'Grid',
  weekOf: (date: string) => `Week of ${date}`,
  noSkill: 'No skill',
  goalsSummary: (done: number, total: number) => `Goals ${done}/${total}`,
} as const
