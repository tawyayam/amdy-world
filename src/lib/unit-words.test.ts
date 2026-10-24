import { describe, expect, it } from 'vitest'
import { unitLabel } from './unit-words'

describe('unitLabel', () => {
  it('capitalizes a lowercase Latin unit', () => {
    expect(unitLabel('lesson')).toBe('Lesson')
    expect(unitLabel('workout')).toBe('Workout')
  })

  it('leaves an already capitalized unit alone', () => {
    expect(unitLabel('Lesson')).toBe('Lesson')
  })

  it('only touches the first letter of a multi-word unit', () => {
    expect(unitLabel('coding session')).toBe('Coding session')
  })

  it('keeps an Arabic unit unchanged', () => {
    expect(unitLabel('درس')).toBe('درس')
    expect(unitLabel('تمرين يومي')).toBe('تمرين يومي')
  })

  it('keeps digits and empty strings unchanged', () => {
    expect(unitLabel('42')).toBe('42')
    expect(unitLabel('')).toBe('')
  })

  it('keeps non-Latin scripts unchanged', () => {
    expect(unitLabel('練習')).toBe('練習')
  })
})
