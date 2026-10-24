import { describe, expect, it } from 'vitest'
import { isolate } from '@/lib/bidi'

describe('isolate', () => {
  it('returns empty string for empty input', () => {
    expect(isolate('')).toBe('')
  })

  it('wraps Latin text', () => {
    const result = isolate('Hello')
    expect(result.startsWith('\u2068')).toBe(true)
    expect(result.endsWith('\u2069')).toBe(true)
    expect(result).toBe('\u2068Hello\u2069')
  })

  it('wraps Arabic text', () => {
    const result = isolate('كتاب')
    expect(result).toBe('\u2068كتاب\u2069')
  })

  it('wraps mixed text', () => {
    const result = isolate('قرأت Deep Work اليوم')
    expect(result).toBe('\u2068قرأت Deep Work اليوم\u2069')
  })

  it('adds only U+2068 and U+2069', () => {
    const result = isolate('test')
    const withoutIsolates = result.replace(/\u2068|\u2069/g, '')
    expect(withoutIsolates).toBe('test')
    expect(result.length).toBe('test'.length + 2)
  })
})
