import { z } from 'zod'
import { SKILL_NAMES } from '@/lib/copy'
import type { SkillId } from '@/lib/skills'
import type { Weekday } from '@/lib/types'

/** Version of the stored and exported data shape. Bump when the model changes. */
export const SCHEMA_VERSION = 1

/** ISO 8601 timestamp, as produced by `Date.prototype.toISOString()`. */
export const isoDateTime = z.iso.datetime({ offset: true })

/** Local calendar day as `YYYY-MM-DD`. */
export const localDate = z.iso.date()

/** Fields shared by every record; spread into each concrete record schema. */
export const syncRecordShape = {
  id: z.uuid(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  deletedAt: isoDateTime.nullable(),
}

// Derived from the single source of skill names in copy.ts so the two cannot drift.
const skillIdValues = Object.keys(SKILL_NAMES) as [SkillId, ...SkillId[]]

export const skillIdSchema = z.enum(skillIdValues)

export const weekdaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]) satisfies z.ZodType<Weekday>
