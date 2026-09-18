import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'

const LOGO = '/logo.png'
const NAVY = '#1e2d4e'
const NAVY_LIGHT = '#2c3e6b'
const GOLD = '#c9a84c'
const MUTED = '#7a7068'
const CREAM = '#faf7f2'
const BORDER = '#ddd5c4'
const FONT_SERIF = "'Cormorant Garamond', Georgia, serif"
const FONT_SANS = "'Jost', -apple-system, system-ui, sans-serif"

const money = (n) => '$' + Number(n || 0).toLocaleString('en-US')
const fmtTime = (s) => { try { return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) } catch (e) { return '' } }
const fmtCountdown = (ms) => {
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  const pad = (n) => String(n).padStart(2, '0')
  return (d > 0 ? d + 'd ' : '') + pad(h) + 'h ' + pad(m) + 'm ' + pad(sec) + 's'
}
// Snaps to (917) 888-8888 once all 10 digits are entered; keeps raw digits before that.
const formatPhone = (v) => {
  const d = (v || '').replace(/\D/g, '').slice(0, 10)
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d
}

export default function SaratogaHome() {
  const [a, setA] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null) // winning amount after a successful bid
  const [now, setNow] = useState(0) // ticks every second for the countdown
  const timer = useRef(null)
  const touched = useRef(false)

  async function load() {
    try {
      const r = await fetch('/api/auction/status')
      const d = await r.json()
      setA(d)
      // Pre-fill the amount with the minimum next bid until the user edits it.
      if (!touched.current && d && d.nextMin != null) setAmount(String(d.nextMin))
    } catch (e) {}
  }
  useEffect(() => {
    load()
    timer.current = setInterval(load, 12000)
    setNow(Date.now())
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => { timer.current && clearInterval(timer.current); clearInterval(tick) }
  }, [])

  async function placeBid() {
    setError('')
    if (!name.trim()) return setError('Please enter your name.')
    if (!phone.trim()) return setError('Please enter your phone number.')
    const amt = Number(amount)
    if (!amt || amt < (a?.nextMin || 0)) return setError('Your bid must be at least ' + money(a?.nextMin) + '.')
    setBusy(true)
    try {
      const r = await fetch('/api/auction/bid', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), amount: amt }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Could not place your bid.')
      setDone(amt)
      touched.current = false
      await load()
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const label = { display: 'block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 6, fontWeight: 500 }
  const input = { width: '100%', boxSizing: 'border-box', height: 46, border: `1px solid ${BORDER}`, borderRadius: 3, padding: '0 13px', fontFamily: FONT_SANS, fontSize: 15, background: CREAM, outline: 'none' }

  return (
    <>
      <Head>
        <title>Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: FONT_SANS, padding: '32px 16px 60px' }}>
        <div style={{ width: '100%', maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <img src={LOGO} alt="Saratoga Shteibel" style={{ width: '100%', maxWidth: 220, height: 'auto', margin: '0 auto 22px', display: 'block', mixBlendMode: 'multiply' }} />

          <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>Shul Auction</div>

          {!a ? (
            <div style={{ color: MUTED, fontSize: 15, padding: '30px 0' }}>Loading…</div>
          ) : (
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 4, padding: '26px 24px', textAlign: 'left' }}>
              {a.imageUrl ? (
                <img src={a.imageUrl} alt={a.title} style={{ display: 'block', width: '100%', maxWidth: 260, margin: '0 auto 20px', height: 'auto', borderRadius: 3, border: `1px solid ${BORDER}` }} />
              ) : null}

              <div style={{ fontFamily: FONT_SERIF, fontSize: 25, fontWeight: 600, color: NAVY, textAlign: 'center', lineHeight: 1.2 }}>{a.title}</div>
              {a.description ? <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, textAlign: 'center', margin: '8px 0 0' }}>{a.description}</div> : null}

              {a.endsAt && (() => {
                const remaining = new Date(a.endsAt).getTime() - now
                const ended = now > 0 && remaining <= 0
                const endLabel = new Date(a.endsAt).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })
                return ended ? (
                  <div style={{ background: '#6f2b2b', color: '#fff', borderRadius: 6, padding: '13px 14px', textAlign: 'center', margin: '18px 0 0' }}>
                    <div style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 600 }}>The auction has ended</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>Closed {endLabel} ET</div>
                  </div>
                ) : (
                  <div style={{ background: NAVY, color: '#fff', borderRadius: 6, padding: '13px 14px', textAlign: 'center', margin: '18px 0 0' }}>
                    <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, marginBottom: 3 }}>Auction ends in</div>
                    <div style={{ fontFamily: FONT_SERIF, fontSize: 27, fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1.1 }}>{now > 0 ? fmtCountdown(remaining) : '—'}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.6)', marginTop: 3 }}>{endLabel} ET</div>
                  </div>
                )
              })()}

              <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 3, padding: '16px 18px', margin: '20px 0 6px', textAlign: 'center' }}>
                {a.highBid != null ? (
                  <>
                    <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED }}>Current high bid</div>
                    <div style={{ fontFamily: FONT_SERIF, fontSize: 38, fontWeight: 600, color: NAVY, lineHeight: 1.1 }}>{money(a.highBid)}</div>
                    <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{a.bidCount} bid{a.bidCount === 1 ? '' : 's'} so far</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED }}>Starting bid</div>
                    <div style={{ fontFamily: FONT_SERIF, fontSize: 38, fontWeight: 600, color: NAVY, lineHeight: 1.1 }}>{money(a.startingBid)}</div>
                    <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>Be the first to bid</div>
                  </>
                )}
              </div>

              {a.history && a.history.length > 0 && (
                <div style={{ margin: '4px 0 2px' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginBottom: 6 }}>Bid history</div>
                  <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden', maxHeight: 200, overflowY: 'auto' }}>
                    {a.history.map((h, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 13px', borderTop: i ? `1px solid #f0ebe0` : 'none', background: i === 0 ? '#fbfaf7' : '#fff' }}>
                        <span style={{ fontSize: 12.5, color: MUTED }}>{i === 0 ? 'Leading bid' : 'Bid'} · {fmtTime(h.at)}</span>
                        <span style={{ fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 600, color: i === 0 ? NAVY : '#4a4a4a' }}>{money(h.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 5, textAlign: 'center' }}>Bidders stay anonymous — amounts only.</div>
                </div>
              )}

              {!a.open ? (
                <div style={{ textAlign: 'center', color: NAVY, fontSize: 15, fontWeight: 500, padding: '16px 0 4px' }}>Bidding is closed.</div>
              ) : done != null ? (
                <div style={{ textAlign: 'center', padding: '10px 0 2px' }}>
                  <div style={{ fontSize: 30, color: '#2e7d32' }}>✓</div>
                  <div style={{ fontFamily: FONT_SERIF, fontSize: 21, fontWeight: 600, color: NAVY, margin: '4px 0' }}>Your bid of {money(done)} is in</div>
                  <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6 }}>{a.highBid > done ? 'You’ve since been outbid — place another to take the lead.' : 'You’re the current high bidder. We’ll be in touch if you win.'}</div>
                  <button onClick={() => setDone(null)} style={{ marginTop: 14, background: '#fff', color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 3, padding: '10px 20px', fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Place another bid</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: MUTED, textAlign: 'center', margin: '10px 0 16px' }}>Next bid: at least <b style={{ color: NAVY }}>{money(a.nextMin)}</b> &nbsp;·&nbsp; +{money(a.increment)} minimum</div>
                  <div style={{ marginBottom: 12 }}><label style={label}>Your Bid Amount</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 13, top: 12, color: MUTED, fontSize: 15 }}>$</span>
                      <input type="text" inputMode="numeric" value={amount ? Number(amount).toLocaleString('en-US') : ''} onChange={(e) => { touched.current = true; setAmount(e.target.value.replace(/[^\d]/g, '')) }} style={{ ...input, paddingLeft: 24 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}><label style={label}>Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={input} /></div>
                    <div style={{ flex: 1 }}><label style={label}>Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(732) 555-0148" style={input} /></div>
                  </div>
                  <button onClick={placeBid} disabled={busy} style={{ width: '100%', height: 50, background: NAVY, color: '#fff', border: 'none', borderRadius: 3, fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Placing bid…' : 'Place bid'}</button>
                  {error ? <div style={{ color: '#B23A2E', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</div> : null}
                  <div style={{ fontSize: 11.5, color: MUTED, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>Your bid is private. Only the shul office can see who placed it — never other bidders.</div>
                </>
              )}
            </div>
          )}

          <div style={{ marginTop: 26 }}>
            <a href="/donate" style={{ display: 'inline-block', background: '#fff', color: NAVY, fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '13px 40px', borderRadius: 3, border: `1px solid ${BORDER}`, letterSpacing: 0.5 }}>Donate to the Shul</a>
          </div>
        </div>
      </div>
    </>
  )
}
