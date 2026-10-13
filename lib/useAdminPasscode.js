import { useEffect, useState } from 'react'
import { getStoredPasscode, storePasscode } from './adminPasscode'

/** Prefill passcode from hub sign-in; optionally persist when user types on a tool page. */
export function useAdminPasscode() {
  const [passcode, setPasscodeState] = useState('')

  useEffect(() => {
    const stored = getStoredPasscode()
    if (stored) setPasscodeState(stored)
  }, [])

  function setPasscode(value) {
    setPasscodeState(value)
    if (value) storePasscode(value)
  }

  return [passcode, setPasscode]
}
