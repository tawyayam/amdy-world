import { useContext } from 'react'
import { AppDataContext, type AppDataContextValue } from './app-data-context'

/** Reads the app data and write actions. Must be used inside `AppDataProvider`. */
export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext)
  if (value === null) {
    throw new Error('useAppData must be used within an AppDataProvider')
  }
  return value
}
