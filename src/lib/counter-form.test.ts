import { describe, expect, it } from 'vitest'
import { validateCounterForm } from '@/lib/counter-form'
import { QUEST_COPY } from '@/lib/copy'
import type { CounterFormValues } from '@/lib/counter-form'

function values(overrides: Partial<CounterFormValues> = {}): CounterFormValues {
  return {
    unit: 'lesson',
    total: '12',
    startValue: '0',
    sections: [],
    ...overrides,
  }
}

describe('validateCounterForm', () => {
  it('accepts a minimal counter', () => {
    const result = validateCounterForm(values(), 0)
    expect(result.error).toBeNull()
    expect(result.counter).toEqual({
      unit: 'lesson',
      total: 12,
      startValue: 0,
      sections: [],
    })
  })

  it('requires a unit', () => {
    const result = validateCounterForm(values({ unit: '  ' }), 0)
    expect(result.error).toBe(QUEST_COPY.counterUnitRequired)
    expect(result.counter).toBeNull()
  })

  it('rejects a unit longer than 20 characters', () => {
    const result = validateCounterForm(values({ unit: 'x'.repeat(21) }), 0)
    expect(result.error).toBe(QUEST_COPY.counterUnitTooLong)
  })

  it('requires a whole-number total above zero', () => {
    expect(validateCounterForm(values({ total: '0' }), 0).error).toBe(
      QUEST_COPY.counterTotalRequired,
    )
    expect(validateCounterForm(values({ total: '3.5' }), 0).error).toBe(
      QUEST_COPY.counterTotalRequired,
    )
    expect(validateCounterForm(values({ total: '' }), 0).error).toBe(
      QUEST_COPY.counterTotalRequired,
    )
  })

  it('keeps the total at or above the current value when editing', () => {
    const result = validateCounterForm(values({ total: '4' }), 5)
    expect(result.error).toBe(QUEST_COPY.counterTotalTooLow)
  })

  it('rejects a starting value above the total', () => {
    const result = validateCounterForm(values({ startValue: '20' }), 0)
    expect(result.error).toBe(QUEST_COPY.counterStartInvalid)
  })

  it('accepts sections that end in increasing steps at the total', () => {
    const result = validateCounterForm(
      values({
        sections: [
          { id: 's1', title: 'Basics', endAt: '4' },
          { id: 's2', title: 'Capstone', endAt: '12' },
        ],
      }),
      0,
    )
    expect(result.error).toBeNull()
    expect(result.counter?.sections).toEqual([
      { id: 's1', title: 'Basics', endAt: 4 },
      { id: 's2', title: 'Capstone', endAt: 12 },
    ])
  })

  it('ignores rows left completely blank', () => {
    const result = validateCounterForm(
      values({
        sections: [{ id: 's1', title: '   ', endAt: '  ' }],
      }),
      0,
    )
    expect(result.error).toBeNull()
    expect(result.counter?.sections).toEqual([])
  })

  it('requires the last section to end at the total', () => {
    const result = validateCounterForm(
      values({
        sections: [
          { id: 's1', title: 'Basics', endAt: '4' },
          { id: 's2', title: 'More', endAt: '10' },
        ],
      }),
      0,
    )
    expect(result.error).toBe(QUEST_COPY.counterSectionLastMustEndAtTotal)
  })

  it('rejects sections that do not increase', () => {
    const result = validateCounterForm(
      values({
        sections: [
          { id: 's1', title: 'Basics', endAt: '6' },
          { id: 's2', title: 'More', endAt: '6' },
        ],
      }),
      0,
    )
    expect(result.error).toBe(QUEST_COPY.counterSectionEndTooLow)
  })

  it('rejects a section ending past the total', () => {
    const result = validateCounterForm(
      values({
        sections: [{ id: 's1', title: 'Basics', endAt: '20' }],
      }),
      0,
    )
    expect(result.error).toBe(QUEST_COPY.counterSectionEndAboveTotal)
  })

  it('rejects a named section without an end', () => {
    const result = validateCounterForm(
      values({
        sections: [{ id: 's1', title: 'Basics', endAt: '  ' }],
      }),
      0,
    )
    expect(result.error).toBe(QUEST_COPY.counterSectionEndRequired)
  })

  it('rejects a section with an end but no name', () => {
    const result = validateCounterForm(
      values({
        sections: [{ id: 's1', title: '  ', endAt: '4' }],
      }),
      0,
    )
    expect(result.error).toBe(QUEST_COPY.counterSectionTitleRequired)
  })
})
