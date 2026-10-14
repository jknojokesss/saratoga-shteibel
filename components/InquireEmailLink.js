import { useCallback } from 'react'
import { mailtoWithSubject } from '../lib/rentals/inquiryMailto'
import styles from '../styles/rentals.module.css'

/**
 * Opens mail with subject only; copies full body to clipboard (avoids mailto body= + bugs).
 */
export default function InquireEmailLink({ subject, body, className, children }) {
  const href = mailtoWithSubject(subject)

  const onClick = useCallback(
    async (e) => {
      if (body && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        e.preventDefault()
        try {
          await navigator.clipboard.writeText(body)
        } catch {
          /* fall through to mailto */
        }
        window.location.href = href
        return
      }
      /* noscript / no clipboard: subject-only mailto still works */
    },
    [body, href],
  )

  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      title={body ? 'Opens email and copies your inquiry text to paste into the message' : undefined}
    >
      {children}
    </a>
  )
}

export function InquireEmailHint() {
  return <p className={styles.inquireClipboardHint}>Your inquiry text is copied — paste it into the email body if it is empty.</p>
}
