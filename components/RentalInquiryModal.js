import { useEffect, useRef, useState } from 'react'
import styles from '../styles/rentals.module.css'

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  moveInDate: '',
  message: '',
  company: '',
}

export default function RentalInquiryModal({ listing, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const dialogRef = useRef(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      const r = await fetch('/api/rentals/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          name: form.name,
          phone: form.phone,
          email: form.email,
          moveInDate: form.moveInDate || undefined,
          message: form.message,
          company: form.company,
        }),
      })
      const d = await r.json()
      if (!r.ok) {
        setError(d.error || 'Could not send your request.')
        return
      }
      setSuccess(d.message || 'Thank you.')
      setForm(EMPTY)
    } catch {
      setError('Could not send your request. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="inquiry-title" className={styles.modalTitle}>Request details</h2>
        <p className={styles.modalSub}>{listing.title}</p>

        {success ? (
          <p className={styles.successMsg} role="status">{success}</p>
        ) : (
          <form onSubmit={submit}>
            <label className={styles.fieldLabel}>
              Name *
              <input
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={styles.fieldInput}
              />
            </label>
            <label className={styles.fieldLabel}>
              Phone
              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={styles.fieldInput}
              />
            </label>
            <label className={styles.fieldLabel}>
              Email
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={styles.fieldInput}
              />
            </label>
            <p className={styles.fieldHint}>Phone or email is required.</p>
            <label className={styles.fieldLabel}>
              Desired move-in date
              <input
                type="date"
                value={form.moveInDate}
                onChange={(e) => setForm({ ...form, moveInDate: e.target.value })}
                className={styles.fieldInput}
              />
            </label>
            <label className={styles.fieldLabel}>
              Message (optional)
              <textarea
                maxLength={500}
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={styles.fieldTextarea}
              />
            </label>
            <div className={styles.honeypot} aria-hidden="true">
              <label>
                Company
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </label>
            </div>
            <p className={styles.privacyNote}>
              Your details will be shared only with the owner or agent of this listing.
            </p>
            {error ? <p className={styles.errorMsg} role="alert">{error}</p> : null}
            <button type="submit" disabled={busy} className={styles.submitBtn}>
              {busy ? 'Sending…' : 'Send request'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
