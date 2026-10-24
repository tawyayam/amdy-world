// Validation for the character name, shared by the Profile card and the settings
// schema's limit. It is pure so the rules are unit tested (and so Arabic,
// mixed, and whitespace-only names behave the same everywhere).

import { CHARACTER_NAME_MAX_LENGTH } from '@/lib/schema/settings'

/** Why a typed character name cannot be saved. */
export type CharacterNameError = 'empty' | 'too-long'

/** A trimmed character name, or the reason it was rejected. */
export type CharacterNameResult =
  { ok: true; value: string } | { ok: false; reason: CharacterNameError }

/**
 * Trims a typed name and checks it against the shared limit. A missing or
 * whitespace-only name is `empty`; a name longer than the limit (after trimming,
 * so surrounding spaces never cause a false rejection) is `too-long`.
 */
export function validateCharacterName(input: string): CharacterNameResult {
  const value = input.trim()
  if (value.length === 0) {
    return { ok: false, reason: 'empty' }
  }
  if (value.length > CHARACTER_NAME_MAX_LENGTH) {
    return { ok: false, reason: 'too-long' }
  }
  return { ok: true, value }
}
