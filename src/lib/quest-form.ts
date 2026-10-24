// Pure rules for the quest form's "More options" disclosure: whether it
// starts open, and where a given validation message should be shown.

import type { CounterSectionRow } from './counter-form'
import { QUEST_COPY } from './copy'

/** Messages that belong to fields under "More options". */
const MORE_OPTIONS_ERRORS: ReadonlySet<string> = new Set([
  QUEST_COPY.counterStartInvalid,
  QUEST_COPY.counterSectionTitleRequired,
  QUEST_COPY.counterSectionEndRequired,
  QUEST_COPY.counterSectionEndTooLow,
  QUEST_COPY.counterSectionEndAboveTotal,
  QUEST_COPY.counterSectionLastMustEndAtTotal,
])

/** Messages for the always-visible Unit input, shown inline under it. */
const UNIT_ERRORS: ReadonlySet<string> = new Set([
  QUEST_COPY.counterUnitRequired,
  QUEST_COPY.counterUnitTooLong,
])

/** Messages for the always-visible Total input, shown inline under it. */
const TOTAL_ERRORS: ReadonlySet<string> = new Set([
  QUEST_COPY.counterTotalRequired,
  QUEST_COPY.counterTotalTooLow,
  QUEST_COPY.counterTotalTooHigh,
])

/** The counter-only fields that live under "More options". */
export interface MoreOptionsState {
  startValue: string
  sections: readonly CounterSectionRow[]
  error: string | null
}

/** True when the validation message belongs to a field under "More options". */
export function isMoreOptionsError(error: string | null): boolean {
  return error !== null && MORE_OPTIONS_ERRORS.has(error)
}

/** True when the validation message belongs to the Unit input. */
export function isUnitError(error: string | null): boolean {
  return error !== null && UNIT_ERRORS.has(error)
}

/** True when the validation message belongs to the Total input. */
export function isTotalError(error: string | null): boolean {
  return error !== null && TOTAL_ERRORS.has(error)
}

/**
 * True when the message belongs to the always-visible Unit/Total row, where
 * it is rendered inline instead of in the general error slot.
 */
export function isTargetRowError(error: string | null): boolean {
  return isUnitError(error) || isTotalError(error)
}

/**
 * Whether the quest form's "More options" section should start open: when the
 * section already holds values (an edit) or a validation error belongs to a
 * field inside it. A blank create form starts collapsed.
 */
export function shouldOpenMoreOptions(state: MoreOptionsState): boolean {
  if (isMoreOptionsError(state.error)) return true
  if (state.startValue.trim() !== '' && state.startValue.trim() !== '0') {
    return true
  }
  if (
    state.sections.some(
      (row) => row.title.trim() !== '' || row.endAt.trim() !== '',
    )
  ) {
    return true
  }
  return false
}
