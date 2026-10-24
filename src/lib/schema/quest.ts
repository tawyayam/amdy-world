import { z } from 'zod'
import { isoDateTime, skillIdSchema, syncRecordShape } from './common'
import type {
  Quest,
  QuestCounter,
  QuestCounterSection,
  QuestCounterUpdate,
  QuestKind,
  QuestStatus,
  QuestStep,
} from '@/lib/types'

export const questStatusSchema = z.enum([
  'active',
  'paused',
  'done',
]) satisfies z.ZodType<QuestStatus>

export const questKindSchema = z.enum([
  'steps',
  'counter',
]) satisfies z.ZodType<QuestKind>

export const questStepSchema: z.ZodType<QuestStep> = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  done: z.boolean(),
  doneAt: isoDateTime.nullable(),
})

export const COUNTER_UNIT_MAX_LENGTH = 20
export const COUNTER_TOTAL_MAX = 100000

export const questCounterSectionSchema: z.ZodType<QuestCounterSection> =
  z.object({
    id: z.uuid(),
    title: z.string().min(1),
    endAt: z.int().min(1).max(COUNTER_TOTAL_MAX),
  })

export const questCounterUpdateSchema: z.ZodType<QuestCounterUpdate> = z.object(
  {
    id: z.uuid(),
    at: isoDateTime,
    delta: z.int().refine((value) => value !== 0, {
      message: 'A counter update must change the value.',
    }),
  },
)

/**
 * A counter's settings. Sections must end at strictly increasing values and
 * the last one must equal the total, so milestones always line up with the
 * target; `startValue` can never sit above the target.
 */
export const questCounterSchema: z.ZodType<QuestCounter> = z
  .object({
    unit: z.string().min(1).max(COUNTER_UNIT_MAX_LENGTH),
    total: z.int().min(1).max(COUNTER_TOTAL_MAX),
    startValue: z.int().min(0),
    sections: z.array(questCounterSectionSchema).optional(),
    updates: z.array(questCounterUpdateSchema),
  })
  .superRefine((counter, ctx) => {
    if (counter.startValue > counter.total) {
      ctx.addIssue({
        code: 'custom',
        path: ['startValue'],
        message: 'The starting value cannot be above the total.',
      })
    }
    const sections = counter.sections
    if (!sections) return
    let previousEnd = 0
    sections.forEach((section, index) => {
      if (section.endAt <= previousEnd) {
        ctx.addIssue({
          code: 'custom',
          path: ['sections', index, 'endAt'],
          message: 'Section ends must increase.',
        })
      }
      previousEnd = section.endAt
    })
    if (sections.length > 0 && previousEnd !== counter.total) {
      ctx.addIssue({
        code: 'custom',
        path: ['sections'],
        message: 'The last section must end at the total.',
      })
    }
  })

export const questSchema: z.ZodType<Quest> = z.object({
  ...syncRecordShape,
  title: z.string().min(1),
  description: z.string(),
  status: questStatusSchema,
  skillId: skillIdSchema,
  tagIds: z.array(z.uuid()),
  kind: questKindSchema,
  steps: z.array(questStepSchema),
  counter: questCounterSchema.optional(),
  originIdeaId: z.uuid().optional(),
  completedAt: isoDateTime.nullable().optional(),
  isSample: z.boolean().optional(),
})
