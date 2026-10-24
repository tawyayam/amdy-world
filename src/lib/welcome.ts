// Decides whether to show the first-run welcome screen. The rule is pure so it
// is unit tested: storage stays silent about onboarding, and the screen depends
// only on the saved settings plus how many records already exist.

import type { Settings } from '@/lib/types'

/** How many live records exist, one number per collection. */
export interface OnboardingCounts {
  entries: number
  quests: number
  tags: number
  goals: number
  templates: number
}

/**
 * True only for a brand-new install: no `onboardedAt`, no records of any kind,
 * and a character name left at the untouched default. A user who already has any
 * record, or a saved (non-default) name, counts as onboarded and never sees the
 * welcome screen, so old data and old exports keep opening straight into the app.
 */
export function shouldShowWelcome(
  settings: Settings,
  counts: OnboardingCounts,
  defaultName: string,
): boolean {
  if (settings.onboardedAt) return false

  const hasRecords =
    counts.entries > 0 ||
    counts.quests > 0 ||
    counts.tags > 0 ||
    counts.goals > 0 ||
    counts.templates > 0
  if (hasRecords) return false

  // A saved name different from the untouched default means the person has been
  // here before, so treat them as onboarded even without an `onboardedAt`.
  return settings.characterName.trim() === defaultName.trim()
}

/**
 * The settings to save when the welcome screen is completed: the chosen name and
 * the moment onboarding finished. Kept pure so the caller owns the timestamp.
 */
export function settingsForOnboarding(
  current: Settings,
  name: string,
  timestamp: string,
): Settings {
  return { ...current, characterName: name, onboardedAt: timestamp }
}
