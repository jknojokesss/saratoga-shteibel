import { useCallback, useState } from 'react'
import { mailtoWithSubject } from '../lib/rentals/inquiryMailto'
import styles from '../styles/rentals.module.css'

/**
 * Shows the email draft so people can edit it, then opens mail (subject) + copies body.
 */
export default function RentalEmailInquire({
  subject,
  body: initialBody,
  className,
  buttonLabel = 'Email the shul',
  draftId = 'general',
}) {
  const [body, setBody] = useState(initialBody || '')
  const href = mailtoWithSubject(subject)

  const onClick = useCallback(
    async (e) => {
      e.preventDefault()
      const text = body.trim() || initialBody || ''
      if (text && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          /* mailto still opens */
        }
      }
      window.location.href = href
    },
    [body, initialBody, href],
  )

  return (
    <div className={styles.inquireBlock}>
      <label className={styles.inquireDraftLabel} htmlFor={`inquire-draft-${draftId}`}>
        Email draft — edit, then send
      </label>
      <textarea
        id={`inquire-draft-${draftId}`}
        className={styles.inquireDraft}
        rows={10}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <p className={styles.inquireDraftHelp}>
        Tap the button to open your email app. If the message body is blank, paste (the text above is copied for you).
      </p>
      <button type="button" className={className || styles.inquireBox} onClick={onClick}>
        {buttonLabel}
      </button>
    </div>
  )
}
