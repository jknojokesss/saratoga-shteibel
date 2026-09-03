// Ledger review API (passcode-gated): list rows needing review, categorize, split.
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export const CATEGORIES = {
  income: [
    { cat: 'Membership', sub: null },
    { cat: 'Donations', sub: 'General' },
    { cat: 'Donations', sub: 'Kibbudim' },
    { cat: 'Donations', sub: 'Kiddush sponsorship' },
    { cat: 'Donations', sub: 'Designated' },
    { cat: 'Donations', sub: 'Appeals & gifts' },
    { cat: 'Donations', sub: 'Events' },
  ],
  expense: [
    { cat: 'Kiddush & food' }, { cat: 'Equipment & Judaica' }, { cat: 'Eruv' },
    { cat: 'Cleaning' }, { cat: 'Building & renovations' }, { cat: 'Repairs & maintenance' },
    { cat: 'Sefarim' }, { cat: 'Utilities' }, { cat: 'Events' }, { cat: 'Rabbinic gifts' },
    { cat: 'Reimbursements' }, { cat: 'Tzedaka pass-through' }, { cat: 'Processing fees' },
    { cat: 'Bank & government fees' }, { cat: 'Misc' },
  ],
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, action } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    if (action === 'list') {
      const { data: rows } = await supabaseAdmin
        .from('books_ledger')
        .select('id, txn_date, source, counterparty, description, amount')
        .eq('status', 'review')
        .order('amount', { ascending: true })
      const { count: total } = await supabaseAdmin.from('books_ledger').select('id', { count: 'exact', head: true })
      const { count: reviewLeft } = await supabaseAdmin.from('books_ledger').select('id', { count: 'exact', head: true }).eq('status', 'review')
      return res.status(200).json({ rows: rows || [], categories: CATEGORIES, stats: { total, reviewLeft } })
    }

    if (action === 'set') {
      const { id, category, subcategory } = req.body
      if (!id || !category) return res.status(400).json({ error: 'Missing id/category.' })
      const { error } = await supabaseAdmin.from('books_ledger')
        .update({ category, subcategory: subcategory || null, status: 'confirmed' }).eq('id', id)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    if (action === 'split') {
      // Split one row into parts that must sum to the original amount.
      const { id, parts } = req.body
      if (!id || !Array.isArray(parts) || parts.length < 2) return res.status(400).json({ error: 'Need 2+ parts.' })
      const { data: orig } = await supabaseAdmin.from('books_ledger').select('*').eq('id', id).single()
      if (!orig) return res.status(404).json({ error: 'Row not found.' })
      const sum = parts.reduce((s, p) => s + Number(p.amount), 0)
      if (Math.round(sum * 100) !== Math.round(Number(orig.amount) * 100)) {
        return res.status(400).json({ error: `Parts must add up to ${orig.amount}.` })
      }
      const [first, ...rest] = parts
      const { error: e1 } = await supabaseAdmin.from('books_ledger').update({
        amount: first.amount, category: first.category, subcategory: first.subcategory || null,
        status: 'confirmed', description: (orig.description || '') + ' [split]',
      }).eq('id', id)
      if (e1) throw e1
      const { error: e2 } = await supabaseAdmin.from('books_ledger').insert(rest.map(p => ({
        txn_date: orig.txn_date, source: orig.source, source_ref: orig.source_ref,
        counterparty: orig.counterparty, description: (orig.description || '') + ' [split]',
        amount: p.amount, category: p.category, subcategory: p.subcategory || null,
        status: 'confirmed', chase_line: orig.chase_line,
      })))
      if (e2) throw e2
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Unknown action.' })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Request failed.' })
  }
}
