import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { createDefaultSettings } from '@/lib/schema'
import { DexieAdapter } from './dexie-adapter'
import { InMemoryAdapter } from './in-memory-adapter'
import {
  entryFixture,
  goalFixture,
  questFixture,
  tagFixture,
  templateFixture,
  type AdapterHarness,
} from './test-records'
import type { StorageAdapter } from './types'
import type { ExportData, SyncFields } from '@/lib/types'

const TIMESTAMP = '2026-10-13T12:00:00.000Z'

/** Everything an export can hold, including soft-deleted and sample rows. */
async function populate(adapter: StorageAdapter): Promise<void> {
  const deletedAt = '2026-10-10T08:00:00.000Z'
  await adapter.saveEntry(entryFixture({ text: 'Live entry' }))
  await adapter.saveEntry(
    entryFixture({ text: 'Sample entry', isSample: true }),
  )
  await adapter.saveEntry(
    entryFixture({ text: 'Deleted entry', deletedAt, updatedAt: deletedAt }),
  )

  await adapter.saveQuest(questFixture({ title: 'A live quest' }))
  await adapter.saveQuest(
    questFixture({ title: 'A sample quest', isSample: true }),
  )

  await adapter.saveTag(tagFixture({ name: 'frontend' }))
  await adapter.saveTag(tagFixture({ name: 'sample tag', isSample: true }))

  await adapter.saveGoalTemplate(templateFixture({ title: 'Recurring' }))
  await adapter.saveGoalTemplate(
    templateFixture({ title: 'Sample template', isSample: true }),
  )

  await adapter.saveDailyGoal(goalFixture({ date: '2026-10-13' }))
  await adapter.saveDailyGoal(
    goalFixture({ date: '2026-10-13', title: 'Sample goal', isSample: true }),
  )

  await adapter.saveSettings({
    characterName: 'عماد',
    schemaVersion: 1,
    timelineView: { groupBy: 'skill', sort: 'oldest', layout: 'grid' },
    lastExportedAt: TIMESTAMP,
  })
}

function byId<T extends SyncFields>(records: readonly T[]): T[] {
  return [...records].sort((a, b) => a.id.localeCompare(b.id))
}

function expectSameData(after: ExportData, before: ExportData): void {
  expect(byId(after.entries)).toEqual(byId(before.entries))
  expect(byId(after.quests)).toEqual(byId(before.quests))
  expect(byId(after.tags)).toEqual(byId(before.tags))
  expect(byId(after.goalTemplates)).toEqual(byId(before.goalTemplates))
  expect(byId(after.dailyGoals)).toEqual(byId(before.dailyGoals))
  expect(after.settings).toEqual(before.settings)
}

function runBackupRoundTrip(
  name: string,
  createHarness: () => AdapterHarness,
): void {
  describe(`${name} backup round trip`, () => {
    it('restores every record and the settings exactly', async () => {
      const { adapter, dispose } = createHarness()
      try {
        await populate(adapter)
        const before = await adapter.exportAll()
        expect(before.entries).toHaveLength(3)

        await adapter.clearAll()
        expect(await adapter.getSettings()).toEqual(createDefaultSettings())

        await adapter.importAll(before)
        expectSameData(await adapter.exportAll(), before)
      } finally {
        dispose()
      }
    })

    it('leaves existing data untouched when an import fails', async () => {
      const { adapter, dispose } = createHarness()
      try {
        await adapter.saveEntry(entryFixture({ text: 'Keep me' }))
        const before = await adapter.exportAll()

        const broken = {
          ...before,
          entries: null,
        } as unknown as ExportData
        await expect(adapter.importAll(broken)).rejects.toThrow()

        expectSameData(await adapter.exportAll(), before)
      } finally {
        dispose()
      }
    })
  })
}

runBackupRoundTrip('InMemoryAdapter', () => ({
  adapter: new InMemoryAdapter(),
  dispose: () => {},
}))

runBackupRoundTrip('DexieAdapter', () => {
  const adapter = new DexieAdapter(
    `round-trip-${globalThis.crypto.randomUUID()}`,
  )
  return { adapter, dispose: () => adapter.close() }
})
