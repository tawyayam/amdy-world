// Pure validation for the counter half of the quest form. The form keeps its
// fields as strings; this turns them into a typed counter or one error message,
// so the dialog never holds business rules.

import { QUEST_COPY } from './copy'
import { COUNTER_TOTAL_MAX, COUNTER_UNIT_MAX_LENGTH } from './schema/quest'
import type { QuestCounterSection } from './types'

/** One milestone row as the form holds it: the end is still a string. */
export interface CounterSectionRow {
  id: string
  title: string
  endAt: string
}

/** The raw string values of the counter fields. */
export interface CounterFormValues {
  unit: string
  total: string
  /** Only collected when the quest is created. */
  startValue: string
  sections: CounterSectionRow[]
}

/** A valid counter built from the form, ready to store. */
export interface ValidCounterForm {
  unit: string
  total: number
  startValue: number
  sections: QuestCounterSection[]
}

function parseInteger(value: string): number | null {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const parsed = Number(trimmed)
  return Number.isSafeInteger(parsed) ? parsed : null
}

/**
 * Validates the counter fields. `minValue` is the current count when editing
 * (the total can never drop below it, or the history would not make sense);
 * pass 0 on create. Returns the error to show, or the parsed counter.
 */
export function validateCounterForm(
  values: CounterFormValues,
  minValue: number,
): { error: string | null; counter: ValidCounterForm | null } {
  const unit = values.unit.trim()
  if (!unit) {
    return { error: QUEST_COPY.counterUnitRequired, counter: null }
  }
  if (unit.length > COUNTER_UNIT_MAX_LENGTH) {
    return { error: QUEST_COPY.counterUnitTooLong, counter: null }
  }

  const total = parseInteger(values.total)
  if (total === null || total < 1) {
    return { error: QUEST_COPY.counterTotalRequired, counter: null }
  }
  if (total > COUNTER_TOTAL_MAX) {
    return { error: QUEST_COPY.counterTotalTooHigh, counter: null }
  }
  if (total < minValue) {
    return { error: QUEST_COPY.counterTotalTooLow, counter: null }
  }

  const startValue = parseInteger(values.startValue)
  if (startValue === null || startValue > total) {
    return { error: QUEST_COPY.counterStartInvalid, counter: null }
  }

  const sections: QuestCounterSection[] = []
  let previousEnd = 0
  for (const row of values.sections) {
    const title = row.title.trim()
    const endRaw = row.endAt.trim()
    // A row left completely blank is ignored, not an error.
    if (!title && !endRaw) continue
    if (!title) {
      return { error: QUEST_COPY.counterSectionTitleRequired, counter: null }
    }
    const endAt = parseInteger(endRaw)
    if (endAt === null || endAt < 1) {
      return { error: QUEST_COPY.counterSectionEndRequired, counter: null }
    }
    if (endAt > total) {
      return { error: QUEST_COPY.counterSectionEndAboveTotal, counter: null }
    }
    if (endAt <= previousEnd) {
      return { error: QUEST_COPY.counterSectionEndTooLow, counter: null }
    }
    sections.push({ id: row.id, title, endAt })
    previousEnd = endAt
  }
  if (sections.length > 0 && previousEnd !== total) {
    return {
      error: QUEST_COPY.counterSectionLastMustEndAtTotal,
      counter: null,
    }
  }

  return { error: null, counter: { unit, total, startValue, sections } }
}
