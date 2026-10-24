export { ensureTodayGoals } from './ensure-today'
export type { NewDailyGoalDraft } from './ensure-today'
export { ensureTodayGoalsInto } from './ensure-today-adapter'
export {
  dailyGoalFromDraft,
  withGoalDetails,
  withGoalDone,
  withTemplateDetails,
} from './mutations'
export type { GoalDetails, GoalTemplateDetails } from './mutations'
export { summarizeGoalsByDay } from './summary'
export type { GoalDaySummary } from './summary'
export { recentGoalDays, RECENT_GOAL_DAYS } from './recent-days'
export type { RecentGoalDay } from './recent-days'
