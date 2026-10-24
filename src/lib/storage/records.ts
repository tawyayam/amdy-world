import type { SyncFields } from '@/lib/types'

/** UUID v4 for a new record id. */
export function newId(): string {
  return globalThis.crypto.randomUUID()
}

/** Current time as an ISO 8601 UTC string. */
export function nowIso(): string {
  return new Date().toISOString()
}

/** Fresh id and timestamps for a record about to be created for the first time. */
export function createSyncFields(): SyncFields {
  const timestamp = nowIso()
  return {
    id: newId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  }
}

/** A record counts as live until soft-deleted. */
export function isAlive(record: { deletedAt: string | null }): boolean {
  return record.deletedAt === null
}

/** Oldest first, with `id` as a stable tie-breaker for equal timestamps. */
export function sortByCreatedAt<T extends { createdAt: string; id: string }>(
  records: readonly T[],
): T[] {
  return [...records].sort((first, second) => {
    if (first.createdAt === second.createdAt) {
      return first.id.localeCompare(second.id)
    }
    return first.createdAt.localeCompare(second.createdAt)
  })
}
