import { describe, expect, it } from 'vitest'
import {
  backupFileName,
  countBackupRecords,
  parseBackupFile,
  serializeBackup,
} from './backup'
import { createDefaultSettings } from './schema'
import { createExportData } from './storage/export-data'
import {
  entryFixture,
  goalFixture,
  questFixture,
  tagFixture,
  templateFixture,
} from './storage/test-records'
import type { ExportData } from './types'

const NOW = '2026-10-13T12:00:00.000Z'

function validExport(overrides: Partial<ExportData> = {}): ExportData {
  return {
    ...createExportData({
      entries: [],
      quests: [],
      tags: [],
      goalTemplates: [],
      dailyGoals: [],
      settings: createDefaultSettings(),
    }),
    ...overrides,
  }
}

describe('backupFileName', () => {
  it('names the file for today in the caller’s time zone', () => {
    expect(backupFileName(NOW, 'UTC')).toBe('amdy-world-backup-2026-10-13.json')
  })

  it('uses the local day near midnight, not the UTC day', () => {
    const lateNight = '2026-10-13T23:30:00.000Z'
    expect(backupFileName(lateNight, 'Asia/Tokyo')).toBe(
      'amdy-world-backup-2026-10-14.json',
    )
    expect(backupFileName(lateNight, 'America/Los_Angeles')).toBe(
      'amdy-world-backup-2026-10-13.json',
    )
  })
})

describe('countBackupRecords', () => {
  it('counts every record type and folds goals together', () => {
    const counts = countBackupRecords({
      entries: [entryFixture(), entryFixture()],
      quests: [questFixture()],
      tags: [tagFixture(), tagFixture(), tagFixture()],
      goalTemplates: [templateFixture()],
      dailyGoals: [goalFixture(), goalFixture()],
    })
    expect(counts).toEqual({ entries: 2, quests: 1, tags: 3, goals: 3 })
  })

  it('reports zeros for an empty backup', () => {
    expect(
      countBackupRecords({
        entries: [],
        quests: [],
        tags: [],
        goalTemplates: [],
        dailyGoals: [],
      }),
    ).toEqual({ entries: 0, quests: 0, tags: 0, goals: 0 })
  })
})

describe('parseBackupFile', () => {
  it('accepts a current export and returns the snapshot', () => {
    const original = validExport({
      entries: [entryFixture()],
      tags: [tagFixture()],
    })
    const result = parseBackupFile(serializeBackup(original))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.entries).toEqual(original.entries)
      expect(result.data.tags).toEqual(original.tags)
      expect(result.data.settings).toEqual(original.settings)
    }
  })

  it('accepts a legacy export missing newer fields', () => {
    const legacy = {
      schemaVersion: 1,
      exportedAt: NOW,
      entries: [],
      // Old quests had no skill or tags.
      quests: [
        {
          id: globalThis.crypto.randomUUID(),
          createdAt: NOW,
          updatedAt: NOW,
          deletedAt: null,
          title: 'Old quest',
          description: '',
          status: 'active',
          steps: [],
        },
      ],
      // Old payloads had no tag list at all.
      goalTemplates: [],
      dailyGoals: [],
      settings: { characterName: 'Amdy', schemaVersion: 1 },
    }
    const result = parseBackupFile(JSON.stringify(legacy))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.tags).toEqual([])
      expect(result.data.quests[0]?.skillId).toBe('programming')
      expect(result.data.quests[0]?.tagIds).toEqual([])
      expect(result.data.quests[0]?.kind).toBe('steps')
    }
  })

  it('rejects text that is not JSON', () => {
    expect(parseBackupFile('not a backup')).toEqual({
      ok: false,
      reason: 'invalid-json',
    })
  })

  it('rejects JSON that does not match the export format', () => {
    expect(parseBackupFile('{"schemaVersion":1}')).toEqual({
      ok: false,
      reason: 'invalid-format',
    })
    expect(parseBackupFile('[]')).toEqual({
      ok: false,
      reason: 'invalid-format',
    })
  })

  it('rejects a backup written by a newer schema version', () => {
    const fromTheFuture = validExport({ schemaVersion: 99 })
    expect(parseBackupFile(serializeBackup(fromTheFuture))).toEqual({
      ok: false,
      reason: 'unsupported-version',
    })
  })
})

describe('parseBackupFile and lastExportedAt', () => {
  it('accepts settings that never recorded a backup', () => {
    const result = parseBackupFile(serializeBackup(validExport()))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.settings.lastExportedAt).toBeUndefined()
    }
  })

  it('round-trips a valid ISO timestamp', () => {
    const stamped = validExport({
      settings: { ...createDefaultSettings(), lastExportedAt: NOW },
    })
    const result = parseBackupFile(serializeBackup(stamped))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.settings.lastExportedAt).toBe(NOW)
    }
  })

  it('rejects a settings timestamp that is not ISO', () => {
    const broken = validExport({
      settings: { ...createDefaultSettings(), lastExportedAt: 'yesterday' },
    })
    expect(parseBackupFile(serializeBackup(broken))).toEqual({
      ok: false,
      reason: 'invalid-format',
    })
  })
})
