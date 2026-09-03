// Live financial report (Statement of Activities) from books_ledger. Passcode-gated.
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, action, year } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    // Pull the WHOLE ledger — Supabase caps a request at 1000 rows, so page through
    // until we've got them all (the ledger is ~1.5k). Silent truncation here would
    // understate the totals, so never rely on a single select.
    const all = []
    for (let from = 0; ; from += 1000) {
      const { data: page, error } = await supabaseAdmin
        .from('books_ledger')
        .select('txn_date, source, counterparty, description, amount, category, subcategory')
        .order('id', { ascending: true })
        .range(from, from + 999)
      if (error) throw error
      all.push(...(page || []))
      if (!page || page.length < 1000) break
    }
    const years = [...new Set(all.map(r => String(r.txn_date).slice(0, 4)))].sort().reverse()

    if (action === 'summary') {
      const yr = year || years[0]
      const inYear = all.filter(r => String(r.txn_date).slice(0, 4) === String(yr))
      const lastDate = inYear.reduce((mx, r) => (r.txn_date > mx ? r.txn_date : mx), '')

      const agg = (sign) => {
        const map = {}
        inYear.filter(r => (sign > 0 ? Number(r.amount) > 0 : Number(r.amount) < 0)).forEach(r => {
          const key = (r.category || 'Uncategorized') + (r.subcategory ? ' — ' + r.subcategory : '')
          if (!map[key]) map[key] = { label: key, category: r.category, subcategory: r.subcategory || null, n: 0, total: 0 }
          map[key].n++; map[key].total += Number(r.amount)
        })
        return Object.values(map).map(x => ({ ...x, total: Math.round(x.total * 100) / 100 }))
          .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
      }
      const income = agg(1)
      const expenses = agg(-1)
      const totalIncome = Math.round(income.reduce((s, x) => s + x.total, 0) * 100) / 100
      const totalExpense = Math.round(expenses.reduce((s, x) => s + x.total, 0) * 100) / 100
      return res.status(200).json({
        years, year: String(yr), lastDate,
        income, expenses, totalIncome, totalExpense,
        net: Math.round((totalIncome + totalExpense) * 100) / 100,
      })
    }

    if (action === 'detail') {
      const { category, subcategory } = req.body
      const yr = year || years[0]
      const list = all
        .filter(r => String(r.txn_date).slice(0, 4) === String(yr))
        .filter(r => (r.category || 'Uncategorized') === category && (r.subcategory || null) === (subcategory || null))
        .map(r => ({
          date: r.txn_date, source: r.source, who: r.counterparty,
          description: (r.description || '').replace(/\s*\[[^\]]*\]/g, ''),
          memo: (r.description || '').match(/\[memo: ([^\]]*)\]/)?.[1] || null,
          amount: Number(r.amount),
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1))
      return res.status(200).json({ list })
    }

    return res.status(400).json({ error: 'Unknown action.' })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Request failed.' })
  }
}
