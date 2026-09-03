import { useState } from 'react'
import Head from 'next/head'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', CREAM = '#faf7f2', MUTED = '#7a7068', BORDER = '#ddd5c4'
const GREEN = '#2e7d32', RUST = '#b2543a'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"
const usd = (n) => (n < 0 ? '−' : '') + '$' + Math.abs(Number(n)).toLocaleString(undefined, { maximumFractionDigits: 0 })
const usd2 = (n) => (n < 0 ? '−' : '') + '$' + Math.abs(Number(n)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const MON = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
const niceDate = (d) => MON[d.slice(5, 7)] + ' ' + Number(d.slice(8, 10)) + ', ' + d.slice(0, 4)

export default function Books() {
  const [passcode, setPasscode] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(null)      // label of expanded category
  const [detail, setDetail] = useState({})    // label -> list

  async function api(action, body) {
    const r = await fetch('/api/books-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode, action, ...body }) })
    const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed'); return d
  }
  async function load(year) {
    setError(''); setBusy(true); setOpen(null); setDetail({})
    try { setData(await api('summary', { year })) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function toggle(row) {
    if (open === row.label) { setOpen(null); return }
    setOpen(row.label)
    if (!detail[row.label]) {
      try { const d = await api('detail', { year: data.year, category: row.category, subcategory: row.subcategory }); setDetail(x => ({ ...x, [row.label]: d.list })) } catch (e) { setError(e.message) }
    }
  }

  if (!data) return (
    <>
      <Head><title>Saratoga Shteibel · Financials</title></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, display: 'flex', justifyContent: 'center', paddingTop: '13vh' }}>
        <form onSubmit={e => { e.preventDefault(); load() }} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 8, padding: '28px 26px', width: 330, height: 'fit-content' }}>
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: NAVY, marginBottom: 3 }}>Financials</div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 18 }}>Saratoga Shteibel · Statement of Activities</div>
          <input type="password" name="password" autoComplete="current-password" value={passcode} placeholder="Admin passcode" onChange={e => setPasscode(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 15, background: CREAM, outline: 'none' }} />
          {error && <div style={{ color: RUST, fontSize: 13, marginTop: 10 }}>{error}</div>}
          <button type="submit" disabled={busy} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: 6, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>{busy ? 'Loading…' : 'Open'}</button>
        </form>
      </div>
    </>
  )

  const column = (title, list, total, color, tint) => (
    <div style={{ flex: 1, minWidth: 300 }}>
      <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: NAVY, marginBottom: 10 }}>{title}</div>
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
        {list.map((row, i) => {
          const pct = Math.abs(total) ? Math.round(Math.abs(row.total) / Math.abs(total) * 100) : 0
          return (
          <div key={row.label} style={{ borderTop: i ? `1px solid #f0ebe0` : 'none' }}>
            <div onClick={() => toggle(row)} style={{ padding: '11px 15px', cursor: 'pointer', background: open === row.label ? tint : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 14, color: NAVY, fontWeight: 500 }}>{row.label} <span style={{ fontSize: 11, color: MUTED, fontWeight: 400 }}>· {row.n}</span></span>
              <span style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 11, color: MUTED, minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                <span style={{ fontSize: 14, fontWeight: 600, color }}>{usd(row.total)}</span>
              </span>
            </div>
            {open === row.label && (
              <div style={{ background: tint, padding: '2px 15px 12px' }}>
                {!detail[row.label] && <div style={{ fontSize: 12, color: MUTED, padding: '6px 0' }}>Loading…</div>}
                {detail[row.label] && detail[row.label].map((t, j) => (
                  <div key={j} style={{ display: 'flex', gap: 8, fontSize: 12.5, padding: '4px 0', borderTop: j ? '1px solid #eadfce' : 'none', color: '#4a4a4a' }}>
                    <span style={{ color: MUTED, whiteSpace: 'nowrap', minWidth: 76 }}>{niceDate(t.date)}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>{t.who || (t.description || '').slice(0, 40)}{t.memo ? <span style={{ color: MUTED }}> — “{t.memo}”</span> : ''}</span>
                    <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{usd2(t.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          )
        })}
        <div style={{ borderTop: `2px solid ${GOLD}`, padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', background: '#faf7f0' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>Total {title.toLowerCase()}</span>
          <span style={{ fontSize: 16, fontWeight: 600, color }}>{usd(total)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Head><title>Saratoga Shteibel · Financials</title><meta name="viewport" content="width=device-width, initial-scale=1" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@0,500;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a', padding: '30px 18px 70px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: NAVY }}>Saratoga Shteibel</div>
            <div style={{ color: '#a99f8c', fontSize: 12, letterSpacing: 2 }}>STATEMENT OF ACTIVITIES</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '16px 0 22px' }}>
            {data.years.map(y => (
              <button key={y} onClick={() => load(y)} style={{ padding: '7px 18px', borderRadius: 20, border: `1px solid ${y === data.year ? NAVY : BORDER}`, background: y === data.year ? NAVY : '#fff', color: y === data.year ? '#fff' : NAVY, fontFamily: SANS, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>{y}</button>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: MUTED, marginBottom: 20 }}>{data.year === '2026' ? 'through ' + (data.lastDate ? niceDate(data.lastDate) : '') : 'full calendar year'}</div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 26, flexWrap: 'wrap' }}>
            {[
              { k: 'Total income', v: data.totalIncome, c: GREEN },
              { k: 'Total expenses', v: data.totalExpense, c: RUST },
              { k: data.net >= 0 ? 'Surplus' : 'Deficit', v: data.net, c: data.net >= 0 ? NAVY : RUST, big: true },
            ].map(m => (
              <div key={m.k} style={{ flex: 1, minWidth: 180, background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${m.c}`, borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.k}</div>
                <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 600, color: m.c, lineHeight: 1.15 }}>{usd(m.v)}</div>
              </div>
            ))}
          </div>

          {error && <div style={{ color: RUST, fontSize: 13, marginBottom: 12 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {column('Income', data.income, data.totalIncome, GREEN, '#f0f6ec')}
            {column('Expenses', data.expenses, data.totalExpense, RUST, '#f9efeb')}
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: MUTED, marginTop: 26, lineHeight: 1.6 }}>
            Click any category to see its transactions · every figure ties to the bank statement · tap a year above to switch
          </div>
        </div>
      </div>
    </>
  )
}
