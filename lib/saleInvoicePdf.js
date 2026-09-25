import PDFDocument from 'pdfkit'
import path from 'path'
import { buyerTotals } from './loadYkSales'
import { paymentInstructionLines } from './ykPaymentInfo'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', GOLD_DK = '#a8862f', MUTED = '#6b6b6b', INK = '#141414', HAIR = '#d6d6d6'
const PAGE_W = 612, M = 48, W = PAGE_W - 2 * M
const FONT_DIR = path.join(process.cwd(), 'lib', 'fonts')

const money = (n) => {
  if (n == null || Number.isNaN(Number(n))) return '—'
  const x = Number(n)
  return (x < 0 ? '-$' : '$') + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const lineAmount = (it) => {
  const p = it.price
  if (p == null || p === '') return '—'
  return money(Number(it.qty || 1) * Number(p))
}

function registerFonts(doc) {
  const f = (name) => path.join(FONT_DIR, name)
  doc.registerFont('Sans', f('jost-latin-400-normal.woff'))
  doc.registerFont('SansMedium', f('jost-latin-500-normal.woff'))
  doc.registerFont('SansSemi', f('jost-latin-600-normal.woff'))
  doc.registerFont('Serif', f('cormorant-garamond-latin-600-normal.woff'))
}

export function buildSaleInvoicePdf({ data, buyer }) {
  const { subtotal, paid, balance } = buyerTotals(buyer)
  const items = buyer.items || []
  const invDate = data.invoiceDate
    ? new Date(data.invoiceDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const doc = new PDFDocument({ size: 'LETTER', margins: { top: M, left: M, right: M, bottom: M } })
  const chunks = []
  doc.on('data', (c) => chunks.push(c))
  const finished = new Promise((resolve) => doc.on('end', resolve))
  registerFonts(doc)

  doc.rect(0, 0, PAGE_W, 7).fill(NAVY)
  doc.rect(M, 0, 46, 7).fill(GOLD)
  doc.font('Serif').fontSize(26).fillColor(NAVY).text('Saratoga Shteibel', M, 28)
  doc.font('SansMedium').fontSize(7.5).fillColor(GOLD_DK).text('INVOICE', M, 58, { characterSpacing: 2.2 })
  doc.font('Serif').fontSize(20).fillColor(NAVY).text(String(data.title || 'Yom Kippur'), M, 32, { width: W, align: 'right' })
  doc.font('Sans').fontSize(9).fillColor(MUTED).text('166 Woodleigh Place · Toms River, NJ 08755', M, 56, { width: W, align: 'right' })
  doc.moveTo(M, 88).lineTo(PAGE_W - M, 88).lineWidth(0.75).strokeColor(NAVY).stroke()

  let y = 104
  doc.font('SansMedium').fontSize(8).fillColor(MUTED).text('BILL TO', M, y, { characterSpacing: 1.2 })
  y += 14
  doc.font('Serif').fontSize(22).fillColor(NAVY).text(String(buyer.name || ''), M, y)
  y += 32
  doc.font('Sans').fontSize(9).fillColor(MUTED).text(`Invoice date: ${invDate}`, M, y)
  y += 28

  const colDesc = M
  const colAmt = PAGE_W - M - 72
  doc.font('SansSemi').fontSize(8).fillColor(NAVY).text('DESCRIPTION', colDesc, y, { characterSpacing: 1 })
  doc.text('AMOUNT', colAmt, y, { width: 72, align: 'right' })
  y += 12
  doc.moveTo(M, y).lineTo(PAGE_W - M, y).lineWidth(1).strokeColor(NAVY).stroke()
  y += 10

  items.forEach((it) => {
    const desc = [it.service, it.honor].filter(Boolean).join(' · ')
    doc.font('SansMedium').fontSize(10).fillColor(INK).text(desc || 'Honor', colDesc, y, { width: colAmt - colDesc - 12 })
    doc.font('Sans').fontSize(10).fillColor(INK).text(lineAmount(it), colAmt, y, { width: 72, align: 'right' })
    y += 22
    doc.moveTo(M, y - 4).lineTo(PAGE_W - M, y - 4).lineWidth(0.25).strokeColor(HAIR).stroke()
  })

  y += 16
  const summaryX = PAGE_W - M - 220
  const valX = PAGE_W - M - 72
  const row = (label, val, bold) => {
    doc.font(bold ? 'SansSemi' : 'Sans').fontSize(bold ? 11 : 10).fillColor(bold ? NAVY : INK)
    doc.text(label, summaryX, y, { width: 140 })
    doc.text(val, valX, y, { width: 72, align: 'right' })
    y += bold ? 22 : 18
  }
  row('Subtotal', money(subtotal), false)
  row('Amount paid', money(paid), false)
  doc.moveTo(summaryX, y - 4).lineTo(PAGE_W - M, y - 4).lineWidth(1).strokeColor(NAVY).stroke()
  y += 6
  row('Balance due', money(balance), true)

  y += 20
  doc.font('Sans').fontSize(9).fillColor(MUTED)
  if (balance <= 0) {
    doc.text('Thank you for your support of the Shteibel.', M, y, { width: W, lineGap: 3 })
  } else {
    doc.text('Please remit the balance due at your earliest convenience.', M, y, { width: W, lineGap: 3 })
    y += 28
    doc.font('SansMedium').fontSize(9).fillColor(NAVY).text('How to pay', M, y, { characterSpacing: 0.8 })
    y += 14
    doc.font('Sans').fontSize(9).fillColor(MUTED)
    paymentInstructionLines.forEach((line) => {
      doc.text(line, M, y, { width: W, lineGap: 2 })
      y += 14
    })
  }

  doc.end()
  return finished.then(() => ({ pdf: Buffer.concat(chunks) }))
}
