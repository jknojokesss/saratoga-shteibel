import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', CREAM = '#faf7f2', MUTED = '#7a7068', BORDER = '#ddd5c4'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"

export default function BoardVoteAdmin() {
  const [passcode, setPasscode] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const timer = useRef(null)

  async function call(action, extra) {
    setError('')
    const r = await fetch('/api/board-vote/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode, action, ...(extra || {}) }) })
    const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed'); return d
  }
  async function setRule(exact) { setBusy(true); try { setData(await call('set_rule', { exact })) } catch (e) { setError(e.message) } finally { setBusy(false) } }
  async function load(action) {
    setBusy(true)
    try { setData(await call(action)) } catch (e) { setError(e.message); if (!data) setData(null) } finally { setBusy(false) }
  }
  useEffect(() => () => timer.current && clearInterval(timer.current), [])

  function start() {
    load().then(() => {
      if (timer.current) clearInterval(timer.current)
      timer.current = setInterval(() => { if (data ? data.isOpen : true) call().then(setData).catch(() => {}) }, 5000)
    })
  }

  if (!data) return (
    <>
      <Head><title>Board Election · Admin</title></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, display: 'flex', justifyContent: 'center', paddingTop: '14vh' }}>
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 8, padding: '26px 24px', width: 320 }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: NAVY, marginBottom: 16 }}>Board Election · Admin</div>
          <input type="password" value={passcode} placeholder="Admin passcode" onChange={e => setPasscode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') start() }} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 15, background: CREAM, outline: 'none' }} />
          {error && <div style={{ color: '#B23A2E', fontSize: 13, marginTop: 10 }}>{error}</div>}
          <button onClick={start} disabled={busy} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: 6, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>{busy ? 'Loading…' : 'Open'}</button>
        </div>
      </div>
    </>
  )

  const pct = data.totalEligible ? Math.round((data.votedCount / data.totalEligible) * 100) : 0
  const maxVotes = data.tally && data.tally.length ? data.tally[0].votes : 0

  return (
    <>
      <Head><title>Board Election · Admin</title><meta name="viewport" content="width=device-width, initial-scale=1" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@0,500;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a', padding: '28px 18px 60px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: NAVY }}>{data.title || 'Board Election'}</div>
          <div style={{ fontSize: 13, color: data.isOpen ? '#2e7d32' : MUTED, marginBottom: 14 }}>{data.isOpen ? '● Voting is open' : '■ Voting is closed'}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: MUTED }}>Pick rule:</span>
            {[{ e: true, l: `Exactly ${data.picks}` }, { e: false, l: `Up to ${data.picks}` }].map(o => (
              <button key={o.l} onClick={() => setRule(o.e)} disabled={busy} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${data.pickExact === o.e ? NAVY : BORDER}`, background: data.pickExact === o.e ? NAVY : '#fff', color: data.pickExact === o.e ? '#fff' : NAVY, fontFamily: SANS, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{o.l}</button>
            ))}
            {data.votedCount > 0 && <span style={{ fontSize: 11, color: '#B23A2E' }}>· changing mid-vote won’t alter ballots already cast</span>}
          </div>

          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 22px', marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: MUTED }}>Turnout</div>
            <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: NAVY, lineHeight: 1.1 }}>{data.votedCount} <span style={{ fontSize: 20, color: MUTED }}>/ {data.totalEligible}</span></div>
            <div style={{ height: 8, background: '#efeadd', borderRadius: 5, marginTop: 12, overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: GOLD }} /></div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>{pct}% voted</div>
          </div>

          {error && <div style={{ color: '#B23A2E', fontSize: 13, marginBottom: 12 }}>{error}</div>}

          {data.isOpen ? (
            <>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 12, lineHeight: 1.5 }}>Results stay hidden until you close voting. Then you’ll see the tally and who voted.</div>
              <button onClick={() => { if (confirm('Close voting? Results will be revealed and no more votes can be cast.')) load('close') }} style={{ padding: '11px 22px', border: 'none', borderRadius: 6, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 14 }}>Close voting</button>
            </>
          ) : (
            <>
              <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Results</div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>{data.ballotCount} ballots · {data.pickExact ? `${data.picks} picks each` : `up to ${data.picks} picks each`} · <b>{data.totalVotes} total votes</b> (max possible {data.ballotCount * (data.picks || 3)})</div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Ballot audit: {data.pickDistribution || '—'} · {data.votedCount} voters → {data.ballotCount} ballots {data.votedCount === data.ballotCount ? '✓' : '⚠ MISMATCH'}</div>
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '6px 0', marginBottom: 20 }}>
                {(data.tally || []).map((t, i) => (
                  <div key={i} style={{ padding: '9px 16px', borderTop: i ? `1px solid #f0ebe0` : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 14, color: NAVY }}>
                      <span style={{ fontWeight: i < (data.picks || 5) ? 500 : 400 }}>
                        {i < (data.picks || 5) ? <span style={{ color: GOLD, marginRight: 6 }}>★</span> : null}{t.name}
                        {i === 0 && <span style={{ marginLeft: 8, fontSize: 10.5, background: GOLD, color: '#3a2e08', padding: '2px 8px', borderRadius: 9, fontWeight: 600, verticalAlign: 'middle' }}>3-YEAR TERM</span>}
                        {(i === 1 || i === 2) && <span style={{ marginLeft: 8, fontSize: 10.5, background: '#e9e2cf', color: NAVY, padding: '2px 8px', borderRadius: 9, fontWeight: 600, verticalAlign: 'middle' }}>2-YEAR TERM</span>}
                      </span>
                      <span style={{ fontWeight: 500 }}>{t.votes}</span>
                    </div>
                    <div style={{ height: 6, background: '#f2eede', borderRadius: 4, marginTop: 5, overflow: 'hidden' }}><div style={{ width: (maxVotes ? Math.round(t.votes / maxVotes * 100) : 0) + '%', height: '100%', background: i < (data.picks || 5) ? GOLD : '#cdc6b3' }} /></div>
                  </div>
                ))}
                {(!data.tally || data.tally.length === 0) && <div style={{ padding: '14px 16px', color: MUTED, fontSize: 13 }}>No ballots cast.</div>}
              </div>

              <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Who voted ({(data.voted || []).length})</div>
              <div style={{ fontSize: 13, color: '#4a4a4a', lineHeight: 1.9, marginBottom: 16 }}>{(data.voted || []).join(' · ') || '—'}</div>
              {(data.notVoted || []).length > 0 && <>
                <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: MUTED, marginBottom: 6 }}>Didn’t vote ({data.notVoted.length})</div>
                <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.9, marginBottom: 18 }}>{data.notVoted.join(' · ')}</div>
              </>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => load('reopen')} style={{ padding: '10px 18px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#fff', color: NAVY, fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 13 }}>Reopen voting</button>
                <button onClick={() => { if (confirm('Reset the whole election? Clears all ballots and lets everyone vote again. Use this after the trial run.')) load('reset') }} style={{ padding: '10px 18px', border: `1px solid #e0b4a8`, borderRadius: 6, background: '#fff', color: '#B23A2E', fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 13 }}>Reset election</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
