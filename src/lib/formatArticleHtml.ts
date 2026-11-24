const BLOCK_TAG_START = /^<(h[1-6]|p|div|figure|blockquote|ul|ol|table|section|article|aside|hr)\b/i

/**
 * Normalizes article body content mixing plain-text line breaks and HTML tags
 * into clean HTML paragraphs and block elements so spacing and justification render consistently.
 */
export function formatArticleHtml(raw: string): string {
  if (!raw || !raw.trim()) return ''

  const normalized = raw.replace(/\r\n/g, '\n').trim()
  const blocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  return blocks
    .map((block) => {
      if (BLOCK_TAG_START.test(block)) {
        return block
      }
      return `<p>${block.replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')
}
