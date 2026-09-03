import { useState } from 'react'
import Head from 'next/head'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', CREAM = '#faf7f2', MUTED = '#7a7068', BORDER = '#ddd5c4'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"
const fmt = (n) => '$' + Math.abs(Number(n)).toLocaleString(undefined, { minimumFractionDigits: 2 })
const catKey = (c) => c.cat + (c.sub ? '|' + c.sub : '')

export default function BooksReview() {
  const [passcode, setPasscode] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [splitId, setSplitId] = useState(null)
  const [parts, setParts] = useState([])

  async function api(action, body) {
    const r = await fetch('/api/books-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode, action, ...body }) })
    const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed'); return d
  }
  async function load() {
    setError(''); setBusy(true)
    try { setData(await api('list')) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function setCat(row, val) {
    if (!val) return
    const [cat, sub] = val.split('|')
    setData(d => ({ ...d, rows: d.rows.filter(r => r.id !== row.id), stats: { ...d.stats, reviewLeft: d.stats.reviewLeft - 1 } }))
    try { await api('set', { id: row.id, category: cat, subcategory: sub || null }) } catch (e) { setError(e.message); load() }
  }
  function startSplit(row) {
    setSplitId(row.id)
    setParts([{ amount: row.amount, cat: '' }, { amount: 0, cat: '' }])
  }
  async function saveSplit(row) {
    setError('')
    const cleaned = parts.map(p => ({ amount: Number(p.amount), category: (p.cat || '').split('|')[0], subcategory: (p.cat || '').split('|')[1] || null }))
    if (cleaned.some(p => !p.category || !p.amount)) { setError('Every part needs an amount and a category.'); return }
    try {
      await api('split', { id: row.id, parts: cleaned })
      setSplitId(null)
      setData(d => ({ ...d, rows: d.rows.filter(r => r.id !== row.id), stats: { ...d.stats, reviewLeft: d.stats.reviewLeft - 1 } }))
    } catch (e) { setError(e.message) }
  }

  if (!data) return (
    <>
      <Head><title>Books · Review</title></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, display: 'flex', justifyContent: 'center', paddingTop: '14vh' }}>
        <form onSubmit={e => { e.preventDefault(); load() }} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 8, padding: '26px 24px', width: 320, height: 'fit-content' }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: NAVY, marginBottom: 16 }}>Books · Review Queue</div>
          <input type="password" name="password" autoComplete="current-password" value={passcode} placeholder="Admin passcode" onChange={e => setPasscode(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 15, background: CREAM, outline: 'none' }} />
          {error && <div style={{ color: '#B23A2E', fontSize: 13, marginTop: 10 }}>{error}</div>}
          <button type="submit" disabled={busy} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: 6, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>{busy ? 'Loading…' : 'Open'}</button>
        </form>
      </div>
    </>
  )

  const opts = (row) => (Number(row.amount) > 0 ? data.categories.income : data.categories.expense)

  return (
    <>
      <Head><title>Books · Review</title><meta name="viewport" content="width=device-width, initial-scale=1" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@0,500;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a', padding: '26px 16px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: NAVY }}>Review Queue</div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>{data.stats.reviewLeft} of {data.stats.total} transactions left · pick a category and it saves instantly · use Split when one payment covers two things</div>
          {error && <div style={{ color: '#B23A2E', fontSize: 13, marginBottom: 10 }}>{error}</div>}

          {data.rows.length === 0 && <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 30, textAlign: 'center', color: '#2e7d32', fontSize: 16 }}>✓ All caught up — every transaction is categorized.</div>}

          {data.rows.map(row => (
            <div key={row.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap' }}>{row.txn_date}</span>
                <span style={{ fontSize: 10, background: '#f0ebe0', color: NAVY, padding: '2px 7px', borderRadius: 8, textTransform: 'uppercase' }}>{row.source}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: Number(row.amount) > 0 ? '#2e7d32' : '#B23A2E', whiteSpace: 'nowrap' }}>{Number(row.amount) > 0 ? '+' : '−'}{fmt(row.amount)}</span>
                <span style={{ fontSize: 13, color: NAVY, fontWeight: 500 }}>{row.counterparty || ''}</span>
              </div>
              <div style={{ fontSize: 12, color: '#5a5348', margin: '4px 0 8px', lineHeight: 1.4 }}>{row.description}</div>
              {splitId !== row.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select defaultValue="" onChange={e => setCat(row, e.target.value)} style={{ flex: 1, padding: '8px 10px', border: `1px solid ${BORDER}`, borderRadius: 6, fontFamily: SANS, fontSize: 13, background: CREAM }}>
                    <option value="" disabled>Choose category…</option>
                    {opts(row).map(c => <option key={catKey(c)} value={catKey(c)}>{c.cat}{c.sub ? ' — ' + c.sub : ''}</option>)}
                  </select>
                  <button onClick={() => startSplit(row)} style={{ padding: '8px 14px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#fff', color: NAVY, fontFamily: SANS, fontSize: 12, cursor: 'pointer' }}>Split</button>
                </div>
              ) : (
                <div style={{ background: CREAM, borderRadius: 8, padding: 10 }}>
                  {parts.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <input type="number" step="0.01" value={p.amount} onChange={e => setParts(ps => ps.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} style={{ width: 100, padding: '7px 9px', border: `1px solid ${BORDER}`, borderRadius: 6, fontFamily: SANS, fontSize: 13 }} />
                      <select value={p.cat} onChange={e => setParts(ps => ps.map((x, j) => j === i ? { ...x, cat: e.target.value } : x))} style={{ flex: 1, padding: '7px 9px', border: `1px solid ${BORDER}`, borderRadius: 6, fontFamily: SANS, fontSize: 13, background: '#fff' }}>
                        <option value="" disabled>Category…</option>
                        {opts(row).map(c => <option key={catKey(c)} value={catKey(c)}>{c.cat}{c.sub ? ' — ' + c.sub : ''}</option>)}
                      </select>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button onClick={() => setParts(ps => [...ps, { amount: 0, cat: '' }])} style={{ padding: '7px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#fff', fontFamily: SANS, fontSize: 12, cursor: 'pointer' }}>+ part</button>
                    <button onClick={() => saveSplit(row)} style={{ padding: '7px 16px', border: 'none', borderRadius: 6, background: NAVY, color: '#fff', fontFamily: SANS, fontSize: 12, cursor: 'pointer' }}>Save split</button>
                    <button onClick={() => setSplitId(null)} style={{ padding: '7px 12px', border: 'none', borderRadius: 6, background: 'transparent', color: MUTED, fontFamily: SANS, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                    <span style={{ fontSize: 12, color: MUTED, alignSelf: 'center' }}>must add up to {fmt(row.amount)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
