// Small browser helper for saving a text file. Kept out of components so the
// download mechanics (Blob, object URL, and its cleanup) live in one place.

/** Saves `contents` to the user's downloads folder under `fileName`. */
export function downloadTextFile(
  fileName: string,
  contents: string,
  mimeType = 'application/json',
): void {
  const blob = new Blob([contents], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
