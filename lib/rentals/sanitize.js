/** Strip HTML tags and control chars from user-provided text. */
export function sanitizeText(value, maxLen) {
  let s = String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
  if (maxLen && s.length > maxLen) s = s.slice(0, maxLen)
  return s
}

export function sanitizeEmail(value) {
  const s = sanitizeText(value, 200).toLowerCase()
  if (!s) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return ''
  return s
}

export function sanitizePhone(value) {
  return sanitizeText(value, 40).replace(/[^\d+().\-\s]/g, '').trim()
}
