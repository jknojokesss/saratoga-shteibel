// Membership tracker API (passcode-gated). Grid + per-member payment lookup + save decisions.
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

// Membership year runs Aug–Jul. Computed from today so it never needs a manual
// yearly update — Sep 2026 correctly shows Aug 2026–Jul 2027, not last year's range.
// yearOffset 0 = current membership year, -1 = the year before it, etc.
function monthsForYear(yearOffset = 0) {
  const now = new Date()
  const startYear = (now.getUTCMonth() >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1) + yearOffset
  const out = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(startYear, 7 + i, 1)) // month 7 = August
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, action, yearOffset } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    if (action === 'load') {
      const { data: members } = await supabaseAdmin.from('books_members').select('id,name,monthly_rate,recurring,active_from,vote_excluded').order('name')
      const { data: allocs } = await supabaseAdmin.from('books_membership').select('member_id,month,amount,source,note,status')
      const allocations = (allocs || []).map(a => ({ member_id: a.member_id, ym: String(a.month).slice(0, 7), amount: a.amount, source: a.source, note: a.note, status: a.status }))

      // Voting eligibility = who's on the actual voter roster (shul_vote_codes) — the
      // single source of truth, so manual exceptions show correctly on the chart too.
      const monthsYm = monthsForYear(yearOffset || 0).map(m => m.slice(0, 7))
      const { data: voterRows } = await supabaseAdmin.from('shul_vote_codes').select('member_id')
      const voterIds = new Set((voterRows || []).map(v => v.member_id))
      const enriched = (members || []).map(m => ({ ...m, eligible: voterIds.has(m.id) }))
      return res.status(200).json({ months: monthsYm, members: enriched, allocations })
    }

    if (action === 'memberPayments') {
      const { member_id } = req.body
      const { data: al } = await supabaseAdmin.from('books_member_aliases').select('alias').eq('member_id', member_id)
      const aliases = (al || []).map(a => a.alias)
      if (aliases.length === 0) return res.status(200).json({ payments: [] })
      const payments = []
      // Sola (approved) by cardholder alias
      const { data: sola } = await supabaseAdmin.from('books_sola').select('txn_date,amount,description,cardholder_name,result,ref_num').eq('result', 'Approved')
      ;(sola || []).forEach(s => { if (s.cardholder_name && aliases.includes(s.cardholder_name.trim().toLowerCase())) payments.push({ source: 'Sola', date: s.txn_date, amount: s.amount, note: s.description, ref: s.ref_num }) })
      // Donors Fund grants by shared_name alias
      const { data: df } = await supabaseAdmin.from('books_donorsfund').select('txn_date,amount,memo,shared_name,shared_fund_name,transaction_type,confirmation_number').eq('transaction_type', 'Grant')
      ;(df || []).forEach(d => { const nm = (d.shared_name || '').trim().toLowerCase(); if (nm && aliases.includes(nm)) payments.push({ source: 'Donors Fund', date: d.txn_date, amount: d.amount, note: d.memo || d.shared_fund_name, ref: d.confirmation_number }) })
      // Chase Zelle (in) by name contained in description
      const { data: zelle } = await supabaseAdmin.from('books_chase').select('posting_date,amount,description,type').in('type', ['QUICKPAY_CREDIT', 'PARTNERFI_TO_CHASE'])
      ;(zelle || []).forEach(z => { const desc = (z.description || '').toLowerCase(); if (aliases.some(a => a.length > 4 && desc.includes(a))) payments.push({ source: 'Zelle', date: z.posting_date, amount: z.amount, note: z.description, ref: null }) })
      payments.sort((a, b) => (a.date < b.date ? -1 : 1))
      return res.status(200).json({ payments })
    }

    if (action === 'toggle') {
      const { member_id, ym, on, amount, source, note } = req.body
      const month = ym + '-01'
      if (on) {
        const { error } = await supabaseAdmin.from('books_membership').upsert({ member_id, month, amount: amount || 50, source: source || 'manual', note: note || null, status: 'confirmed' }, { onConflict: 'member_id,month' })
        if (error) throw error
      } else {
        const { error } = await supabaseAdmin.from('books_membership').delete().eq('member_id', member_id).eq('month', month)
        if (error) throw error
      }
      return res.status(200).json({ ok: true })
    }

    if (action === 'addMember') {
      const { name } = req.body
      if (!name || !name.trim()) return res.status(400).json({ error: 'Name required.' })
      const { data, error } = await supabaseAdmin.from('books_members').insert({ name: name.trim() }).select('id').single()
      if (error) throw error
      await supabaseAdmin.from('books_member_aliases').insert({ member_id: data.id, alias: name.trim().toLowerCase() })
      return res.status(200).json({ ok: true, id: data.id })
    }

    if (action === 'autofill') {
      const { data: aliasRows } = await supabaseAdmin.from('books_member_aliases').select('member_id,alias')
      const aliasByMember = {}, exactAlias = {}
      ;(aliasRows || []).forEach(r => { (aliasByMember[r.member_id] = aliasByMember[r.member_id] || []).push(r.alias); exactAlias[r.alias] = r.member_id })

      const cands = []
      const { data: sola } = await supabaseAdmin.from('books_sola').select('txn_date,amount,description,cardholder_name,ref_num').eq('result', 'Approved')
      ;(sola || []).forEach(s => { const mid = exactAlias[(s.cardholder_name || '').trim().toLowerCase()]; if (mid) cands.push({ member_id: mid, date: s.txn_date, amount: Number(s.amount), source: 'sola', ref: s.ref_num, note: s.description, labeled: /member/i.test(s.description || '') }) })
      const { data: df } = await supabaseAdmin.from('books_donorsfund').select('txn_date,amount,memo,shared_name,shared_fund_name,confirmation_number').eq('transaction_type', 'Grant')
      ;(df || []).forEach(d => { const mid = exactAlias[(d.shared_name || '').trim().toLowerCase()]; if (mid) cands.push({ member_id: mid, date: d.txn_date, amount: Number(d.amount), source: 'donorsfund', ref: d.confirmation_number, note: d.memo || d.shared_fund_name, labeled: /member/i.test(d.memo || '') }) })
      const { data: zelle } = await supabaseAdmin.from('books_chase').select('posting_date,amount,description').in('type', ['QUICKPAY_CREDIT', 'PARTNERFI_TO_CHASE'])
      ;(zelle || []).forEach(z => { const desc = (z.description || '').toLowerCase(); for (const mid in aliasByMember) { if (aliasByMember[mid].some(a => a.length > 4 && desc.includes(a))) { cands.push({ member_id: Number(mid), date: z.posting_date, amount: Number(z.amount), source: 'zelle', ref: null, note: z.description, labeled: false }); break } } })

      // Autofill always targets the current membership year, regardless of which year is on screen.
      const currentYearMonths = monthsForYear(0)
      const months = currentYearMonths.map(m => m.slice(0, 7))
      const idx = (ym) => months.indexOf(ym)
      const yearStart = currentYearMonths[0]
      const plausible = cands.filter(c => c.date >= yearStart && c.amount >= 50 && c.amount % 50 === 0 && (c.labeled ? c.amount <= 600 : c.amount <= 300))
        .sort((a, b) => (a.date < b.date ? -1 : 1))

      const { data: existing } = await supabaseAdmin.from('books_membership').select('member_id,month,status')
      const taken = {}
      ;(existing || []).filter(a => a.status === 'confirmed').forEach(a => { (taken[a.member_id] = taken[a.member_id] || new Set()).add(String(a.month).slice(0, 7)) })
      await supabaseAdmin.from('books_membership').delete().eq('status', 'suggested')

      const rows = []
      plausible.forEach(c => {
        let n = Math.min(Math.round(c.amount / 50), 12)
        let start = idx(c.date.slice(0, 7)); if (start < 0) start = 0
        const t = (taken[c.member_id] = taken[c.member_id] || new Set())
        for (let i = start; i < months.length && n > 0; i++) {
          const ym = months[i]; if (t.has(ym)) continue
          t.add(ym); n--
          rows.push({ member_id: c.member_id, month: ym + '-01', amount: 50, source: c.source, source_ref: c.ref ? String(c.ref) : null, note: (c.labeled ? '[membership] ' : '') + (c.note || '').slice(0, 70), status: c.labeled ? 'confirmed' : 'suggested' })
        }
      })
      if (rows.length) await supabaseAdmin.from('books_membership').upsert(rows, { onConflict: 'member_id,month', ignoreDuplicates: true })
      return res.status(200).json({ ok: true, added: rows.length, confirmed: rows.filter(r => r.status === 'confirmed').length, suggested: rows.filter(r => r.status === 'suggested').length })
    }

    return res.status(400).json({ error: 'Unknown action.' })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Request failed.' })
  }
}
