import { useState, useEffect } from 'react'
import Head from 'next/head'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', CREAM = '#faf7f2', MUTED = '#7a7068', BORDER = '#ddd5c4', GREEN = '#2e7d32'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"
const VOTE_URL = 'https://www.saratogashteibel.org/board-vote'
const LS_KEY = 'boardVoteSent'

const message = (code) => `Saratoga Shteibel — Board Election\n\nPlease use this voting code to access your ballot: ${code}\n\nVote here: ${VOTE_URL}`
const waLink = (phone, code) => `https://wa.me/${(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message(code))}`

export default function BoardVoteSend() {
  const [passcode, setPasscode] = useState('')
  const [voters, setVoters] = useState(null)
  const [sent, setSent] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try { setSent(JSON.parse(localStorage.getItem(LS_KEY) || '{}')) } catch (e) {}
  }, [])
  function mark(code, on) {
    setSent(prev => { const n = { ...prev, [code]: on }; try { localStorage.setItem(LS_KEY, JSON.stringify(n)) } catch (e) {}; return n })
  }

  async function load() {
    setError(''); setBusy(true)
    try {
      const r = await fetch('/api/board-vote/roster', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode }) })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed')
      setVoters(d.voters)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  if (!voters) return (
    <>
      <Head><title>Send Voting Codes</title></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, display: 'flex', justifyContent: 'center', paddingTop: '14vh' }}>
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 8, padding: '26px 24px', width: 320 }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: NAVY, marginBottom: 16 }}>Send Voting Codes</div>
          <input type="password" value={passcode} placeholder="Admin passcode" onChange={e => setPasscode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') load() }} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 15, background: CREAM, outline: 'none' }} />
          {error && <div style={{ color: '#B23A2E', fontSize: 13, marginTop: 10 }}>{error}</div>}
          <button onClick={load} disabled={busy} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: 6, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>{busy ? 'Loading…' : 'Open'}</button>
        </div>
      </div>
    </>
  )

  const sentCount = voters.filter(v => sent[v.code]).length

  return (
    <>
      <Head><title>Send Voting Codes</title><meta name="viewport" content="width=device-width, initial-scale=1" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@0,500;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a', padding: '26px 16px 60px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: NAVY }}>Send Voting Codes</div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 4, lineHeight: 1.5 }}>Open this on your computer with WhatsApp Web signed in. Tap a name’s <b>WhatsApp</b> button — the message opens pre-filled, just hit send.</div>
          <div style={{ fontSize: 14, color: NAVY, marginBottom: 16 }}>Sent: <b>{sentCount}</b> / {voters.length}</div>

          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
            {voters.map((v, i) => {
              const done = !!sent[v.code]
              return (
                <div key={v.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderTop: i ? `1px solid #f0ebe0` : 'none', background: done ? '#f2f7ef' : '#fff' }}>
                  <div onClick={() => mark(v.code, !done)} title="Mark sent" style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${done ? GREEN : '#cfc7b5'}`, background: done ? GREEN : '#fff', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>{done ? '✓' : ''}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, color: NAVY, fontWeight: done ? 400 : 500 }}>{v.name}</div>
                    <div style={{ fontSize: 13, color: MUTED, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: 1 }}>{v.code}</div>
                  </div>
                  <a href={waLink(v.phone, v.code)} target="_blank" rel="noopener noreferrer" onClick={() => mark(v.code, true)} style={{ textDecoration: 'none', background: '#25D366', color: '#0b3d1e', fontWeight: 600, fontSize: 13, padding: '9px 15px', borderRadius: 7, whiteSpace: 'nowrap', fontFamily: SANS }}>WhatsApp</a>
                </div>
              )
            })}
          </div>

          <div style={{ fontSize: 12, color: MUTED, marginTop: 14, lineHeight: 1.55 }}>Anyone not on WhatsApp will show “not on WhatsApp” — just copy their code above and text it the normal way. Your sent checkmarks are saved on this device.</div>
        </div>
      </div>
    </>
  )
}
