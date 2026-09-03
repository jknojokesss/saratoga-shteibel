import Head from 'next/head'
import { useState } from 'react'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', CREAM = '#faf7f2', MUTED = '#7a7068', BORDER = '#ddd5c4'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US')
const fmtTime = (s) => { try { return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) } catch (e) { return s } }

export default function AuctionAdmin() {
  const [passcode, setPasscode] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [edit, setEdit] = useState(null)

  async function call(action, extra) {
    setError('')
    const r = await fetch('/api/auction/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode, action, ...(extra || {}) }) })
    const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed'); return d
  }
  async function run(action, extra) { setBusy(true); try { setData(await call(action, extra)) } catch (e) { setError(e.message) } finally { setBusy(false) } }

  if (!data) return (
    <>
      <Head><title>Auction · Admin</title></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, display: 'flex', justifyContent: 'center', paddingTop: '14vh' }}>
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 6, padding: '26px 24px', width: 320 }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: NAVY, marginBottom: 16 }}>Auction · Admin</div>
          <input type="password" value={passcode} placeholder="Admin passcode" onChange={(e) => setPasscode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') run() }} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 15, background: CREAM, outline: 'none' }} />
          {error && <div style={{ color: '#B23A2E', fontSize: 13, marginTop: 10 }}>{error}</div>}
          <button onClick={() => run()} disabled={busy} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: 4, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>{busy ? 'Loading…' : 'Open'}</button>
        </div>
      </div>
    </>
  )

  const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 11px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 14, background: CREAM, outline: 'none', fontFamily: SANS }
  const startEdit = () => setEdit({ title: data.title, description: data.description, startingBid: data.startingBid, increment: data.increment, endsAt: data.endsAt ? data.endsAt.slice(0, 16) : '' })

  return (
    <>
      <Head><title>Auction · Admin</title><meta name="viewport" content="width=device-width, initial-scale=1" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@0,500;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a', padding: '28px 18px 60px' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: NAVY }}>{data.title}</div>
          <div style={{ fontSize: 13, color: data.isOpen ? '#2e7d32' : MUTED, marginBottom: 16 }}>{data.isOpen ? '● Bidding is open' : '■ Bidding is closed'}</div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 150, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, color: MUTED }}>High bid</div>
              <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: NAVY }}>{data.highBid != null ? money(data.highBid) : '—'}</div>
              <div style={{ fontSize: 12, color: MUTED }}>{data.bidCount} bid{data.bidCount === 1 ? '' : 's'} · starts {money(data.startingBid)} · +{money(data.increment)}</div>
            </div>
            {data.bids && data.bids[0] && (
              <div style={{ flex: 1, minWidth: 150, background: '#fff', border: `1px solid ${GOLD}`, borderRadius: 6, padding: '16px 18px' }}>
                <div style={{ fontSize: 12, color: MUTED }}>Leading bidder</div>
                <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: NAVY }}>{data.bids[0].name}</div>
                <div style={{ fontSize: 13, color: MUTED }}>{data.bids[0].phone}</div>
              </div>
            )}
          </div>

          {error && <div style={{ color: '#B23A2E', fontSize: 13, marginBottom: 12 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
            {data.isOpen
              ? <button onClick={() => run('close')} style={{ padding: '10px 18px', border: 'none', borderRadius: 4, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 13 }}>Close bidding</button>
              : <button onClick={() => run('open')} style={{ padding: '10px 18px', border: 'none', borderRadius: 4, background: '#2e7d32', color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 13 }}>Open bidding</button>}
            <button onClick={startEdit} style={{ padding: '10px 18px', border: `1px solid ${BORDER}`, borderRadius: 4, background: '#fff', color: NAVY, fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 13 }}>Edit item</button>
            <button onClick={() => run()} style={{ padding: '10px 18px', border: `1px solid ${BORDER}`, borderRadius: 4, background: '#fff', color: NAVY, fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 13 }}>Refresh</button>
            <button onClick={() => { if (confirm('Clear ALL bids? This cannot be undone.')) run('reset') }} style={{ padding: '10px 18px', border: `1px solid #e0b4a8`, borderRadius: 4, background: '#fff', color: '#B23A2E', fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 13 }}>Reset bids</button>
          </div>

          {edit && (
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '18px 20px', marginBottom: 22 }}>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Edit item</div>
              <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: MUTED }}>Title</label><input style={inp} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
              <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: MUTED }}>Description</label><textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: MUTED }}>Starting bid ($)</label><input type="number" style={inp} value={edit.startingBid} onChange={(e) => setEdit({ ...edit, startingBid: e.target.value })} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: MUTED }}>Increment ($)</label><input type="number" style={inp} value={edit.increment} onChange={(e) => setEdit({ ...edit, increment: e.target.value })} /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: MUTED }}>Ends at (optional — leave blank for manual close)</label><input type="datetime-local" style={inp} value={edit.endsAt} onChange={(e) => setEdit({ ...edit, endsAt: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { run('set_item', { title: edit.title, description: edit.description, startingBid: edit.startingBid, increment: edit.increment, endsAt: edit.endsAt ? new Date(edit.endsAt).toISOString() : '' }).then(() => setEdit(null)) }} style={{ padding: '9px 18px', border: 'none', borderRadius: 4, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 13 }}>Save</button>
                <button onClick={() => setEdit(null)} style={{ padding: '9px 18px', border: `1px solid ${BORDER}`, borderRadius: 4, background: '#fff', color: NAVY, fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: NAVY, marginBottom: 10 }}>All bids ({data.bidCount})</div>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
            {(data.bids || []).length === 0 && <div style={{ padding: '16px', color: MUTED, fontSize: 14 }}>No bids yet.</div>}
            {(data.bids || []).map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', borderTop: i ? `1px solid #f0ebe0` : 'none', background: i === 0 ? '#fffdf4' : '#fff' }}>
                <div>
                  <div style={{ fontSize: 15, color: NAVY, fontWeight: i === 0 ? 600 : 400 }}>{i === 0 && <span style={{ color: GOLD, marginRight: 6 }}>★</span>}{b.name}</div>
                  <div style={{ fontSize: 12.5, color: MUTED }}>{b.phone} · {fmtTime(b.at)}</div>
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: NAVY }}>{money(b.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
