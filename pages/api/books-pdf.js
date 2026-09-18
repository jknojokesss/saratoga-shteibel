// Board-ready PDF export of the Statement of Activities for a given period.
import PDFDocument from 'pdfkit'
import { loadLedger, filterPeriod, periodLabel, aggregate } from './books-report'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE
const NAVY = '#1e2d4e', GOLD = '#c9a84c', MUTED = '#7a7068', GREEN = '#2e7d32', RUST = '#b2543a'
const usd = (n) => (n < 0 ? '-$' : '$') + Math.abs(Number(n)).toLocaleString(undefined, { maximumFractionDigits: 0 })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, year, month, startDate, endDate } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    const all = await loadLedger()
    const period = month ? { month } : startDate && endDate ? { startDate, endDate } : { year }
    const rows = filterPeriod(all, period)
    const { income, expenses, totalIncome, totalExpense, net } = aggregate(rows)
    const label = periodLabel(period)

    const doc = new PDFDocument({ size: 'LETTER', margin: 50 })
    const chunks = []
    doc.on('data', (c) => chunks.push(c))
    const done = new Promise((resolve) => doc.on('end', resolve))

    doc.font('Helvetica-Bold').fontSize(20).fillColor(NAVY).text('Saratoga Shteibel', { align: 'center' })
    doc.font('Helvetica').fontSize(11).fillColor(MUTED).text('STATEMENT OF ACTIVITIES', { align: 'center' })
    doc.fontSize(13).fillColor(NAVY).text(label, { align: 'center' })
    doc.moveDown(1)

    // summary strip
    const boxY = doc.y
    const boxW = (doc.page.width - 100 - 20) / 3
    const summaryBoxes = [
      { k: 'Total income', v: totalIncome, c: GREEN },
      { k: 'Total expenses', v: totalExpense, c: RUST },
      { k: net >= 0 ? 'Surplus' : 'Deficit', v: net, c: net >= 0 ? NAVY : RUST },
    ]
    summaryBoxes.forEach((b, i) => {
      const x = 50 + i * (boxW + 10)
      doc.rect(x, boxY, boxW, 54).strokeColor('#ddd5c4').lineWidth(1).stroke()
      doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(b.k.toUpperCase(), x + 10, boxY + 8)
      doc.font('Helvetica-Bold').fontSize(18).fillColor(b.c).text(usd(b.v), x + 10, boxY + 22)
    })
    doc.y = boxY + 54 + 20

    const table = (title, list, total, color) => {
      doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY).text(title)
      doc.moveDown(0.3)
      list.forEach((row) => {
        const y = doc.y
        doc.font('Helvetica').fontSize(10).fillColor('#2a2a2a').text(`${row.label} (${row.n})`, 50, y, { width: 350 })
        doc.font('Helvetica-Bold').fontSize(10).fillColor(color).text(usd(row.total), 420, y, { width: 130, align: 'right' })
        doc.moveDown(0.35)
      })
      doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).strokeColor(GOLD).lineWidth(1.5).stroke()
      doc.moveDown(0.4)
      doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text(`Total ${title.toLowerCase()}`, 50, doc.y, { width: 350, continued: false })
      doc.font('Helvetica-Bold').fontSize(11).fillColor(color).text(usd(total), 420, doc.y - doc.currentLineHeight(), { width: 130, align: 'right' })
      doc.moveDown(1.2)
    }

    table('Income', income, totalIncome, GREEN)
    if (doc.y > 620) doc.addPage()
    table('Expenses', expenses, totalExpense, RUST)

    doc.fontSize(8).fillColor(MUTED).text(`Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · every figure ties to the bank statement`, 50, doc.page.height - 60, { align: 'center', width: 500 })

    doc.end()
    await done
    const pdf = Buffer.concat(chunks)

    const filename = `saratoga-shteibel-${(month || year || 'report').replace(/\s/g, '-')}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.status(200).send(pdf)
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to generate PDF.' })
  }
}
