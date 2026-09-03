import { useState, useEffect } from 'react'
import Head from 'next/head'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', CREAM = '#faf7f2', MUTED = '#7a7068', BORDER = '#ddd5c4'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"
const numWord = (n) => ({ 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven' }[n] || String(n))
const TINTS = [
  { bg: '#eef2f8', fg: '#5a6b8a' }, { bg: '#f3efe1', fg: '#9a8a52' }, { bg: '#edf3ea', fg: '#5f8a55' },
  { bg: '#f7ede9', fg: '#a5745a' }, { bg: '#f0eef6', fg: '#7a6a9a' }, { bg: '#e9f2f2', fg: '#4f8a86' },
]
const Silhouette = ({ color, size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8.5" r="4.2" fill={color} />
    <path d="M3.5 21c0-4.4 3.8-6.6 8.5-6.6s8.5 2.2 8.5 6.6z" fill={color} />
  </svg>
)

export default function BoardVote() {
  const [step, setStep] = useState('phone') // phone | code | ballot | done
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [cfg, setCfg] = useState(null)
  const [picks, setPicks] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(false)
  const maxPicks = (cfg && cfg.picks) || 3

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('preview')) { setPreview(true); setStep('ballot') }
    fetch('/api/board-vote/config').then(r => r.json()).then(setCfg).catch(() => setCfg({ open: false, candidates: [] }))
  }, [])

  async function submitCode() {
    setError(''); setBusy(true)
    try {
      const r = await fetch('/api/board-vote/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Could not check the code.')
      setStep('ballot')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  function togglePick(id) {
    setPicks(p => p.includes(id) ? p.filter(x => x !== id) : (p.length < maxPicks ? [...p, id] : p))
  }

  async function submitBallot() {
    if (preview) { setError('Preview only — voting isn’t open yet. This is just to see the ballot.'); return }
    setError(''); setBusy(true)
    try {
      const r = await fetch('/api/board-vote/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, choices: picks }) })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Could not record your vote.')
      setStep('done')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const shell = (children) => (
    <>
      <Head><title>Board Election</title><meta name="viewport" content="width=device-width, initial-scale=1" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@0,500;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8vh 16px 40px' }}>
        <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: NAVY, textAlign: 'center' }}>Saratoga Shteibel</div>
        <div style={{ color: '#a99f8c', fontSize: 12, letterSpacing: 2, marginBottom: 22 }}>BOARD ELECTION</div>
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `4px solid ${GOLD}`, borderRadius: 12, padding: '26px 24px', width: '100%', maxWidth: 380, boxSizing: 'border-box' }}>
          {children}
        </div>
      </div>
    </>
  )

  const label = { display: 'block', fontSize: 12, color: MUTED, marginBottom: 6 }
  const input = { width: '100%', boxSizing: 'border-box', padding: '12px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, fontFamily: SANS, fontSize: 16, background: CREAM, outline: 'none' }
  const primary = { width: '100%', marginTop: 18, padding: 13, border: 'none', borderRadius: 8, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, fontSize: 15, cursor: 'pointer' }
  const err = error && <div style={{ color: '#B23A2E', fontSize: 13, marginTop: 12 }}>{error}</div>

  if (!cfg) return shell(<div style={{ color: MUTED, fontSize: 14 }}>Loading…</div>)
  if (!cfg.open && !preview && step !== 'done') return shell(<div style={{ color: NAVY, fontSize: 15 }}>Voting isn’t open right now. Please check back when the election is live.</div>)

  if (step === 'phone') return shell(<>
    <div style={{ fontSize: 16, fontWeight: 500, color: NAVY, marginBottom: 4 }}>Sign in to vote</div>
    <div style={{ fontSize: 13, color: MUTED, marginBottom: 18, lineHeight: 1.5 }}>Enter your cell number to begin.</div>
    <label style={label}>Phone number</label>
    <input style={input} type="tel" inputMode="tel" value={phone} placeholder="(732) 555-0148" onChange={e => setPhone(e.target.value)} />
    <button style={primary} onClick={() => { setError(''); setStep('code') }}>Continue</button>
  </>)

  if (step === 'code') return shell(<>
    <div style={{ fontSize: 16, fontWeight: 500, color: NAVY, marginBottom: 4 }}>Enter your code</div>
    <div style={{ fontSize: 13, color: MUTED, marginBottom: 18, lineHeight: 1.5 }}>Enter the voting code you were sent.</div>
    <label style={label}>Voting code</label>
    <input style={{ ...input, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 500 }} value={code} placeholder="XXXXXX" onChange={e => setCode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitCode() }} />
    <button style={primary} disabled={busy} onClick={submitCode}>{busy ? 'Checking…' : 'Continue'}</button>
    {err}
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid #ece4d3`, fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
      Didn’t receive a code? If you believe you should have, please reach out to <span style={{ color: NAVY, fontWeight: 500 }}>Chaim Katz</span>.
    </div>
  </>)

  if (step === 'ballot') {
    const exact = cfg.pickExact !== false
    const canSubmit = exact ? picks.length === maxPicks : picks.length >= 1
    const cands = cfg.candidates || []
    const cards = cands.length <= 12
    return shell(<>
      <div style={{ fontSize: 16, fontWeight: 500, color: NAVY, marginBottom: 16, textAlign: 'center' }}>{exact ? `Choose ${maxPicks} candidates` : `Choose up to ${maxPicks} candidates`}</div>
      {cards ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 8px', justifyContent: 'center', margin: '4px 0 6px' }}>
          {cands.map((c, i) => {
            const on = picks.includes(c.id)
            const full = picks.length >= maxPicks && !on
            const t = TINTS[i % TINTS.length]
            return (
              <div key={c.id} onClick={() => !full && togglePick(c.id)} style={{ width: 104, cursor: full ? 'default' : 'pointer', opacity: full ? 0.4 : 1 }}>
                <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto', borderRadius: '50%', background: on ? '#faf1d6' : t.bg, border: `3px solid ${on ? GOLD : '#e8dfcb'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, padding: '8px 7px', boxSizing: 'border-box' }}>
                  <Silhouette color={on ? '#b8912f' : t.fg} size={30} />
                  <div style={{ fontSize: 11, fontWeight: 600, color: NAVY, lineHeight: 1.05, textAlign: 'center' }}>{c.name}</div>
                  {on && <div style={{ position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: GOLD, color: '#3a2e08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, border: '2px solid #fff' }}>✓</div>}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden', maxHeight: 340, overflowY: 'auto' }}>
          {cands.map((c, i) => {
            const on = picks.includes(c.id)
            const full = picks.length >= maxPicks && !on
            return (
              <div key={c.id} onClick={() => !full && togglePick(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderTop: i ? `1px solid #f0ebe0` : 'none', cursor: full ? 'default' : 'pointer', background: on ? '#f6f0df' : '#fff', opacity: full ? 0.45 : 1 }}>
                <span style={{ width: 20, height: 20, borderRadius: 5, border: `1.5px solid ${on ? GOLD : '#cfc7b5'}`, background: on ? GOLD : '#fff', color: NAVY, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{on ? '✓' : ''}</span>
                <span style={{ fontSize: 15, color: NAVY }}>{c.name}</span>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ fontSize: 13, color: canSubmit ? '#2e7d32' : MUTED, marginTop: 14, fontWeight: 500, textAlign: 'center' }}>{picks.length} of {maxPicks} selected</div>
      <button style={{ ...primary, marginTop: 12, background: canSubmit ? NAVY : '#b9b3a4', cursor: canSubmit ? 'pointer' : 'default' }} disabled={busy || !canSubmit} onClick={submitBallot}>{busy ? 'Submitting…' : 'Submit my vote'}</button>
      {err}
    </>)
  }

  return shell(<div style={{ textAlign: 'center', padding: '10px 0' }}>
    <div style={{ fontSize: 34, color: '#2e7d32', marginBottom: 10 }}>✓</div>
    <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: NAVY, marginBottom: 6 }}>Your vote is in</div>
    <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>Thank you for voting. Your ballot was recorded anonymously.</div>
  </div>)
}
