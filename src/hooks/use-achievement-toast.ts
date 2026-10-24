// Shows the single merged achievement toast for one action (completion,
// milestone, headline, level-ups). A separate hook so screens stay free of the
// toast side effect and the sonner import.

import { useCallback } from 'react'
import { toast } from 'sonner'
import {
  achievementMessage,
  TOAST_DURATION,
  TOAST_ID,
  type AchievementMessageInput,
} from '@/lib/toast'

/** Returns a function that shows one merged achievement toast, or nothing. */
export function useAchievementToast(): (
  input: AchievementMessageInput,
) => void {
  return useCallback((input: AchievementMessageInput) => {
    const message = achievementMessage(input)
    if (message === null) return
    toast(message, {
      id: TOAST_ID.achievement,
      duration: TOAST_DURATION.achievement,
      closeButton: true,
      style: { borderColor: 'var(--primary)' },
    })
  }, [])
}
