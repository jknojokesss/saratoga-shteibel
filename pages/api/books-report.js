// Live financial report (Statement of Activities) from books_ledger. Passcode-gated.
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

// Pull the WHOLE ledger — Supabase caps a request at 1000 rows, so page through
// until we've got them all. Silent truncation here would understate the totals.
async function loadLedger() {
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
  return all
}

// Rows within a period: either a specific month (YYYY-MM) or a full calendar year.
// A month always wins over a year if both are given.
function filterPeriod(all, { year, month, startDate, endDate }) {
  if (startDate && endDate) return all.filter(r => r.txn_date >= startDate && r.txn_date <= endDate)
  if (month) return all.filter(r => String(r.txn_date).slice(0, 7) === String(month))
  return all.filter(r => String(r.txn_date).slice(0, 4) === String(year))
}

function periodLabel({ year, month, startDate, endDate }) {
  const MON = { '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June', '07': 'July', '08': 'August', '09': 'September', '10': 'October', '11': 'November', '12': 'December' }
  if (startDate && endDate) return `${startDate} – ${endDate}`
  if (month) return `${MON[String(month).slice(5, 7)]} ${String(month).slice(0, 4)}`
  return `${year} (full calendar year)`
}

function aggregate(rows) {
  const agg = (sign) => {
    const map = {}
    rows.filter(r => (sign > 0 ? Number(r.amount) > 0 : Number(r.amount) < 0)).forEach(r => {
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
  return { income, expenses, totalIncome, totalExpense, net: Math.round((totalIncome + totalExpense) * 100) / 100 }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, action, year, month, startDate, endDate } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    const all = await loadLedger()
    const years = [...new Set(all.map(r => String(r.txn_date).slice(0, 4)))].sort().reverse()
    const months = [...new Set(all.map(r => String(r.txn_date).slice(0, 7)))].sort().reverse()

    if (action === 'months') {
      return res.status(200).json({ years, months })
    }

    if (action === 'summary') {
      const period = month ? { month } : startDate && endDate ? { startDate, endDate } : { year: year || years[0] }
      const inPeriod = filterPeriod(all, period)
      const lastDate = inPeriod.reduce((mx, r) => (r.txn_date > mx ? r.txn_date : mx), '')
      const { income, expenses, totalIncome, totalExpense, net } = aggregate(inPeriod)
      const displayYear = String(period.year || period.month?.slice(0, 4) || period.startDate?.slice(0, 4) || '')
      return res.status(200).json({
        years, months, year: displayYear, month: period.month || null,
        startDate: period.startDate || null, endDate: period.endDate || null,
        label: periodLabel(period), lastDate,
        income, expenses, totalIncome, totalExpense, net,
      })
    }

    if (action === 'detail') {
      const { category, subcategory } = req.body
      const period = month ? { month } : startDate && endDate ? { startDate, endDate } : { year: year || years[0] }
      const list = filterPeriod(all, period)
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

export { loadLedger, filterPeriod, periodLabel, aggregate }
