// Bridges the string fields of the capture and edit forms with the typed meta
// stored on an entry. Pure, so both forms build meta the same way.

import type { Entry, EntryMeta, EntryType } from '@/lib/types'

/** The text-field values of the reading/session extra fields. */
export interface EntryMetaForm {
  pages: string
  bookTitle: string
  minutes: string
  /** The quest this entry is logged against; the empty string means none. */
  questId: string
}

function parsePositiveInt(value: string): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined
}

/** A blank form for a fresh capture. */
export function emptyMetaForm(): EntryMetaForm {
  return { pages: '', bookTitle: '', minutes: '', questId: '' }
}

/** Seeds the form fields from a saved entry, for editing. */
export function metaFormFromEntry(entry: Entry): EntryMetaForm {
  return {
    pages: entry.meta?.pages !== undefined ? String(entry.meta.pages) : '',
    bookTitle: entry.meta?.bookTitle ?? '',
    minutes:
      entry.meta?.minutes !== undefined ? String(entry.meta.minutes) : '',
    questId: entry.meta?.questId ?? '',
  }
}

/** Builds a validated meta for the entry type, or `undefined` if it is empty. */
export function buildEntryMeta(
  type: EntryType,
  form: EntryMetaForm,
): EntryMeta | undefined {
  const meta: EntryMeta = {}
  if (type === 'reading') {
    const pages = parsePositiveInt(form.pages)
    if (pages !== undefined) meta.pages = pages
    const bookTitle = form.bookTitle.trim()
    if (bookTitle) meta.bookTitle = bookTitle
  }
  if (type === 'session') {
    const minutes = parsePositiveInt(form.minutes)
    if (minutes !== undefined) meta.minutes = minutes
  }
  const questId = form.questId.trim()
  if (questId) meta.questId = questId
  return Object.keys(meta).length > 0 ? meta : undefined
}

/**
 * Builds the meta for saving an edit. Same as `buildEntryMeta`, but keeps the
 * promotion link: an entry stays "promoted to this quest" for history even when
 * its other fields change.
 */
export function entryMetaForEdit(
  entry: Entry,
  form: EntryMetaForm,
): EntryMeta | undefined {
  const meta = buildEntryMeta(entry.type, form)
  const promotedToQuestId = entry.meta?.promotedToQuestId
  if (promotedToQuestId === undefined) return meta
  return { ...meta, promotedToQuestId }
}
