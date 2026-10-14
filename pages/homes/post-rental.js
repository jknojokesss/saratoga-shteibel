import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import PageHero from '../../components/PageHero'
import SiteLayout from '../../components/SiteLayout'
import { openMailtoDraft } from '../../lib/rentals/mailtoDraft'
import RentalAddressField from '../../components/RentalAddressField'
import { submissionApprovalDraftFromForm } from '../../lib/rentals/submissionMailto'
import { listingTitleFromFields } from '../../lib/rentals/listingTitle'
import styles from '../../styles/rentalSubmit.module.css'

const EMPTY = {
  address: '',
  monthly_rent: '',
  bedrooms: '',
  bathrooms: '',
  available_date: '',
  description: '',
  distance_to_shul: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
}

export default function PostRentalPage() {
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = { ...form, title: listingTitleFromFields(form) }
    const emailDraft = submissionApprovalDraftFromForm(payload)
    const emailOpened = openMailtoDraft(emailDraft)

    setBusy(true)
    try {
      const r = await fetch('/api/rentals/submit-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Could not submit')
      setDone({
        message: d.message,
        emailOpened,
        emailDraft: d.emailDraft || emailDraft,
      })
      setForm(EMPTY)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  function openEmailAgain() {
    if (done?.emailDraft) openMailtoDraft(done.emailDraft)
  }

  return (
    <>
      <Head>
        <title>List a rental · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Submit a community rental near Saratoga Shteibel for review before it appears on the Homes page."
        />
        <meta name="robots" content="noindex" />
      </Head>
      <SiteLayout current="homes">
        <div className={styles.page}>
          <PageHero
            kicker="Homes"
            title="List a rental"
            subtitle="Fill out the form — your email app opens with everything filled in. Tap Send to finish."
          />
          <div className={styles.wrap}>
            <Link href="/homes" className={styles.backLink}>← Back to Homes</Link>

            {done ? (
              <div className={styles.success} role="status">
                <h2 className={styles.successTitle}>Submitted for review</h2>
                <p className={styles.successBody}>{done.message}</p>
                <p className={styles.successBody}>
                  {done.emailOpened
                    ? 'Your email app should have opened with the full listing. Press Send in that message so we receive it for approval.'
                    : 'If your email app did not open, tap the button below to try again.'}
                </p>
                {done.emailDraft ? (
                  <button type="button" className={styles.emailBtn} onClick={openEmailAgain}>
                    Open email again
                  </button>
                ) : null}
                <p className={styles.clipHint} style={{ marginTop: '1.25rem' }}>
                  You can also check back on{' '}
                  <Link href="/homes">Homes</Link> once it is approved.
                </p>
              </div>
            ) : (
              <>
                <p className={styles.intro}>
                  Fill in the details below. Your listing is saved privately first; after approval it appears under
                  Rentals on the Homes page. Fair-housing rules apply — describe the property only, not who may rent it.
                </p>
                <form className={styles.form} onSubmit={onSubmit}>
                  <div className={styles.honeypot} aria-hidden="true">
                    <label>
                      Leave blank
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website || ''}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                      />
                    </label>
                  </div>

                  <p className={styles.sectionTitle}>Property</p>
                  <RentalAddressField
                    value={form.address}
                    onChange={(address) => setForm({ ...form, address })}
                  />
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="monthly_rent">Monthly rent (USD) *</label>
                    <input
                      id="monthly_rent"
                      required
                      type="number"
                      min="1"
                      className={styles.input}
                      value={form.monthly_rent}
                      onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })}
                    />
                  </div>
                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="bedrooms">Bedrooms</label>
                      <input
                        id="bedrooms"
                        type="number"
                        min="0"
                        step="0.5"
                        className={styles.input}
                        value={form.bedrooms}
                        onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="bathrooms">Bathrooms</label>
                      <input
                        id="bathrooms"
                        type="number"
                        min="0"
                        step="0.5"
                        className={styles.input}
                        value={form.bathrooms}
                        onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="available_date">Available from</label>
                    <input
                      id="available_date"
                      type="date"
                      className={styles.input}
                      value={form.available_date}
                      onChange={(e) => setForm({ ...form, available_date: e.target.value })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="distance_to_shul">Walk to shul</label>
                    <input
                      id="distance_to_shul"
                      className={styles.input}
                      value={form.distance_to_shul}
                      onChange={(e) => setForm({ ...form, distance_to_shul: e.target.value })}
                      placeholder="e.g. 8 min walk"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      maxLength={500}
                      className={styles.textarea}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <p className={styles.hint}>Max 500 characters. No preferences about who may rent.</p>
                  </div>

                  <p className={styles.sectionTitle}>Your contact</p>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact_name">Your name *</label>
                    <input
                      id="contact_name"
                      required
                      className={styles.input}
                      value={form.contact_name}
                      onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    />
                  </div>
                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="contact_phone">Phone</label>
                      <input
                        id="contact_phone"
                        type="tel"
                        className={styles.input}
                        value={form.contact_phone}
                        onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="contact_email">Email</label>
                      <input
                        id="contact_email"
                        type="email"
                        className={styles.input}
                        value={form.contact_email}
                        onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className={styles.hint}>Phone or email required so we can approve or ask questions.</p>

                  {error ? <p className={styles.error} role="alert">{error}</p> : null}
                  <button type="submit" className={styles.submit} disabled={busy}>
                    {busy ? 'Saving…' : 'Submit & open email'}
                  </button>
                  <p className={styles.hint} style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                    Opens your mail app to saratogashteibel@gmail.com with the details pre-filled — press Send to
                    complete.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
