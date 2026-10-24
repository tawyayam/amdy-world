import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CHARACTER_NAME } from '@/lib/copy'
import { SCHEMA_VERSION } from '@/lib/schema/common'
import {
  entryFixture,
  goalFixture,
  questFixture,
  tagFixture,
  templateFixture,
  type AdapterHarness,
} from './test-records'
import type { StorageAdapter } from './types'

/** Runs the same contract against every adapter so implementations stay equal. */
export function runStorageContract(
  name: string,
  createHarness: () => AdapterHarness,
): void {
  describe(name, () => {
    let adapter: StorageAdapter
    let dispose: () => void

    beforeEach(async () => {
      const harness = createHarness()
      adapter = harness.adapter
      dispose = harness.dispose
      await adapter.clearAll()
    })

    afterEach(() => {
      dispose()
    })

    it('starts empty with default settings', async () => {
      expect(await adapter.listEntries()).toEqual([])
      expect(await adapter.listQuests()).toEqual([])
      expect(await adapter.listTags()).toEqual([])
      expect(await adapter.listGoalTemplates()).toEqual([])
      expect(await adapter.listDailyGoals()).toEqual([])

      const settings = await adapter.getSettings()
      expect(settings).toEqual({
        characterName: DEFAULT_CHARACTER_NAME,
        schemaVersion: SCHEMA_VERSION,
      })
    })

    it('saves and lists entries, oldest first', async () => {
      const newer = entryFixture({
        text: 'Newer',
        createdAt: '2026-01-02T00:00:00.000Z',
      })
      const older = entryFixture({
        text: 'Older',
        createdAt: '2026-01-01T00:00:00.000Z',
      })

      await adapter.saveEntry(newer)
      await adapter.saveEntry(older)

      const listed = await adapter.listEntries()
      expect(listed.map((item) => item.text)).toEqual(['Older', 'Newer'])
    })

    it('overwrites an entry saved with the same id', async () => {
      const original = entryFixture({ text: 'Draft' })
      await adapter.saveEntry(original)
      await adapter.saveEntry({
        ...original,
        text: 'Final',
        updatedAt: '2026-02-01T00:00:00.000Z',
      })

      const listed = await adapter.listEntries()
      expect(listed).toHaveLength(1)
      expect(listed[0]?.text).toBe('Final')
    })

    it('soft-deletes an entry but keeps it in the export', async () => {
      const saved = await adapter.saveEntry(entryFixture({ text: 'Gone' }))
      await adapter.deleteEntry(saved.id)

      expect(await adapter.listEntries()).toEqual([])

      const exported = await adapter.exportAll()
      expect(exported.entries).toHaveLength(1)
      expect(exported.entries[0]?.deletedAt).not.toBeNull()
    })

    it('lists daily goals including the soft-deleted ones', async () => {
      const kept = await adapter.saveDailyGoal(
        goalFixture({
          id: 'goal-kept',
          title: 'Kept',
          createdAt: '2026-01-01T00:00:00.000Z',
        }),
      )
      const gone = await adapter.saveDailyGoal(
        goalFixture({
          id: 'goal-gone',
          title: 'Gone',
          createdAt: '2026-01-02T00:00:00.000Z',
        }),
      )
      await adapter.deleteDailyGoal(gone.id)

      // The live list hides the deleted goal; the full list keeps it ordered.
      expect(await adapter.listDailyGoals()).toEqual([kept])
      const all = await adapter.listDailyGoalsIncludingDeleted()
      expect(all.map((goal) => goal.title)).toEqual(['Kept', 'Gone'])
      expect(all[1]?.deletedAt).not.toBeNull()
    })

    it('round-trips quests, goal templates, and daily goals', async () => {
      const quest = questFixture()
      const template = templateFixture()
      const goal = goalFixture({ templateId: template.id })

      await adapter.saveQuest(quest)
      await adapter.saveGoalTemplate(template)
      await adapter.saveDailyGoal(goal)

      expect(await adapter.listQuests()).toEqual([quest])
      expect(await adapter.listGoalTemplates()).toEqual([template])
      expect(await adapter.listDailyGoals()).toEqual([goal])
    })

    it('round-trips a counter quest with its update log', async () => {
      const counterQuest = questFixture({
        title: 'Complete the TypeScript course',
        kind: 'counter',
        counter: {
          unit: 'lesson',
          total: 12,
          startValue: 0,
          sections: [{ id: 'section-1', title: 'Basics', endAt: 4 }],
          updates: [
            { id: 'update-1', at: '2026-01-01T08:00:00.000Z', delta: 3 },
            { id: 'update-2', at: '2026-01-02T09:00:00.000Z', delta: -1 },
          ],
        },
      })

      await adapter.saveQuest(counterQuest)

      expect(await adapter.listQuests()).toEqual([counterQuest])
      const exported = await adapter.exportAll()
      expect(exported.quests[0]?.counter).toEqual(counterQuest.counter)
    })

    it('saves tags and soft-deletes them out of the list', async () => {
      const kept = await adapter.saveTag(
        tagFixture({
          name: 'frontend',
          createdAt: '2026-01-01T00:00:00.000Z',
        }),
      )
      const removed = await adapter.saveTag(
        tagFixture({
          name: 'books',
          createdAt: '2026-01-02T00:00:00.000Z',
        }),
      )

      expect((await adapter.listTags()).map((tag) => tag.name)).toEqual([
        'frontend',
        'books',
      ])

      await adapter.deleteTag(removed.id)

      expect((await adapter.listTags()).map((tag) => tag.name)).toEqual([
        'frontend',
      ])
      const exported = await adapter.exportAll()
      expect(exported.tags).toHaveLength(2)
      const gone = exported.tags.find((tag) => tag.id === removed.id)
      expect(gone?.deletedAt).not.toBeNull()
      expect(kept.deletedAt).toBeNull()
    })

    it('restores soft-deleted tags and templates without losing quest links', async () => {
      const tag = await adapter.saveTag(tagFixture({ name: 'frontend' }))
      const template = await adapter.saveGoalTemplate(
        templateFixture({ title: 'Morning pages' }),
      )
      const quest = await adapter.saveQuest(
        questFixture({ id: 'quest-linked', tagIds: [tag.id] }),
      )
      await adapter.deleteTag(tag.id)
      await adapter.deleteGoalTemplate(template.id)

      expect(await adapter.listTags()).toEqual([])
      expect(await adapter.listGoalTemplates()).toEqual([])
      // A deleted tag is soft-deleted only; the quest keeps the id for undo.
      expect((await adapter.listQuests())[0]?.tagIds).toEqual([tag.id])

      const restoredTag = await adapter.saveTag({
        ...tag,
        deletedAt: null,
        updatedAt: '2026-01-03T00:00:00.000Z',
      })
      const restoredTemplate = await adapter.saveGoalTemplate({
        ...template,
        deletedAt: null,
        updatedAt: '2026-01-03T00:00:00.000Z',
      })

      expect(await adapter.listTags()).toEqual([restoredTag])
      expect(await adapter.listGoalTemplates()).toEqual([restoredTemplate])
      expect((await adapter.listQuests())[0]?.tagIds).toEqual(quest.tagIds)
    })

    it('persists settings', async () => {
      await adapter.saveSettings({
        characterName: 'Amdy the Great',
        schemaVersion: SCHEMA_VERSION,
      })

      const settings = await adapter.getSettings()
      expect(settings.characterName).toBe('Amdy the Great')
    })

    it('round-trips the optional timeline view', async () => {
      await adapter.saveSettings({
        characterName: 'Amdy',
        schemaVersion: SCHEMA_VERSION,
        timelineView: { groupBy: 'week', sort: 'oldest', layout: 'grid' },
      })

      const settings = await adapter.getSettings()
      expect(settings.timelineView).toEqual({
        groupBy: 'week',
        sort: 'oldest',
        layout: 'grid',
      })
    })

    it('omits the timeline view when it was never set', async () => {
      await adapter.saveSettings({
        characterName: 'Amdy',
        schemaVersion: SCHEMA_VERSION,
      })

      const settings = await adapter.getSettings()
      expect(settings.timelineView).toBeUndefined()
    })

    it('exports and re-imports the full snapshot', async () => {
      const entry = await adapter.saveEntry(entryFixture({ text: 'Keep me' }))
      await adapter.saveEntry(entryFixture({ text: 'Sample', isSample: true }))
      const quest = await adapter.saveQuest(questFixture())
      const tag = await adapter.saveTag(tagFixture({ name: 'frontend' }))
      const template = await adapter.saveGoalTemplate(templateFixture())
      const goal = await adapter.saveDailyGoal(
        goalFixture({ templateId: template.id }),
      )
      await adapter.deleteEntry(entry.id)
      await adapter.saveSettings({
        characterName: 'Amdy',
        schemaVersion: SCHEMA_VERSION,
      })

      const snapshot = await adapter.exportAll()
      await adapter.clearAll()
      expect(await adapter.listEntries()).toEqual([])

      await adapter.importAll(snapshot)

      const exported = await adapter.exportAll()
      expect(exported.entries).toEqual(snapshot.entries)
      expect(exported.quests).toEqual([quest])
      expect(exported.tags).toEqual([tag])
      expect(exported.goalTemplates).toEqual([template])
      expect(exported.dailyGoals).toEqual([goal])
      expect(exported.settings).toEqual(snapshot.settings)
    })

    it('replaces existing data on import', async () => {
      await adapter.saveEntry(entryFixture({ text: 'Old' }))
      const snapshot = await adapter.exportAll()
      await adapter.saveEntry(entryFixture({ text: 'Should vanish' }))

      await adapter.importAll(snapshot)

      const listed = await adapter.listEntries()
      expect(listed.map((item) => item.text)).toEqual(['Old'])
    })

    it('clears everything on clearAll', async () => {
      await adapter.saveEntry(entryFixture({ isSample: true }))
      await adapter.saveQuest(questFixture())
      await adapter.saveTag(tagFixture())
      await adapter.saveSettings({
        characterName: 'Amdy the Great',
        schemaVersion: SCHEMA_VERSION,
      })

      await adapter.clearAll()

      expect(await adapter.listEntries()).toEqual([])
      expect(await adapter.listQuests()).toEqual([])
      expect(await adapter.listTags()).toEqual([])
      const settings = await adapter.getSettings()
      expect(settings.characterName).toBe(DEFAULT_CHARACTER_NAME)
    })

    it('removes only sample records', async () => {
      await adapter.saveEntry(entryFixture({ text: 'Real' }))
      await adapter.saveEntry(entryFixture({ text: 'Sample', isSample: true }))
      await adapter.saveQuest(questFixture({ isSample: true }))
      await adapter.saveTag(tagFixture({ isSample: true }))
      await adapter.saveGoalTemplate(templateFixture({ isSample: true }))

      await adapter.removeSampleData()

      const entries = await adapter.listEntries()
      expect(entries.map((item) => item.text)).toEqual(['Real'])
      expect(await adapter.listQuests()).toEqual([])
      expect(await adapter.listTags()).toEqual([])
      expect(await adapter.listGoalTemplates()).toEqual([])
    })
  })
}
