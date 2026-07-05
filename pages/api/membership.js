// Membership tracker API (passcode-gated). Grid + per-member payment lookup + save decisions.
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE
const MONTHS = ['2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01','2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01','2026-07-01']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, action } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    if (action === 'load') {
      const { data: members } = await supabaseAdmin.from('books_members').select('id,name,monthly_rate,recurring').order('name')
      const { data: allocs } = await supabaseAdmin.from('books_membership').select('member_id,month,amount,source,note,status')
      const allocations = (allocs || []).map(a => ({ member_id: a.member_id, ym: String(a.month).slice(0, 7), amount: a.amount, source: a.source, note: a.note, status: a.status }))
      return res.status(200).json({ months: MONTHS.map(m => m.slice(0, 7)), members: members || [], allocations })
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

    return res.status(400).json({ error: 'Unknown action.' })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Request failed.' })
  }
}
