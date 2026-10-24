// Write actions for tags: create, update (name + color), soft delete, and
// restore. Uniqueness is enforced here (case-insensitively) so the storage
// adapter stays a dumb store; the manage-tags dialog also pre-checks to show an
// inline message.

import { useCallback } from 'react'
import { isTagNameTaken } from '@/lib/tags'
import { createSyncFields, nowIso, storage } from '@/lib/storage'
import type { Tag } from '@/lib/types'
import type { LoadedData, TagInput } from './app-data-context'

interface UseTagActionsOptions {
  data: LoadedData
  refresh: () => Promise<LoadedData>
}

export interface TagActions {
  createTag: (input: TagInput) => Promise<Tag>
  updateTag: (tagId: string, input: TagInput) => Promise<void>
  deleteTag: (tagId: string) => Promise<void>
  restoreTag: (tag: Tag) => Promise<void>
}

export function useTagActions({
  data,
  refresh,
}: UseTagActionsOptions): TagActions {
  const createTag = useCallback(
    async (input: TagInput): Promise<Tag> => {
      const name = input.name.trim()
      if (isTagNameTaken(data.tags, name)) {
        throw new Error('A tag with this name already exists.')
      }
      const tag: Tag = {
        ...createSyncFields(),
        name,
        ...(input.colorToken ? { colorToken: input.colorToken } : {}),
      }
      await storage.saveTag(tag)
      await refresh()
      return tag
    },
    [data.tags, refresh],
  )

  const updateTag = useCallback(
    async (tagId: string, input: TagInput): Promise<void> => {
      const tag = data.tags.find((candidate) => candidate.id === tagId)
      if (!tag) return
      const trimmed = input.name.trim()
      if (isTagNameTaken(data.tags, trimmed, tagId)) {
        throw new Error('A tag with this name already exists.')
      }
      await storage.saveTag({
        ...tag,
        name: trimmed,
        ...(input.colorToken ? { colorToken: input.colorToken } : {}),
        updatedAt: nowIso(),
      })
      await refresh()
    },
    [data.tags, refresh],
  )

  const deleteTag = useCallback(
    async (tagId: string): Promise<void> => {
      await storage.deleteTag(tagId)
      await refresh()
    },
    [refresh],
  )

  const restoreTag = useCallback(
    async (tag: Tag): Promise<void> => {
      await storage.saveTag({ ...tag, deletedAt: null, updatedAt: nowIso() })
      await refresh()
    },
    [refresh],
  )

  return { createTag, updateTag, deleteTag, restoreTag }
}
