import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { runStorageContract } from './contract-suite'
import { DexieAdapter } from './dexie-adapter'
import { StorageUnavailableError, isIndexedDbAvailable } from './errors'
import { InMemoryAdapter } from './in-memory-adapter'

runStorageContract('InMemoryAdapter', () => ({
  adapter: new InMemoryAdapter(),
  dispose: () => {},
}))

runStorageContract('DexieAdapter', () => {
  const adapter = new DexieAdapter(`contract-${globalThis.crypto.randomUUID()}`)
  return {
    adapter,
    dispose: () => {
      adapter.close()
    },
  }
})

describe('DexieAdapter without IndexedDB', () => {
  it('throws a clear error when IndexedDB is unavailable', async () => {
    const original = globalThis.indexedDB
    Reflect.deleteProperty(globalThis, 'indexedDB')
    try {
      expect(isIndexedDbAvailable()).toBe(false)
      const adapter = new DexieAdapter('unavailable')
      await expect(adapter.listEntries()).rejects.toBeInstanceOf(
        StorageUnavailableError,
      )
    } finally {
      globalThis.indexedDB = original
    }
  })
})
