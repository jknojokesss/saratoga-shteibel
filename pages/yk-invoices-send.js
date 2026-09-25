import { useState, useEffect } from 'react'
import Head from 'next/head'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', CREAM = '#faf7f2', MUTED = '#7a7068', BORDER = '#ddd5c4', GREEN = '#2e7d32'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"
const LS_KEY = 'ykInvoiceSent'

const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

const message = (name, balance) => {
  const lines = [
    'Saratoga Shteibel — Yom Kippur honors',
    '',
    `Hi ${name.split(' ')[0] || name},`,
    '',
    balance > 0
      ? `Attached is your invoice. Balance due: ${money(balance)}. Thank you for your support.`
      : 'Attached is your invoice — paid in full. Thank you for your support of the Shteibel.',
  ]
  return lines.join('\n')
}

const waLink = (phone, name, balance) => {
  const digits = (phone || '').replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message(name, balance))}`
}

export default function YkInvoicesSend() {
  const [passcode, setPasscode] = useState('')
  const [title, setTitle] = useState('')
  const [buyers, setBuyers] = useState(null)
  const [sent, setSent] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [dlBusy, setDlBusy] = useState('')

  useEffect(() => {
    try { setSent(JSON.parse(localStorage.getItem(LS_KEY) || '{}')) } catch (e) {}
  }, [])

  function mark(id, on) {
    setSent((prev) => {
      const n = { ...prev, [id]: on }
      try { localStorage.setItem(LS_KEY, JSON.stringify(n)) } catch (e) {}
      return n
    })
  }

  async function load() {
    setError('')
    setBusy(true)
    try {
      const r = await fetch('/api/yk-sales/roster', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setTitle(d.title)
      setBuyers(d.buyers)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function downloadInvoice(b) {
    setError('')
    setDlBusy(b.id)
    try {
      const r = await fetch('/api/yk-sales/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, buyerId: b.id }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        throw new Error(d.error || 'Download failed')
      }
      const blob = await r.blob()
      const dispo = r.headers.get('Content-Disposition') || ''
      const m = /filename="([^"]+)"/.exec(dispo)
      const filename = m ? m[1] : `Invoice-${b.name.replace(/\s+/g, '-')}.pdf`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setDlBusy('')
    }
  }

  if (!buyers) {
    return (
      <>
        <Head><title>Yom Kippur Invoices</title></Head>
        <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, display: 'flex', justifyContent: 'center', paddingTop: '14vh' }}>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 8, padding: '26px 24px', width: 320 }}>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Yom Kippur Invoices</div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>Same admin passcode as other shul tools.</div>
            <input type="password" value={passcode} placeholder="Admin passcode" onChange={(e) => setPasscode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') load() }} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 15, background: CREAM, outline: 'none' }} />
            {error && <div style={{ color: '#B23A2E', fontSize: 13, marginTop: 10 }}>{error}</div>}
            <button type="button" onClick={load} disabled={busy} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: 6, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>{busy ? 'Loading…' : 'Open'}</button>
          </div>
        </div>
      </>
    )
  }

  const sentCount = buyers.filter((b) => sent[b.id]).length

  return (
    <>
      <Head><title>Yom Kippur Invoices</title><meta name="viewport" content="width=device-width, initial-scale=1" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@0,500;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a', padding: '26px 16px 60px' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: NAVY }}>{title || 'Yom Kippur Invoices'}</div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 4, lineHeight: 1.55 }}>
            On your computer with <b>WhatsApp Web</b> open: tap <b>PDF</b> to save the invoice (clear filename with their name), then <b>WhatsApp</b> to open a pre-filled message — attach the PDF in the chat and send.
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 12, lineHeight: 1.5 }}>
            Voting codes page (same WhatsApp pattern): <a href="/board-vote-send" style={{ color: NAVY }}>/board-vote-send</a>
          </div>
          <div style={{ fontSize: 14, color: NAVY, marginBottom: 16 }}>Sent: <b>{sentCount}</b> / {buyers.length}</div>
          {error && <div style={{ color: '#B23A2E', fontSize: 13, marginBottom: 12 }}>{error}</div>}

          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
            {buyers.map((b, i) => {
              const done = !!sent[b.id]
              const balance = Math.round((Number(b.subtotal || 0) - Number(b.paid || 0)) * 100) / 100
              const wa = waLink(b.phone, b.name, balance)
              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px', borderTop: i ? `1px solid #f0ebe0` : 'none', background: done ? '#f2f7ef' : '#fff', flexWrap: 'wrap' }}>
                  <div role="button" tabIndex={0} onClick={() => mark(b.id, !done)} onKeyDown={(e) => { if (e.key === 'Enter') mark(b.id, !done) }} title="Mark sent" style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${done ? GREEN : '#cfc7b5'}`, background: done ? GREEN : '#fff', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>{done ? '✓' : ''}</div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 15, color: NAVY, fontWeight: done ? 400 : 500 }}>{b.name}</div>
                    <div style={{ fontSize: 12.5, color: MUTED }}>
                      {b.itemCount} honor{b.itemCount === 1 ? '' : 's'}
                      {b.subtotal > 0 && <> · due {money(balance)}</>}
                      {!b.phone && <> · add phone for WhatsApp</>}
                    </div>
                  </div>
                  <button type="button" onClick={() => downloadInvoice(b)} disabled={dlBusy === b.id} style={{ padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 7, background: '#fff', color: NAVY, fontWeight: 600, fontSize: 12, fontFamily: SANS, cursor: 'pointer', whiteSpace: 'nowrap' }}>{dlBusy === b.id ? '…' : 'PDF'}</button>
                  {wa ? (
                    <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => mark(b.id, true)} style={{ textDecoration: 'none', background: '#25D366', color: '#0b3d1e', fontWeight: 600, fontSize: 12, padding: '8px 14px', borderRadius: 7, whiteSpace: 'nowrap', fontFamily: SANS }}>WhatsApp</a>
                  ) : (
                    <span style={{ fontSize: 11, color: MUTED, padding: '8px 6px' }}>no phone</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
