import { describe, expect, it } from 'vitest'
import { SKILL_BY_ID, SKILLS } from '@/lib/skills'

describe('skills config', () => {
  it('defines exactly the four expected skills', () => {
    expect(SKILLS.map((skill) => skill.id)).toEqual([
      'programming',
      'reading',
      'learning',
      'ideas',
    ])
  })

  it('gives every skill a name, icon, and color token', () => {
    for (const skill of SKILLS) {
      expect(skill.name.length).toBeGreaterThan(0)
      // React 19 forwardRef components are objects, not functions.
      expect(['function', 'object']).toContain(typeof skill.icon)
      expect(skill.color).toMatch(/^var\(--skill-/)
    }
  })

  it('exposes every skill in the lookup map', () => {
    for (const skill of SKILLS) {
      expect(SKILL_BY_ID[skill.id]).toBe(skill)
    }
  })
})
