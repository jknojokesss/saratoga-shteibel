import { useState } from 'react'
import Head from 'next/head'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', CREAM = '#faf7f2', MUTED = '#7a7068', BORDER = '#ddd5c4', GREEN = '#2e7d32', RUST = '#b2543a'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"

const SOURCES = [
  { key: 'chase', label: 'Chase', hint: 'Account Activity CSV (checking 782)' },
  { key: 'sola', label: 'Sola / Cardknox', hint: 'Transactions export CSV' },
  { key: 'donorsfund', label: 'Donors Fund', hint: 'Results CSV from the portal' },
]

export default function BooksUpload() {
  const [passcode, setPasscode] = useState('')
  const [authed, setAuthed] = useState(false)
  const [files, setFiles] = useState({})
  const [result, setResult] = useState({})
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function importOne(key) {
    const file = files[key]; if (!file) return
    setBusy(key); setError('')
    try {
      const csv = await file.text()
      const r = await fetch('/api/books-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode, source: key, csv }) })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Import failed')
      if (!authed) setAuthed(true)
      setResult(x => ({ ...x, [key]: d }))
    } catch (e) { setError(e.message) } finally { setBusy('') }
  }

  return (
    <>
      <Head><title>Books · Upload</title><meta name="viewport" content="width=device-width, initial-scale=1" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@0,500;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a', padding: '32px 18px 70px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: NAVY }}>Update the books</div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>Drop in a fresh export from each source. It adds only new transactions, auto-categorizes them, and sends anything unclear to the review queue — your existing work is never touched.</div>

          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: MUTED }}>Admin passcode</label>
            <input type="password" name="password" autoComplete="current-password" value={passcode} onChange={e => setPasscode(e.target.value)} placeholder="Required for each import" style={{ width: '100%', boxSizing: 'border-box', marginTop: 5, padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 15, background: CREAM, outline: 'none' }} />
          </div>

          {error && <div style={{ color: RUST, fontSize: 13, marginBottom: 12 }}>{error}</div>}

          {SOURCES.map(src => {
            const r = result[src.key]
            return (
              <div key={src.key} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 10, padding: '16px 18px', marginBottom: 14 }}>
                <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: NAVY }}>{src.label}</div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>{src.hint}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="file" accept=".csv,text/csv" onChange={e => setFiles(f => ({ ...f, [src.key]: e.target.files[0] }))} style={{ fontSize: 13, flex: 1, minWidth: 180 }} />
                  <button onClick={() => importOne(src.key)} disabled={!files[src.key] || !passcode || busy === src.key} style={{ padding: '9px 18px', border: 'none', borderRadius: 6, background: (!files[src.key] || !passcode) ? '#c3bcac' : NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, fontSize: 13, cursor: (!files[src.key] || !passcode) ? 'default' : 'pointer' }}>{busy === src.key ? 'Importing…' : 'Import'}</button>
                </div>
                {r && (
                  <div style={{ marginTop: 12, background: '#f0f6ec', border: `1px solid #cfe4c6`, borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#2a4a25' }}>
                    <span style={{ color: GREEN, fontWeight: 600 }}>✓ Imported.</span> Read {r.parsed} rows · <b>{r.addedSource} new</b> transaction{r.addedSource === 1 ? '' : 's'} added ({r.addedLedger} to the ledger). {r.addedSource === 0 ? 'Nothing new — all already on file.' : ''}
                  </div>
                )}
              </div>
            )
          })}

          {authed && (
            <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>
              <a href="/books-review" style={{ color: NAVY, fontWeight: 500, marginRight: 20 }}>Go to review queue →</a>
              <a href="/books" style={{ color: NAVY, fontWeight: 500 }}>View financials →</a>
            </div>
          )}

          <div style={{ marginTop: 24, fontSize: 12, color: MUTED, lineHeight: 1.6, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
            <b>Tip:</b> re-importing the same file is safe — it just says "nothing new." Zelle memos aren’t in these CSVs; drop a Zelle activity PDF only when you want to add descriptions (occasional).
          </div>
        </div>
      </div>
    </>
  )
}
