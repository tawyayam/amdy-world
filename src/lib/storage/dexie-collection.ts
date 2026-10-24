import { isAlive, nowIso, sortByCreatedAt } from './records'
import type { SyncFields } from '@/lib/types'

/** Any record that can be flagged as demo data. */
type SampleRecord = SyncFields & { isSample?: boolean }

/**
 * The small slice of a Dexie table this wrapper needs, keyed by string ids.
 * Typing it here keeps the wrapper free of Dexie's invariant generic table type.
 */
interface SyncTable<T extends SyncFields> {
  toArray(): Promise<T[]>
  get(id: string): Promise<T | undefined>
  put(record: T): Promise<unknown>
  clear(): Promise<void>
  filter(predicate: (record: T) => boolean): { delete(): Promise<number> }
}

/**
 * Wraps a Dexie table of sync-ready records with the list/save/soft-delete
 * behaviour shared by every collection, keeping the adapter declarative.
 */
export class SoftDeleteCollection<T extends SampleRecord> {
  private readonly table: SyncTable<T>

  constructor(table: SyncTable<T>) {
    this.table = table
  }

  async list(): Promise<T[]> {
    const records = await this.table.toArray()
    return sortByCreatedAt(records.filter(isAlive))
  }

  /** Every record, soft-deleted ones included, oldest first. */
  async listAll(): Promise<T[]> {
    return sortByCreatedAt(await this.table.toArray())
  }

  async save(record: T): Promise<T> {
    await this.table.put(record)
    return record
  }

  async remove(id: string): Promise<void> {
    const record = await this.table.get(id)
    if (!record) {
      return
    }
    const timestamp = nowIso()
    await this.table.put({
      ...record,
      deletedAt: timestamp,
      updatedAt: timestamp,
    })
  }

  clear(): Promise<void> {
    return this.table.clear()
  }

  removeSamples(): Promise<number> {
    return this.table.filter((record) => record.isSample === true).delete()
  }
}
