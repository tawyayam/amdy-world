import { z } from 'zod'
import { syncRecordShape } from './common'
import type { Tag, TagColor } from '@/lib/types'

export const tagColorSchema = z.enum([
  'neutral',
  'gold',
  'purple',
  'teal',
  'orange',
  'rose',
]) satisfies z.ZodType<TagColor>

export const tagSchema: z.ZodType<Tag> = z.object({
  ...syncRecordShape,
  name: z.string().min(1),
  colorToken: tagColorSchema.optional(),
  isSample: z.boolean().optional(),
})
