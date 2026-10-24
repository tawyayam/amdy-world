import { describe, expect, it } from 'vitest'
import { parseBackupFile } from './backup'
import { createEmergencyBackup } from './error-recovery'
import { createDefaultSettings } from './schema'
import { InMemoryAdapter } from './storage/in-memory-adapter'
import { entryFixture } from './storage/test-records'

const TIMESTAMP = '2026-10-13T23:30:00.000Z'

describe('createEmergencyBackup', () => {
  it('names the file for the local day and returns a parseable snapshot', async () => {
    const adapter = new InMemoryAdapter()
    await adapter.saveEntry(entryFixture({ text: 'Emergency entry' }))

    const download = await createEmergencyBackup(
      adapter,
      TIMESTAMP,
      'Asia/Tokyo',
    )

    expect(download.fileName).toBe('amdy-world-backup-2026-10-14.json')
    const parsed = parseBackupFile(download.contents)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.data.entries.map((entry) => entry.text)).toEqual([
        'Emergency entry',
      ])
    }
  })

  it('never writes to storage and does not stamp lastExportedAt', async () => {
    const adapter = new InMemoryAdapter()
    await adapter.saveSettings({
      ...createDefaultSettings(),
      characterName: 'عماد',
    })

    await createEmergencyBackup(adapter, TIMESTAMP, 'Asia/Tokyo')

    const settings = await adapter.getSettings()
    expect(settings.lastExportedAt).toBeUndefined()
    expect(settings.characterName).toBe('عماد')
  })

  it('returns an empty but valid snapshot when storage is empty', async () => {
    const adapter = new InMemoryAdapter()

    const download = await createEmergencyBackup(adapter, TIMESTAMP, 'UTC')

    const parsed = parseBackupFile(download.contents)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.data.entries).toEqual([])
      expect(parsed.data.quests).toEqual([])
    }
  })
})
