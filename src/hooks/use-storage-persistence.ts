// Reads and requests persistent storage from Settings. On first run it asks
// once in the background, because a browser only grants persistence after some
// engagement; the "Protect my data" button lets the person ask again later.

import { useCallback, useEffect, useState } from 'react'
import {
  getPersistenceStatus,
  requestPersistence,
  type PersistenceOutcome,
  type PersistenceStatus,
} from '@/lib/storage'

/** `checking` until the first read resolves, then the real status. */
export type PersistenceState = PersistenceStatus | 'checking'

export interface StoragePersistence {
  state: PersistenceState
  /** Asks the browser again; resolves with which outcome happened. */
  protect: () => Promise<PersistenceOutcome>
}

export function useStoragePersistence(): StoragePersistence {
  const [state, setState] = useState<PersistenceState>('checking')

  useEffect(() => {
    let active = true
    void (async () => {
      const current = await getPersistenceStatus()
      if (!active) return
      setState(current)
      if (current !== 'not-guaranteed') return
      // Ask once on first run; nothing blocks if the browser says no.
      const outcome = await requestPersistence()
      if (!active) return
      setState(outcome === 'persisted' ? 'protected' : current)
    })()
    return () => {
      active = false
    }
  }, [])

  const protect = useCallback(async (): Promise<PersistenceOutcome> => {
    const outcome = await requestPersistence()
    if (outcome === 'unsupported') {
      setState('unsupported')
      return outcome
    }
    setState(outcome === 'persisted' ? 'protected' : 'not-guaranteed')
    return outcome
  }, [])

  return { state, protect }
}
