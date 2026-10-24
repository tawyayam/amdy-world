import { describe, expect, it } from 'vitest'
import { computeProgress } from '@/lib/progress'
import { toLocalDateKey } from '@/lib/day'
import { ensureTodayGoals } from '@/lib/goals'
import { buildSampleData, countSampleRecords } from '@/lib/sample-data'
import {
  entryFixture,
  goalFixture,
  questFixture,
  tagFixture,
  templateFixture,
} from '@/lib/storage/test-records'

const NOW = '2026-10-13T12:00:00.000Z'
const TIME_ZONE = 'UTC'
const TODAY_KEY = toLocalDateKey(NOW, TIME_ZONE)

describe('buildSampleData', () => {
  it('produces demo entries, quests, and tags', () => {
    const { entries, quests, tags } = buildSampleData(NOW)
    expect(entries.length).toBeGreaterThan(0)
    expect(quests.length).toBeGreaterThan(0)
    expect(tags.length).toBeGreaterThan(0)
  })

  it('flags every record as sample data and gives it sync fields', () => {
    const { entries, quests, tags } = buildSampleData(NOW)
    for (const record of [...entries, ...quests, ...tags]) {
      expect(record.isSample).toBe(true)
      expect(record.deletedAt).toBeNull()
      expect(typeof record.id).toBe('string')
      expect(Number.isNaN(Date.parse(record.createdAt))).toBe(false)
    }
  })

  it('uses unique ids', () => {
    const { entries, quests, tags } = buildSampleData(NOW)
    const ids = [...entries, ...quests, ...tags].map((record) => record.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every quest a skill and only references existing tags', () => {
    const { quests, tags } = buildSampleData(NOW)
    const tagIds = new Set(tags.map((tag) => tag.id))
    for (const quest of quests) {
      expect(quest.skillId).toBeDefined()
      for (const id of quest.tagIds) {
        expect(tagIds.has(id)).toBe(true)
      }
    }
  })

  it('includes a tagged learning course quest and a reading quest', () => {
    const { quests } = buildSampleData(NOW)
    const course = quests.find(
      (quest) => quest.skillId === 'learning' && quest.tagIds.length > 0,
    )
    const reading = quests.find((quest) => quest.skillId === 'reading')
    expect(course).toBeDefined()
    expect(reading).toBeDefined()
  })

  it('links a promoted idea to a completed quest that came from it', () => {
    const { entries, quests } = buildSampleData(NOW)
    const idea = entries.find((record) => record.meta?.promotedToQuestId)
    const quest = quests.find((record) => record.originIdeaId === idea?.id)
    expect(idea).toBeDefined()
    expect(quest?.status).toBe('done')
    expect(quest?.id).toBe(idea?.meta?.promotedToQuestId)
  })

  it('includes a counter quest with sections, updates, and journey notes', () => {
    const { entries, quests } = buildSampleData(NOW)
    const counter = quests.find((quest) => quest.kind === 'counter')
    expect(counter).toBeDefined()
    expect(counter?.counter?.unit).toBe('lesson')
    expect(counter?.counter?.total).toBe(12)
    expect(counter?.counter?.sections).toHaveLength(3)
    expect(counter?.counter?.updates).toHaveLength(2)
    expect(counter?.steps).toEqual([])
    const notes = entries.filter((entry) => entry.meta?.questId === counter?.id)
    expect(notes.length).toBeGreaterThan(0)
    expect(notes.every((note) => note.type === 'note')).toBe(true)
  })

  it('marks every quest with an explicit kind', () => {
    const { quests } = buildSampleData(NOW)
    for (const quest of quests) {
      expect(['steps', 'counter']).toContain(quest.kind)
    }
  })

  it('includes Arabic and mixed-language content', () => {
    const { entries, quests } = buildSampleData(NOW)
    const hasArabic = (text: string) => /[\u0600-\u06FF]/.test(text)
    const hasLatin = (text: string) => /[A-Za-z]/.test(text)
    expect(entries.some((record) => hasArabic(record.text))).toBe(true)
    expect(
      entries.some((record) => hasArabic(record.text) && hasLatin(record.text)),
    ).toBe(true)
    expect(quests.some((record) => hasArabic(record.title))).toBe(true)
  })

  it('feeds real progress: positive XP and an active streak', () => {
    const { entries, quests } = buildSampleData(NOW)
    const progress = computeProgress({
      entries,
      quests,
      goals: [],
      todayKey: toLocalDateKey(NOW, TIME_ZONE),
      timeZone: TIME_ZONE,
    })
    expect(progress.totalXp).toBeGreaterThan(0)
    expect(progress.streak).toBeGreaterThan(0)
  })

  it('produces daily goals dated the given local day', () => {
    const withoutGoals = buildSampleData(NOW)
    expect(withoutGoals.dailyGoals).toEqual([])

    const withGoals = buildSampleData(NOW, TODAY_KEY)
    expect(withGoals.dailyGoals.length).toBeGreaterThan(0)
    for (const goal of withGoals.dailyGoals) {
      expect(goal.date).toBe(TODAY_KEY)
      expect(goal.isSample).toBe(true)
    }
  })

  it('keeps the sample goal template paused so it creates no real goals', () => {
    const { goalTemplates, dailyGoals } = buildSampleData(NOW, TODAY_KEY)
    expect(goalTemplates).toHaveLength(1)
    expect(goalTemplates[0]?.active).toBe(false)

    const drafts = ensureTodayGoals(goalTemplates, dailyGoals, TODAY_KEY)
    expect(drafts).toEqual([])
  })
})

describe('countSampleRecords', () => {
  it('counts only the records flagged as sample data', () => {
    expect(
      countSampleRecords({
        entries: [entryFixture({ isSample: true }), entryFixture()],
        quests: [questFixture({ isSample: true })],
        tags: [tagFixture()],
        goalTemplates: [templateFixture({ isSample: true })],
        dailyGoals: [goalFixture({ isSample: true }), goalFixture()],
      }),
    ).toBe(4)
  })

  it('is zero when nothing is flagged', () => {
    expect(
      countSampleRecords({
        entries: [entryFixture()],
        quests: [],
        tags: [],
        goalTemplates: [],
        dailyGoals: [],
      }),
    ).toBe(0)
  })
})
