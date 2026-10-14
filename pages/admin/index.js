import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { clearPasscode, getStoredPasscode, storePasscode } from '../../lib/adminPasscode'
import { adminFontsLink, BORDER, CREAM, GOLD, INK, MUTED, NAVY, SANS, SERIF } from '../../lib/adminTheme'

const SECTIONS = [
  {
    title: 'Site',
    items: [
      { href: '/admin/zmanim', label: 'Zmanim flyer', desc: 'Upload this week’s schedule PDF and preview image' },
      { href: '/admin/announcements', label: 'Bulletin board', desc: 'Post announcements (if enabled)' },
      { href: '/admin/rentals', label: 'Rentals', desc: 'Homes and apartments near the shul' },
    ],
  },
  {
    title: 'Voting & events',
    items: [
      { href: '/admin/shul-vote', label: 'Gabbai sheini vote', desc: 'Open/close vote and see turnout' },
      { href: '/admin/board-vote', label: 'Board election', desc: 'Ballots, reset, settings' },
      { href: '/admin/board-vote-send', label: 'Send board codes', desc: 'WhatsApp links for voter codes' },
      { href: '/admin/auction', label: 'Auction', desc: 'Open/close and view bids' },
    ],
  },
  {
    title: 'Books & membership',
    items: [
      { href: '/admin/books-upload', label: 'Import bank CSVs', desc: 'Chase, Sola, Donors Fund' },
      { href: '/admin/books-review', label: 'Ledger review', desc: 'Categorize uncategorized rows' },
      { href: '/admin/books', label: 'Financial reports', desc: 'P&L by month, PDF export' },
      { href: '/admin/membership', label: 'Membership grid', desc: 'Who paid, autofill from imports' },
      { href: '/admin/yk-invoices', label: 'YK sales invoices', desc: 'Send buyer invoices' },
    ],
  },
]

export default function AdminHub() {
  const [passcode, setPasscode] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const stored = getStoredPasscode()
    if (stored) {
      setPasscode(stored)
      setAuthed(true)
    }
  }, [])

  async function signIn() {
    setError('')
    setBusy(true)
    try {
      const r = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })
      const d = await r.json()
      if (!r.ok) {
        setError(d.error || 'Sign-in failed.')
        setAuthed(false)
        return
      }
      storePasscode(passcode)
      setAuthed(true)
    } catch {
      setError('Network error.')
    } finally {
      setBusy(false)
    }
  }

  function signOut() {
    clearPasscode()
    setAuthed(false)
    setPasscode('')
  }

  const card = {
    background: '#fff',
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    padding: '20px 22px',
    marginBottom: 20,
  }

  return (
    <>
      <Head>
        <title>Admin · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link href={adminFontsLink} rel="stylesheet" />
      </Head>
      <div style={{ minHeight: '100vh', background: CREAM, padding: '32px 16px 48px', fontFamily: SANS, color: '#2a2a2a' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: NAVY }}>Shul admin</div>
          <div style={{ width: 48, height: 2, background: GOLD, margin: '10px 0 8px' }} />
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55, marginBottom: 24 }}>
            One passcode for everything below. Sign in once per browser session.
          </p>

          {!authed ? (
            <div style={{ ...card, borderTop: `3px solid ${GOLD}`, maxWidth: 400 }}>
              <label style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 6 }}>
                Admin passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') signIn() }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 13px',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 3,
                  fontSize: 15,
                  background: CREAM,
                  marginBottom: 12,
                }}
                autoComplete="current-password"
              />
              {error && <div style={{ fontSize: 13, color: '#B23A2E', marginBottom: 10 }}>{error}</div>}
              <button
                type="button"
                onClick={signIn}
                disabled={busy}
                style={{
                  width: '100%',
                  padding: 12,
                  border: 'none',
                  borderRadius: 3,
                  background: NAVY,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: busy ? 'wait' : 'pointer',
                }}
              >
                {busy ? 'Checking…' : 'Sign in'}
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={signOut}
                  style={{
                    padding: '8px 14px',
                    border: `1px solid ${BORDER}`,
                    borderRadius: 3,
                    background: '#fff',
                    fontSize: 13,
                    color: MUTED,
                    cursor: 'pointer',
                  }}
                >
                  Sign out
                </button>
              </div>

              {SECTIONS.map((section) => (
                <div key={section.title} style={{ marginBottom: 28 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: NAVY, marginBottom: 10 }}>{section.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: 'block',
                          textDecoration: 'none',
                          color: INK,
                          background: '#fff',
                          border: `1px solid ${BORDER}`,
                          borderRadius: 4,
                          padding: '14px 16px',
                          transition: 'border-color 0.15s',
                        }}
                      >
                        <div style={{ fontSize: 15, fontWeight: 600, color: NAVY, marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.45 }}>{item.desc}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}
