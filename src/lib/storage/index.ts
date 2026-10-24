import { DexieAdapter } from './dexie-adapter'
import type { StorageAdapter } from './types'

/**
 * The single storage instance the app uses. To move to a server later, swap the
 * adapter on this one line (for example to an `ApiAdapter`); nothing else in the
 * app imports Dexie or IndexedDB.
 */
export const storage: StorageAdapter = new DexieAdapter()

export { DexieAdapter } from './dexie-adapter'
export { InMemoryAdapter } from './in-memory-adapter'
export { StorageUnavailableError, isIndexedDbAvailable } from './errors'
export { createSyncFields, newId, nowIso } from './records'
export {
  getPersistenceStatus,
  isPersistenceSupported,
  requestPersistence,
} from './persistence'
export type {
  PersistenceManager,
  PersistenceOutcome,
  PersistenceStatus,
} from './persistence'
export type { StorageAdapter } from './types'
