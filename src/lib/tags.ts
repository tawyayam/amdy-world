// Pure helpers for tags: color tokens, unique-name checks, and resolving the
// tags attached to a quest. Tag names are unique case-insensitively; the check
// lives here (not in the storage adapter) so the adapter stays a dumb store.

import type { Tag, TagColor } from '@/lib/types'

/** The color tokens a tag can carry, in picker order. */
export const TAG_COLOR_TOKENS: readonly TagColor[] = [
  'neutral',
  'gold',
  'purple',
  'teal',
  'orange',
  'rose',
]

/** Resolves a tag color token to its CSS variable, defaulting to neutral. */
export function tagColorVar(colorToken?: TagColor): string {
  return `var(--tag-${colorToken ?? 'neutral'})`
}

/** Case-insensitive key used to compare tag names for uniqueness. */
export function tagNameKey(name: string): string {
  return name.trim().toLocaleLowerCase()
}

/**
 * True when another live tag already uses `name`. Pass `exceptId` when renaming
 * so a tag does not clash with itself.
 */
export function isTagNameTaken(
  tags: readonly Tag[],
  name: string,
  exceptId?: string,
): boolean {
  const key = tagNameKey(name)
  return tags.some((tag) => tag.id !== exceptId && tagNameKey(tag.name) === key)
}

/** The live tags referenced by a quest's ids, in the tag list's order. */
export function tagsForQuest(
  tagIds: readonly string[],
  tags: readonly Tag[],
): Tag[] {
  return tags.filter((tag) => tagIds.includes(tag.id))
}
