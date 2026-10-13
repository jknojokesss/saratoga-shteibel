const KEY = 'saratoga_shul_admin_passcode_v1'

export function getStoredPasscode() {
  if (typeof window === 'undefined') return ''
  try {
    return sessionStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}

export function storePasscode(passcode) {
  if (!passcode) return
  try {
    sessionStorage.setItem(KEY, passcode)
  } catch {
    /* ignore */
  }
}

export function clearPasscode() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
