import { useState } from 'react'
import Head from 'next/head'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', CREAM = '#faf7f2', MUTED = '#7a7068', BORDER = '#ddd5c4'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"
const MLABEL = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
const lab = (ym) => MLABEL[ym.slice(5)] + " '" + ym.slice(2, 4)

export default function Membership() {
  const [passcode, setPasscode] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sel, setSel] = useState(null)
  const [payments, setPayments] = useState(null)
  const [newName, setNewName] = useState('')

  async function api(action, body) {
    const r = await fetch('/api/membership', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode, action, ...body }) })
    const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed'); return d
  }
  async function load() {
    setError(''); setBusy(true)
    try { setData(await api('load')) } catch (e) { setError(e.message); setData(null) } finally { setBusy(false) }
  }
  const key = (mid, ym) => mid + '|' + ym
  const allocMap = () => { const m = {}; (data.allocations || []).forEach(a => { m[key(a.member_id, a.ym)] = a }); return m }

  async function toggle(mid, ym, isOn) {
    setData(d => { const al = d.allocations.filter(a => !(a.member_id === mid && a.ym === ym)); if (!isOn) al.push({ member_id: mid, ym, amount: 50, source: 'manual', status: 'confirmed' }); return { ...d, allocations: al } })
    try { await api('toggle', { member_id: mid, ym, on: !isOn }) } catch (e) { setError(e.message); load() }
  }
  async function pickMember(m) {
    setSel(m); setPayments(null)
    try { const d = await api('memberPayments', { member_id: m.id }); setPayments(d.payments) } catch (e) { setError(e.message) }
  }
  async function addMember() {
    if (!newName.trim()) return
    try { await api('addMember', { name: newName }); setNewName(''); load() } catch (e) { setError(e.message) }
  }

  if (!data) {
    return (
      <>
        <Head><title>Membership Tracker</title><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@0,500;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" /></Head>
        <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 4, padding: '28px 26px', width: 320 }}>
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: NAVY, marginBottom: 16 }}>Membership Tracker</div>
            <input type="password" value={passcode} placeholder="Admin passcode" onChange={e => setPasscode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') load() }} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${BORDER}`, borderRadius: 3, fontFamily: SANS, fontSize: 15, background: CREAM, outline: 'none' }} />
            {error && <div style={{ color: '#B23A2E', fontSize: 13, marginTop: 10 }}>{error}</div>}
            <button onClick={load} disabled={busy} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: 3, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>{busy ? 'Loading…' : 'Open'}</button>
          </div>
        </div>
      </>
    )
  }

  const am = allocMap()
  const paidThisYear = (data.allocations || []).reduce((s, a) => s + Number(a.amount || 0), 0)

  return (
    <>
      <Head><title>Membership Tracker</title><meta name="viewport" content="width=device-width, initial-scale=1" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@0,500;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a', padding: '20px 18px 60px' }}>
        <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: NAVY }}>Membership Tracker</div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>Aug 2025 – Jul 2026 · $50/mo · click a cell to mark paid, click a name to see their payments</div>
        <div style={{ fontSize: 13, color: NAVY, marginBottom: 12 }}>Collected: <b>${paidThisYear.toLocaleString()}</b> · {data.members.length} members</div>
        {error && <div style={{ color: '#B23A2E', fontSize: 13, marginBottom: 8 }}>{error}</div>}

        <div style={{ overflowX: 'auto', border: `0.5px solid ${BORDER}`, borderRadius: 6, background: '#fff' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
            <thead><tr>
              <th style={{ position: 'sticky', left: 0, background: '#f0ebe0', padding: '7px 10px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, color: MUTED, fontWeight: 500, minWidth: 130 }}>Member</th>
              {data.months.map(ym => <th key={ym} style={{ padding: '7px 3px', borderBottom: `1px solid ${BORDER}`, color: MUTED, fontWeight: 500, minWidth: 42 }}>{lab(ym)}</th>)}
            </tr></thead>
            <tbody>
              {data.members.map(m => (
                <tr key={m.id} style={{ background: sel && sel.id === m.id ? '#fbf7ec' : '#fff' }}>
                  <td onClick={() => pickMember(m)} style={{ position: 'sticky', left: 0, background: sel && sel.id === m.id ? '#fbf7ec' : '#fff', padding: '6px 10px', borderBottom: `0.5px solid ${BORDER}`, whiteSpace: 'nowrap', cursor: 'pointer', color: NAVY, fontWeight: sel && sel.id === m.id ? 500 : 400 }}>{m.name}</td>
                  {data.months.map(ym => {
                    const a = am[key(m.id, ym)]
                    return <td key={ym} onClick={() => toggle(m.id, ym, !!a)} title={a ? (a.source || '') : ''} style={{ textAlign: 'center', padding: '6px 2px', borderBottom: `0.5px solid ${BORDER}`, borderLeft: `0.5px solid ${BORDER}`, cursor: 'pointer', background: a ? '#e4efe0' : 'transparent', color: a ? '#2e6a2e' : '#c9c4b8', fontWeight: 500 }}>{a ? '50' : '·'}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <input value={newName} placeholder="Add a member…" onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addMember() }} style={{ padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: 3, fontFamily: SANS, fontSize: 13, background: '#fff', outline: 'none', width: 220 }} />
          <button onClick={addMember} style={{ padding: '9px 18px', border: 'none', borderRadius: 3, background: GOLD, color: NAVY, fontWeight: 500, fontFamily: SANS, cursor: 'pointer', fontSize: 13 }}>Add</button>
        </div>

        {sel && (
          <div style={{ marginTop: 20, background: '#fff', border: `0.5px solid ${BORDER}`, borderRadius: 8, padding: '16px 18px', maxWidth: 620 }}>
            <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: NAVY, marginBottom: 2 }}>{sel.name} — matched payments</div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Every payment we matched to {sel.name} across Sola, Donors Fund &amp; Zelle. Use it to decide which months to mark above.</div>
            {payments === null && <div style={{ color: MUTED, fontSize: 13 }}>Loading…</div>}
            {payments && payments.length === 0 && <div style={{ color: MUTED, fontSize: 13 }}>No payments matched by name yet. (May have paid by check/cash, or the name differs — tell me and I'll add an alias.)</div>}
            {payments && payments.length > 0 && (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i} style={{ borderTop: `0.5px solid ${BORDER}` }}>
                      <td style={{ padding: '6px 8px 6px 0', color: MUTED, whiteSpace: 'nowrap' }}>{p.date}</td>
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}><span style={{ fontSize: 11, background: '#f0ebe0', color: NAVY, padding: '2px 7px', borderRadius: 10 }}>{p.source}</span></td>
                      <td style={{ padding: '6px 8px', fontWeight: 500, whiteSpace: 'nowrap' }}>${Number(p.amount).toFixed(2)}</td>
                      <td style={{ padding: '6px 0', color: '#5a5348' }}>{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  )
}
