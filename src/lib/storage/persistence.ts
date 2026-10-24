// Wraps the StorageManager persistence API (never IndexedDB itself), so the app
// can ask the browser to keep its data. Everything degrades gracefully: if the
// API is missing or throws, the app carries on and Settings says "not
// guaranteed, back up regularly" instead of blocking. The manager is injectable
// so the behavior is unit tested without a real browser.

/** The slice of `navigator.storage` this module uses. */
export interface PersistenceManager {
  persisted(): Promise<boolean>
  persist(): Promise<boolean>
}

/** Whether the browser is currently persisting this origin's storage. */
export type PersistenceStatus = 'protected' | 'not-guaranteed' | 'unsupported'

/** The outcome of asking the browser for persistent storage. */
export type PersistenceOutcome =
  'persisted' | 'denied' | 'unsupported' | 'error'

function defaultManager(): PersistenceManager | null {
  if (typeof navigator === 'undefined') return null
  return navigator.storage ?? null
}

/** True when the browser exposes `navigator.storage.persist()`. */
export function isPersistenceSupported(
  manager: PersistenceManager | null = defaultManager(),
): boolean {
  return (
    manager !== null &&
    typeof manager.persisted === 'function' &&
    typeof manager.persist === 'function'
  )
}

/** Reads the current persistence status without prompting the user. */
export async function getPersistenceStatus(
  manager: PersistenceManager | null = defaultManager(),
): Promise<PersistenceStatus> {
  if (!isPersistenceSupported(manager) || manager === null) {
    return 'unsupported'
  }
  try {
    return (await manager.persisted()) ? 'protected' : 'not-guaranteed'
  } catch {
    return 'unsupported'
  }
}

/**
 * Asks the browser to persist storage. Returns which outcome happened so the
 * caller can show it, and never throws.
 */
export async function requestPersistence(
  manager: PersistenceManager | null = defaultManager(),
): Promise<PersistenceOutcome> {
  if (!isPersistenceSupported(manager) || manager === null) {
    return 'unsupported'
  }
  try {
    return (await manager.persist()) ? 'persisted' : 'denied'
  } catch {
    return 'error'
  }
}
