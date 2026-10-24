import { describe, expect, it } from 'vitest'
import {
  createBackupDownload,
  importBackupInto,
  loadSampleDataInto,
  removeSampleDataFrom,
  resetAllData,
} from './backup-actions'
import { parseBackupFile } from './backup'
import { countSampleRecords } from './sample-data'
import { createDefaultSettings } from './schema'
import { InMemoryAdapter } from './storage/in-memory-adapter'
import { entryFixture, tagFixture } from './storage/test-records'

const TIMESTAMP = '2026-10-13T23:30:00.000Z'
const TODAY = '2026-10-14'

async function sampleCount(adapter: InMemoryAdapter): Promise<number> {
  const data = await adapter.exportAll()
  return countSampleRecords(data)
}

describe('createBackupDownload', () => {
  it('stamps lastExportedAt and names the file for the local day', async () => {
    const adapter = new InMemoryAdapter()
    await adapter.saveSettings({
      ...createDefaultSettings(),
      characterName: 'عماد',
    })

    const download = await createBackupDownload(
      adapter,
      TIMESTAMP,
      'Asia/Tokyo',
    )

    expect(download.fileName).toBe('amdy-world-backup-2026-10-14.json')
    expect((await adapter.getSettings()).lastExportedAt).toBe(TIMESTAMP)

    const parsed = parseBackupFile(download.contents)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.data.settings.lastExportedAt).toBe(TIMESTAMP)
      expect(parsed.data.settings.characterName).toBe('عماد')
    }
  })
})

describe('importBackupInto', () => {
  it('replaces all current data with the snapshot', async () => {
    const adapter = new InMemoryAdapter()
    await adapter.saveEntry(entryFixture({ text: 'Old entry' }))
    const snapshot = await adapter.exportAll()

    const other = new InMemoryAdapter()
    await other.saveEntry(entryFixture({ text: 'Replacement' }))
    const replacement = await other.exportAll()

    await importBackupInto(adapter, replacement)

    expect((await adapter.listEntries()).map((entry) => entry.text)).toEqual([
      'Replacement',
    ])
    expect(snapshot.entries).toHaveLength(1)
  })
})

describe('resetAllData', () => {
  it('clears every record and restores default settings', async () => {
    const adapter = new InMemoryAdapter()
    await adapter.saveEntry(entryFixture())
    await adapter.saveSettings({
      ...createDefaultSettings(),
      characterName: 'Someone',
    })

    await resetAllData(adapter)

    expect(await adapter.listEntries()).toEqual([])
    expect(await adapter.getSettings()).toEqual(createDefaultSettings())
  })
})

describe('sample data', () => {
  it('does not duplicate records when loaded twice', async () => {
    const adapter = new InMemoryAdapter()
    await loadSampleDataInto(adapter, TIMESTAMP, TODAY)
    const first = await sampleCount(adapter)

    await loadSampleDataInto(adapter, TIMESTAMP, TODAY)
    const second = await sampleCount(adapter)

    expect(first).toBeGreaterThan(0)
    expect(second).toBe(first)
  })

  it('leaves real records untouched when samples are removed', async () => {
    const adapter = new InMemoryAdapter()
    const realEntry = entryFixture({ text: 'My real work' })
    const realTag = tagFixture({ name: 'mine' })
    await adapter.saveEntry(realEntry)
    await adapter.saveTag(realTag)
    await loadSampleDataInto(adapter, TIMESTAMP, TODAY)

    await removeSampleDataFrom(adapter)

    expect(await sampleCount(adapter)).toBe(0)
    expect((await adapter.listEntries()).map((entry) => entry.id)).toEqual([
      realEntry.id,
    ])
    expect((await adapter.listTags()).map((tag) => tag.id)).toEqual([
      realTag.id,
    ])
  })
})
