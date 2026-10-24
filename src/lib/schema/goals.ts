import { z } from 'zod'
import {
  isoDateTime,
  localDate,
  skillIdSchema,
  syncRecordShape,
  weekdaySchema,
} from './common'
import type { DailyGoal, GoalTemplate } from '@/lib/types'

export const goalTemplateSchema: z.ZodType<GoalTemplate> = z.object({
  ...syncRecordShape,
  title: z.string().min(1),
  skillId: skillIdSchema,
  days: z.array(weekdaySchema),
  active: z.boolean(),
  isSample: z.boolean().optional(),
})

export const dailyGoalSchema: z.ZodType<DailyGoal> = z.object({
  ...syncRecordShape,
  date: localDate,
  title: z.string().min(1),
  skillId: skillIdSchema,
  templateId: z.uuid().nullable(),
  done: z.boolean(),
  doneAt: isoDateTime.nullable(),
  isSample: z.boolean().optional(),
})
