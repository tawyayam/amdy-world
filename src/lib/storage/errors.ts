import { STORAGE_COPY } from '@/lib/copy'

/**
 * Thrown when the browser cannot use IndexedDB (for example in private mode or
 * an old browser). The UI catches it to show the storage message instead of
 * failing silently and losing a typed entry.
 */
export class StorageUnavailableError extends Error {
  constructor(message = STORAGE_COPY.unavailable) {
    super(message)
    this.name = 'StorageUnavailableError'
  }
}

/** True when IndexedDB exists in this environment. */
export function isIndexedDbAvailable(): boolean {
  return typeof globalThis.indexedDB !== 'undefined'
}
