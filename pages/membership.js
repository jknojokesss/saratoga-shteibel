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
  const [yearOffset, setYearOffset] = useState(0) // 0 = current membership year, -1 = prior year

  async function api(action, body) {
    const r = await fetch('/api/membership', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode, action, ...body }) })
    const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed'); return d
  }
  async function load(offset = yearOffset) {
    setError(''); setBusy(true)
    try { setData(await api('load', { yearOffset: offset })) } catch (e) { setError(e.message); setData(null) } finally { setBusy(false) }
  }
  function switchYear(offset) {
    setYearOffset(offset); setSel(null); setPayments(null); load(offset)
  }
  const key = (mid, ym) => mid + '|' + ym
  const allocMap = () => { const m = {}; (data.allocations || []).forEach(a => { m[key(a.member_id, a.ym)] = a }); return m }

  async function toggle(mid, ym, a) {
    const on = !(a && a.status === 'confirmed') // empty or suggested -> confirm; confirmed -> clear
    setData(d => { const al = d.allocations.filter(x => !(x.member_id === mid && x.ym === ym)); if (on) al.push({ member_id: mid, ym, amount: 50, source: a ? a.source : 'manual', status: 'confirmed' }); return { ...d, allocations: al } })
    try { await api('toggle', { member_id: mid, ym, on, source: a ? a.source : 'manual', note: a ? a.note : null }) } catch (e) { setError(e.message); load() }
  }
  async function autofill() {
    setError(''); setBusy(true)
    try { await api('autofill'); await load() } catch (e) { setError(e.message) } finally { setBusy(false) }
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
          <form onSubmit={e => { e.preventDefault(); load() }} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 4, padding: '28px 26px', width: 320 }}>
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: NAVY, marginBottom: 16 }}>Membership Tracker</div>
            <input type="text" name="username" autoComplete="username" defaultValue="Saratoga Membership" readOnly tabIndex={-1} aria-hidden="true" style={{ position: 'absolute', width: 1, height: 1, padding: 0, border: 0, opacity: 0, pointerEvents: 'none' }} />
            <input type="password" name="password" autoComplete="current-password" value={passcode} placeholder="Admin passcode" onChange={e => setPasscode(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${BORDER}`, borderRadius: 3, fontFamily: SANS, fontSize: 15, background: CREAM, outline: 'none' }} />
            {error && <div style={{ color: '#B23A2E', fontSize: 13, marginTop: 10 }}>{error}</div>}
            <button type="submit" disabled={busy} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: 3, background: NAVY, color: '#fff', fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>{busy ? 'Loading…' : 'Open'}</button>
          </form>
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
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>{data.months.length ? `${lab(data.months[0])} – ${lab(data.months[data.months.length-1])}` : ''} · $50/mo · click a name to see their payments · hover a ✓ for payment details</div>
        <div style={{ fontSize: 13, color: NAVY, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span>Collected: <b>${paidThisYear.toLocaleString()}</b> · {data.members.length} members</span>
          <div style={{ display: 'inline-flex', border: `1px solid ${BORDER}`, borderRadius: 3, overflow: 'hidden' }}>
            <button onClick={() => switchYear(0)} disabled={busy} style={{ padding: '6px 12px', border: 'none', background: yearOffset === 0 ? NAVY : '#fff', color: yearOffset === 0 ? '#fff' : NAVY, fontFamily: SANS, fontSize: 12, fontWeight: 500, cursor: busy ? 'default' : 'pointer' }}>This year</button>
            <button onClick={() => switchYear(-1)} disabled={busy} style={{ padding: '6px 12px', border: 'none', borderLeft: `1px solid ${BORDER}`, background: yearOffset === -1 ? NAVY : '#fff', color: yearOffset === -1 ? '#fff' : NAVY, fontFamily: SANS, fontSize: 12, fontWeight: 500, cursor: busy ? 'default' : 'pointer' }}>Past year</button>
          </div>
          {yearOffset === 0 && <button onClick={autofill} disabled={busy} style={{ padding: '6px 14px', border: `1px solid ${GOLD}`, borderRadius: 3, background: busy ? '#f0ebe0' : '#fff', color: NAVY, fontWeight: 500, fontFamily: SANS, fontSize: 12, cursor: busy ? 'default' : 'pointer' }}>{busy ? 'Matching…' : '↻ Autofill from Sola / Donors Fund / Zelle'}</button>}
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: MUTED, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 17, height: 17, background: '#dcecd5', color: '#2e7d32', border: `1px solid #2e7d3255`, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>✓</span> confirmed (real Sola/DF payment)</span>
          <span style={{ fontSize: 12, color: MUTED, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 17, height: 17, background: '#fbf1d1', color: '#a67f18', border: `1px solid #a67f1855`, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>✓</span> suggested (unconfirmed)</span>
          <span style={{ fontSize: 12, color: MUTED, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ fontSize: 10, background: '#e4efe0', color: '#2e7d32', border: '1px solid #cfe4c6', borderRadius: 10, padding: '1px 7px', fontWeight: 500 }}>✓ vote</span> eligible to vote (paid through June)</span>
        </div>
        {error && <div style={{ color: '#B23A2E', fontSize: 13, marginBottom: 8 }}>{error}</div>}

        <div style={{ overflowX: 'auto', border: `1px solid ${BORDER}`, borderRadius: 8, background: '#fff', boxShadow: '0 1px 4px rgba(30,45,78,0.07)' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%', minWidth: 780 }}>
            <thead><tr>
              <th style={{ position: 'sticky', left: 0, zIndex: 2, background: NAVY, color: '#fff', padding: '10px 14px', textAlign: 'left', fontWeight: 500, letterSpacing: 0.3, minWidth: 158 }}>Member</th>
              {data.months.map(ym => <th key={ym} style={{ padding: '10px 4px', background: NAVY, color: '#e9e2cf', fontWeight: 500, minWidth: 40, textAlign: 'center', borderLeft: '1px solid #2c3c60' }}>{lab(ym)}</th>)}
              <th style={{ padding: '10px 10px', background: NAVY, color: GOLD, fontWeight: 600, textAlign: 'center', minWidth: 54, borderLeft: '1px solid #2c3c60' }}>Paid</th>
            </tr></thead>
            <tbody>
              {data.members.map((m, ri) => {
                const isSel = sel && sel.id === m.id
                const rowBg = isSel ? '#fbf5e4' : ri % 2 ? '#faf8f2' : '#fff'
                const activeYm = m.active_from ? String(m.active_from).slice(0, 7) : null
                const owed = data.months.filter(ym => !activeYm || ym >= activeYm).length
                const paidCount = data.months.filter(ym => am[key(m.id, ym)]).length
                return (
                  <tr key={m.id} style={{ background: rowBg }}>
                    <td onClick={() => pickMember(m)} style={{ position: 'sticky', left: 0, zIndex: 1, background: rowBg, padding: '8px 14px', borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', cursor: 'pointer', color: NAVY, fontWeight: isSel ? 600 : 500, fontSize: 13, borderLeft: isSel ? `3px solid ${GOLD}` : '3px solid transparent' }}>{m.recurring ? <span title="recurring member" style={{ color: GOLD, marginRight: 6, fontSize: 9 }}>●</span> : null}{m.name}{m.eligible ? <span title="Up to date — eligible to vote" style={{ marginLeft: 7, fontSize: 10, background: '#e4efe0', color: '#2e7d32', border: '1px solid #cfe4c6', borderRadius: 10, padding: '1px 7px', fontWeight: 500, verticalAlign: 'middle' }}>✓ vote</span> : null}</td>
                    {data.months.map(ym => {
                      const preMove = activeYm && ym < activeYm
                      if (preMove) return <td key={ym} title={'Not a member yet — moved in ' + lab(activeYm)} style={{ textAlign: 'center', padding: '8px 2px', borderBottom: `1px solid ${BORDER}`, borderLeft: '1px solid #eee7d7', background: 'repeating-linear-gradient(-45deg,#f2efe8,#f2efe8 3px,#e9e5db 3px,#e9e5db 6px)', color: '#c4bdac', fontSize: 11 }}></td>
                      const a = am[key(m.id, ym)]
                      const sug = a && a.status === 'suggested'
                      return <td key={ym} title={a ? ((a.note || a.source || 'paid') + (sug ? '  ⟶  suggested (unconfirmed)' : '')) : 'no payment recorded'} style={{ textAlign: 'center', padding: '8px 2px', borderBottom: `1px solid ${BORDER}`, borderLeft: '1px solid #eee7d7', background: sug ? '#fbf1d1' : a ? '#dcecd5' : 'transparent', color: sug ? '#a67f18' : a ? '#2e7d32' : '#dcd6c8', fontWeight: 700, fontSize: 14 }}>{a ? '✓' : '·'}</td>
                    })}
                    <td style={{ textAlign: 'center', padding: '8px', borderBottom: `1px solid ${BORDER}`, borderLeft: `1px solid ${BORDER}`, background: rowBg, fontWeight: 600, fontSize: 12, color: paidCount >= owed ? '#2e7d32' : paidCount > 0 ? NAVY : '#c4bdac' }}>{paidCount}/{owed}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot><tr>
              <td style={{ position: 'sticky', left: 0, zIndex: 1, background: '#f0ebe0', padding: '9px 14px', fontWeight: 600, color: NAVY, borderTop: `2px solid ${GOLD}` }}>Total paid</td>
              {data.months.map(ym => { const n = data.members.filter(m => am[key(m.id, ym)]).length; return <td key={ym} style={{ textAlign: 'center', padding: '9px 2px', fontWeight: 600, color: MUTED, borderTop: `2px solid ${GOLD}`, fontSize: 11, background: '#f0ebe0' }}>{n || ''}</td> })}
              <td style={{ textAlign: 'center', padding: '9px 8px', fontWeight: 700, color: NAVY, borderTop: `2px solid ${GOLD}`, fontSize: 12, background: '#f0ebe0' }}>${paidThisYear.toLocaleString()}</td>
            </tr></tfoot>
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
                <tfoot>
                  {(() => {
                    const byType = {}; payments.forEach(p => { byType[p.source] = (byType[p.source] || 0) + Number(p.amount) })
                    const total = payments.reduce((s, p) => s + Number(p.amount), 0)
                    return (
                      <tr style={{ borderTop: `2px solid ${GOLD}` }}>
                        <td colSpan={2} style={{ padding: '9px 8px 4px 0', fontSize: 12, color: MUTED }}>
                          {Object.entries(byType).map(([k, v]) => `${k}: $${v.toLocaleString()}`).join('   ·   ')}
                        </td>
                        <td style={{ padding: '9px 8px 4px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap' }}>${total.toLocaleString()}</td>
                        <td style={{ padding: '9px 0 4px', fontSize: 12, color: MUTED }}>total received</td>
                      </tr>
                    )
                  })()}
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  )
}
