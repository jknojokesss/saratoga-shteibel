// Board-ready, one-page PDF of the Statement of Activities (every transaction itemized).
import { loadLedger, filterPeriod, periodLabel, aggregate } from './books-report'
import { buildBoardPdf } from '../../lib/boardPdf'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, year, month, startDate, endDate } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    const all = await loadLedger()
    const period = month ? { month } : startDate && endDate ? { startDate, endDate } : { year }
    const { income, expenses, totalIncome, totalExpense, net } = aggregate(filterPeriod(all, period), true)
    const { pdf } = await buildBoardPdf({ label: periodLabel(period), income, expenses, totalIncome, totalExpense, net })

    const filename = `saratoga-shteibel-${String(month || year || 'report').replace(/\s/g, '-')}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.status(200).send(pdf)
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to generate PDF.' })
  }
}
