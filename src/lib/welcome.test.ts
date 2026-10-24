import { describe, expect, it } from 'vitest'
import { createDefaultSettings } from './schema'
import {
  settingsForOnboarding,
  shouldShowWelcome,
  type OnboardingCounts,
} from './welcome'
import type { Settings } from './types'

const DEFAULT_NAME = 'Amdy'

function emptyCounts(): OnboardingCounts {
  return { entries: 0, quests: 0, tags: 0, goals: 0, templates: 0 }
}

function settings(overrides: Partial<Settings> = {}): Settings {
  return { ...createDefaultSettings(), ...overrides }
}

describe('shouldShowWelcome', () => {
  it('shows the welcome screen for a brand-new install', () => {
    expect(shouldShowWelcome(settings(), emptyCounts(), DEFAULT_NAME)).toBe(
      true,
    )
  })

  it('hides it once the person has been onboarded', () => {
    const onboarded = settings({ onboardedAt: '2026-10-20T09:00:00.000Z' })
    expect(shouldShowWelcome(onboarded, emptyCounts(), DEFAULT_NAME)).toBe(
      false,
    )
  })

  it('hides it for an old user who already has records', () => {
    const counts = { ...emptyCounts(), entries: 1 }
    expect(shouldShowWelcome(settings(), counts, DEFAULT_NAME)).toBe(false)
  })

  it('hides it when any single collection holds data', () => {
    const keys: (keyof OnboardingCounts)[] = [
      'entries',
      'quests',
      'tags',
      'goals',
      'templates',
    ]
    for (const key of keys) {
      const counts = { ...emptyCounts(), [key]: 1 }
      expect(shouldShowWelcome(settings(), counts, DEFAULT_NAME)).toBe(false)
    }
  })

  it('hides it for an old user whose only mark is a saved name', () => {
    const named = settings({ characterName: 'Wanderer' })
    expect(shouldShowWelcome(named, emptyCounts(), DEFAULT_NAME)).toBe(false)
  })

  it('shows it again after a reset clears everything', () => {
    // Reset hard-deletes all records and settings, so the store returns defaults.
    expect(shouldShowWelcome(settings(), emptyCounts(), DEFAULT_NAME)).toBe(
      true,
    )
  })

  it('treats a whitespace-only saved name as the untouched default', () => {
    const named = settings({ characterName: '  Amdy  ' })
    expect(shouldShowWelcome(named, emptyCounts(), DEFAULT_NAME)).toBe(true)
  })
})

describe('settingsForOnboarding', () => {
  it('saves the chosen name and the moment onboarding finished', () => {
    const result = settingsForOnboarding(
      settings(),
      'Wanderer',
      '2026-10-21T08:30:00.000Z',
    )
    expect(result.characterName).toBe('Wanderer')
    expect(result.onboardedAt).toBe('2026-10-21T08:30:00.000Z')
  })

  it('keeps every other setting unchanged', () => {
    const current = settings({
      characterName: 'Amdy',
      timelineView: { groupBy: 'week', sort: 'oldest', layout: 'grid' },
    })
    const result = settingsForOnboarding(
      current,
      'Wanderer',
      '2026-10-21T08:30:00.000Z',
    )
    expect(result.timelineView).toEqual({
      groupBy: 'week',
      sort: 'oldest',
      layout: 'grid',
    })
    expect(result.schemaVersion).toBe(current.schemaVersion)
  })

  it('does not mutate the settings it is given', () => {
    const current = settings()
    settingsForOnboarding(current, 'Wanderer', '2026-10-21T08:30:00.000Z')
    expect(current.characterName).toBe('Amdy')
    expect(current.onboardedAt).toBeUndefined()
  })
})
