/**
 * mailto with subject + body. Uses encodeURIComponent (not URLSearchParams) so spaces
 * are %20, not +, which breaks some mail clients.
 */

export function buildMailtoHref({ to, subject, body }) {
  const parts = [`subject=${encodeURIComponent(subject)}`]
  if (body) parts.push(`body=${encodeURIComponent(body)}`)
  return `mailto:${to}?${parts.join('&')}`
}

export function openMailtoDraft(draft) {
  if (typeof window === 'undefined' || !draft?.to) return false
  try {
    window.location.href = buildMailtoHref(draft)
    return true
  } catch {
    return false
  }
}
