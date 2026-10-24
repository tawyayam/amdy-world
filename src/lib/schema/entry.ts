import { z } from 'zod'
import { skillIdSchema, syncRecordShape } from './common'
import type { Entry, EntryMeta, EntryType } from '@/lib/types'

export const entryTypeSchema = z.enum([
  'learned',
  'idea',
  'reading',
  'session',
  'note',
]) satisfies z.ZodType<EntryType>

export const entryMetaSchema: z.ZodType<EntryMeta> = z.object({
  pages: z.number().int().nonnegative().optional(),
  bookTitle: z.string().optional(),
  minutes: z.number().int().nonnegative().optional(),
  questId: z.uuid().optional(),
  promotedToQuestId: z.uuid().optional(),
})

export const entrySchema: z.ZodType<Entry> = z.object({
  ...syncRecordShape,
  type: entryTypeSchema,
  text: z.string().min(1),
  skillId: skillIdSchema.nullable(),
  meta: entryMetaSchema.optional(),
  isSample: z.boolean().optional(),
})
