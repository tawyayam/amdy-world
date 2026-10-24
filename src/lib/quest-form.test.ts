import { describe, expect, it } from 'vitest'
import { QUEST_COPY } from './copy'
import {
  isMoreOptionsError,
  isTargetRowError,
  isTotalError,
  isUnitError,
  shouldOpenMoreOptions,
  type MoreOptionsState,
} from './quest-form'

function blankState(
  overrides: Partial<MoreOptionsState> = {},
): MoreOptionsState {
  return {
    startValue: '',
    sections: [],
    error: null,
    ...overrides,
  }
}

describe('shouldOpenMoreOptions', () => {
  it('stays closed for a blank create form', () => {
    expect(shouldOpenMoreOptions(blankState())).toBe(false)
  })

  it('opens for a non-zero starting value, but not for zero or blank', () => {
    expect(shouldOpenMoreOptions(blankState({ startValue: '5' }))).toBe(true)
    expect(shouldOpenMoreOptions(blankState({ startValue: '0' }))).toBe(false)
    expect(shouldOpenMoreOptions(blankState({ startValue: '  ' }))).toBe(false)
  })

  it('opens when any section row has content, ignoring blank rows', () => {
    const filled = { id: 'a', title: 'Basics', endAt: '5' }
    const empty = { id: 'b', title: '  ', endAt: '' }
    expect(shouldOpenMoreOptions(blankState({ sections: [empty] }))).toBe(false)
    expect(
      shouldOpenMoreOptions(blankState({ sections: [empty, filled] })),
    ).toBe(true)
  })

  it('opens for a validation error that belongs inside', () => {
    expect(
      shouldOpenMoreOptions(
        blankState({ error: QUEST_COPY.counterSectionEndRequired }),
      ),
    ).toBe(true)
    expect(
      shouldOpenMoreOptions(
        blankState({ error: QUEST_COPY.counterStartInvalid }),
      ),
    ).toBe(true)
  })

  it('stays closed for a validation error that belongs outside', () => {
    expect(
      shouldOpenMoreOptions(blankState({ error: QUEST_COPY.titleRequired })),
    ).toBe(false)
    expect(
      shouldOpenMoreOptions(
        blankState({ error: QUEST_COPY.counterTotalRequired }),
      ),
    ).toBe(false)
  })
})

describe('isMoreOptionsError', () => {
  it('is false for null and for outside messages', () => {
    expect(isMoreOptionsError(null)).toBe(false)
    expect(isMoreOptionsError(QUEST_COPY.titleRequired)).toBe(false)
  })

  it('is true for start value and section messages', () => {
    expect(isMoreOptionsError(QUEST_COPY.counterStartInvalid)).toBe(true)
    expect(isMoreOptionsError(QUEST_COPY.counterSectionTitleRequired)).toBe(
      true,
    )
  })
})

describe('isUnitError and isTotalError', () => {
  it('separates unit messages from total messages', () => {
    expect(isUnitError(QUEST_COPY.counterUnitRequired)).toBe(true)
    expect(isUnitError(QUEST_COPY.counterTotalRequired)).toBe(false)
    expect(isTotalError(QUEST_COPY.counterTotalTooLow)).toBe(true)
    expect(isTotalError(QUEST_COPY.counterUnitRequired)).toBe(false)
    expect(isUnitError(null)).toBe(false)
    expect(isTotalError(null)).toBe(false)
  })
})

describe('isTargetRowError', () => {
  it('is true for unit and total messages', () => {
    expect(isTargetRowError(QUEST_COPY.counterTotalRequired)).toBe(true)
    expect(isTargetRowError(QUEST_COPY.counterTotalTooLow)).toBe(true)
    expect(isTargetRowError(QUEST_COPY.counterUnitRequired)).toBe(true)
  })

  it('is false for null and for messages from elsewhere', () => {
    expect(isTargetRowError(null)).toBe(false)
    expect(isTargetRowError(QUEST_COPY.counterSectionEndRequired)).toBe(false)
  })
})
