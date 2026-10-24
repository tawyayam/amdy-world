import { describe, expect, it } from 'vitest'
import { validateCharacterName } from './character-name'

describe('validateCharacterName', () => {
  it('accepts a normal name and trims surrounding whitespace', () => {
    expect(validateCharacterName('  Amdy  ')).toEqual({
      ok: true,
      value: 'Amdy',
    })
  })

  it('rejects an empty name', () => {
    expect(validateCharacterName('')).toEqual({ ok: false, reason: 'empty' })
  })

  it('rejects a whitespace-only name', () => {
    expect(validateCharacterName('   \t  ')).toEqual({
      ok: false,
      reason: 'empty',
    })
  })

  it('accepts a name of exactly the maximum length', () => {
    const name = 'a'.repeat(30)
    expect(validateCharacterName(name)).toEqual({ ok: true, value: name })
  })

  it('rejects a name one character over the maximum', () => {
    expect(validateCharacterName('a'.repeat(31))).toEqual({
      ok: false,
      reason: 'too-long',
    })
  })

  it('measures the length after trimming, not the raw input', () => {
    const padded = `  ${'a'.repeat(30)}  `
    expect(validateCharacterName(padded)).toEqual({
      ok: true,
      value: 'a'.repeat(30),
    })
  })

  it('accepts Arabic and mixed-language names', () => {
    expect(validateCharacterName('أحمد')).toEqual({ ok: true, value: 'أحمد' })
    expect(validateCharacterName('Amdy عماد')).toEqual({
      ok: true,
      value: 'Amdy عماد',
    })
  })
})
