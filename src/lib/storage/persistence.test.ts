import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getPersistenceStatus,
  isPersistenceSupported,
  requestPersistence,
  type PersistenceManager,
} from './persistence'

function manager(overrides: Partial<PersistenceManager>): PersistenceManager {
  return {
    persisted: () => Promise.resolve(false),
    persist: () => Promise.resolve(false),
    ...overrides,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('isPersistenceSupported', () => {
  it('is true when the manager exposes both methods', () => {
    expect(isPersistenceSupported(manager({}))).toBe(true)
  })

  it('is false when there is no manager', () => {
    expect(isPersistenceSupported(null)).toBe(false)
  })

  it('is false when the manager is missing the methods', () => {
    expect(isPersistenceSupported({} as PersistenceManager)).toBe(false)
  })

  it('is false when the browser has no storage manager', () => {
    vi.stubGlobal('navigator', {})
    expect(isPersistenceSupported()).toBe(false)
  })
})

describe('getPersistenceStatus', () => {
  it('reports protected when the browser already persists storage', async () => {
    expect(
      await getPersistenceStatus(
        manager({ persisted: () => Promise.resolve(true) }),
      ),
    ).toBe('protected')
  })

  it('reports not-guaranteed when storage is not persisted', async () => {
    expect(await getPersistenceStatus(manager({}))).toBe('not-guaranteed')
  })

  it('reports unsupported when there is no storage manager', async () => {
    expect(await getPersistenceStatus(null)).toBe('unsupported')
    vi.stubGlobal('navigator', {})
    expect(await getPersistenceStatus()).toBe('unsupported')
  })

  it('reports unsupported when persisted() throws', async () => {
    const throwing = manager({
      persisted: () => Promise.reject(new Error('nope')),
    })
    expect(await getPersistenceStatus(throwing)).toBe('unsupported')
  })
})

describe('requestPersistence', () => {
  it('reports persisted when the browser grants the request', async () => {
    const granted = manager({ persist: () => Promise.resolve(true) })
    expect(await requestPersistence(granted)).toBe('persisted')
  })

  it('reports denied when the browser refuses', async () => {
    const refused = manager({ persist: () => Promise.resolve(false) })
    expect(await requestPersistence(refused)).toBe('denied')
  })

  it('reports unsupported when there is no storage manager', async () => {
    expect(await requestPersistence(null)).toBe('unsupported')
    vi.stubGlobal('navigator', {})
    expect(await requestPersistence()).toBe('unsupported')
  })

  it('reports error and never throws when persist() rejects', async () => {
    const broken = manager({
      persist: () => Promise.reject(new Error('boom')),
    })
    await expect(requestPersistence(broken)).resolves.toBe('error')
  })

  it('never throws to the caller when persist() throws synchronously', async () => {
    const broken = manager({
      persist: () => {
        throw new Error('sync boom')
      },
    })
    await expect(requestPersistence(broken)).resolves.toBe('error')
  })
})
