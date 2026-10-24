// Loads every record once at startup and keeps it in React state, derives
// progress from the raw records, and exposes the write actions the screens use.
// Screens never touch the storage adapter directly: they call `useAppData()`.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { APP_STATE_COPY, DEFAULT_CHARACTER_NAME } from '@/lib/copy'
import { computeProgress } from '@/lib/progress'
import { createDefaultSettings } from '@/lib/schema'
import { StorageUnavailableError, storage } from '@/lib/storage'
import { shouldShowWelcome } from '@/lib/welcome'
import type { CaptureType, Settings } from '@/lib/types'
import {
  AppDataContext,
  type AppDataContextValue,
  type AppStatus,
  type LoadedData,
} from './app-data-context'
import { useEntryActions } from './use-entry-actions'
import { useDataActions } from './use-data-actions'
import { useGoalActions } from './use-goal-actions'
import { useQuestActions } from './use-quest-actions'
import { useTagActions } from './use-tag-actions'
import { useToday } from './use-today'

function emptyData(settings: Settings): LoadedData {
  return {
    entries: [],
    quests: [],
    tags: [],
    goals: [],
    allGoals: [],
    templates: [],
    settings,
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { now, todayKey, timeZone, hour } = useToday()
  const [data, setData] = useState<LoadedData>(() =>
    emptyData(createDefaultSettings()),
  )
  const [status, setStatus] = useState<AppStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastCaptureType, setLastCaptureType] = useState<CaptureType>('learned')

  const loadData = useCallback(async (): Promise<LoadedData> => {
    const [entries, quests, tags, templates, goals, allGoals, settings] =
      await Promise.all([
        storage.listEntries(),
        storage.listQuests(),
        storage.listTags(),
        storage.listGoalTemplates(),
        storage.listDailyGoals(),
        storage.listDailyGoalsIncludingDeleted(),
        storage.getSettings(),
      ])
    return { entries, quests, tags, goals, allGoals, templates, settings }
  }, [])

  const applyError = useCallback((error: unknown) => {
    const unavailable = error instanceof StorageUnavailableError
    setStatus(unavailable ? 'unavailable' : 'error')
    setErrorMessage(
      unavailable ? APP_STATE_COPY.errorBody : APP_STATE_COPY.unsupportedBody,
    )
  }, [])

  // Reload after a write without flashing the loading screen.
  const refresh = useCallback(async (): Promise<LoadedData> => {
    const loaded = await loadData()
    setData(loaded)
    setErrorMessage(null)
    setStatus('ready')
    return loaded
  }, [loadData])

  const reload = useCallback(async () => {
    setStatus('loading')
    try {
      await refresh()
    } catch (error) {
      applyError(error)
    }
  }, [applyError, refresh])

  useEffect(() => {
    // Load once on mount. State is set inside the promise callbacks (not the
    // effect body) to avoid cascading renders on first paint.
    let active = true
    loadData()
      .then((loaded) => {
        if (!active) return
        setData(loaded)
        setErrorMessage(null)
        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (active) applyError(error)
      })
    return () => {
      active = false
    }
  }, [applyError, loadData])

  const progress = useMemo(
    () =>
      computeProgress({
        entries: data.entries,
        quests: data.quests,
        goals: data.goals,
        todayKey,
        timeZone,
      }),
    [data, todayKey, timeZone],
  )

  const entryActions = useEntryActions({
    data,
    progress,
    todayKey,
    timeZone,
    refresh,
  })
  const questActions = useQuestActions({
    data,
    progress,
    todayKey,
    timeZone,
    refresh,
  })
  const tagActions = useTagActions({ data, refresh })
  const goalActions = useGoalActions({
    data,
    progress,
    todayKey,
    timeZone,
    refresh,
  })
  const dataActions = useDataActions({
    todayKey,
    timeZone,
    settings: data.settings,
    refresh,
  })

  // A brand-new install (nothing saved) sees the welcome screen once, before the
  // app shell. Anyone with data or a saved name never sees it.
  const showWelcome = useMemo(
    () =>
      shouldShowWelcome(
        data.settings,
        {
          entries: data.entries.length,
          quests: data.quests.length,
          tags: data.tags.length,
          goals: data.goals.length,
          templates: data.templates.length,
        },
        DEFAULT_CHARACTER_NAME,
      ),
    [data],
  )

  // Keep the latest ensure action in a ref so the effects key only on the day
  // and status, not on the identity of the action (which changes with `data`).
  const ensureTodayGoals = useRef(goalActions.ensureTodayGoals)
  useEffect(() => {
    ensureTodayGoals.current = goalActions.ensureTodayGoals
  }, [goalActions.ensureTodayGoals])

  // Materialize today's goals on load and whenever the local day rolls over,
  // so the Home card never shows yesterday's goals. Skipped on the welcome
  // screen, where there are no templates yet.
  useEffect(() => {
    if (status !== 'ready' || showWelcome) return
    void ensureTodayGoals.current()
  }, [status, todayKey, showWelcome])

  // Catch up when the tab is reopened, which may be a new day.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void ensureTodayGoals.current()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])
  const saveSettings = useCallback(
    async (settings: Settings): Promise<void> => {
      await storage.saveSettings(settings)
      await refresh()
    },
    [refresh],
  )

  const value = useMemo<AppDataContextValue>(
    () => ({
      status,
      errorMessage,
      entries: data.entries,
      quests: data.quests,
      tags: data.tags,
      goals: data.goals,
      allGoals: data.allGoals,
      templates: data.templates,
      settings: data.settings,
      progress,
      todayKey,
      timeZone,
      hour,
      now,
      lastCaptureType,
      setLastCaptureType,
      ...entryActions,
      ...questActions,
      ...tagActions,
      ...goalActions,
      ...dataActions,
      showWelcome,
      saveSettings,
      reload,
    }),
    [
      status,
      errorMessage,
      data,
      progress,
      todayKey,
      timeZone,
      hour,
      now,
      lastCaptureType,
      entryActions,
      questActions,
      tagActions,
      goalActions,
      dataActions,
      showWelcome,
      saveSettings,
      reload,
    ],
  )

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  )
}
