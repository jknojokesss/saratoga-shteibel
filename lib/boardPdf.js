import PDFDocument from 'pdfkit'
import path from 'path'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', GOLD_DK = '#a8862f', MUTED = '#7a7068', GREEN = '#2e7d32', RUST = '#b2543a', INK = '#2a2a2a'
const TINT = '#f4eee1', ZEBRA = '#faf8f2', HAIR = '#e6dfcf'
const PAGE_W = 612, PAGE_H = 792, M = 40, GAP = 20
const COL_W = (PAGE_W - 2 * M - GAP) / 2
const RULE_Y = 78, SUM_Y = 90, SUM_H = 54, START_Y = 158
const BOTTOM = PAGE_H - 46
const PAD = 7

const FONT_DIR = path.join(process.cwd(), 'lib', 'fonts')

const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const shortDate = (d) => Number(String(d).slice(5, 7)) + '/' + Number(String(d).slice(8, 10))
const titleCase = (s) => s.toLowerCase().replace(/(^|[\s(&-])([a-z])/g, (m, p, c) => p + c.toUpperCase())
// The bundled fonts are Latin only; drop anything else (e.g. Hebrew dedications) instead of printing boxes.
const clean = (s) => String(s).replace(/[^ -~ -ÿ‐-‧™]/g, ' ').replace(/\s+/g, ' ').trim()

function labelRaw(it) {
  const full = String(it.description || '')
  const memo = (full.match(/\[memo: ([^\]]*)\]/) || [])[1]
  const raw = full.replace(/\s*\[[^\]]*\]/g, '').trim()
  let who = String(it.who || '').trim()
  if (who && who === who.toUpperCase()) who = titleCase(who)
  if (/CO ENTRY DESCR:\s*DISCOUNT/i.test(raw)) return 'Card processing - discount fee'
  if (/CO ENTRY DESCR:\s*FEE/i.test(raw)) return 'Card processing - per-transaction fee'
  if (who) {
    const note = raw
      .replace(/^Donation:\s*/i, '')
      .replace(/\s*-\s*Kiddush is sponsored by.*$/i, '')
      .replace(/^Kiddush Sponsorship\s*/i, '')
      .replace(/^Kiddush for\s+/i, '')
      .replace(/^\((.*)\)$/, '$1')
      .trim()
    let base
    if (/^Zelle payment/i.test(note)) base = who + ' (Zelle)'
    else if (!note || /^Schedule:/i.test(note) || /^Monthly Membership/i.test(note) || /^Membership$/i.test(note)) base = who
    else base = who + ' - ' + note
    return memo ? base + ' - ' + memo : base
  }
  // card-merchant charges with no counterparty: tidy the bank-feed text
  const cleaned = raw
    .replace(/`/g, "'")
    .replace(/\d{3}-\d{3}-\d{4}/g, '')
    .replace(/\s+\d{2}\/\d{2}\s*$/, '')
    .replace(/\s+(NJ|NY|PA|FL|CT)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(\b[A-Z][A-Z ]{2,}?)\s+\1$/, '$1')
  return titleCase(cleaned)
}

// Short human label for a ledger row.
export const rowLabel = (it) => clean(labelRaw(it)) || 'Transaction'

function fitText(doc, str, maxW) {
  if (doc.widthOfString(str) <= maxW) return str
  let s = str
  while (s.length > 1 && doc.widthOfString(s + '…') > maxW) s = s.slice(0, -1)
  return s.trimEnd() + '…'
}

const geo = (fs) => ({ row: fs * 1.36, band: fs * 1.85, bandGap: fs * 0.5, titleH: 28, totalH: (fs + 6) * 1.25 + 12 })

function colHeight(cats, fs, collapsed) {
  const g = geo(fs)
  return g.titleH + cats.reduce((h, c) => h + g.bandGap + g.band + (collapsed.has(c.label) ? g.row : c.items.length * g.row), 0) + g.totalH
}

// Largest type size (down to 5.5pt) at which both columns fit; if none fits, collapse the
// biggest category to a single line and try again.
function plan(income, expenses) {
  const collapsed = new Set()
  const avail = BOTTOM - START_Y
  for (;;) {
    for (let fs = 9; fs >= 5.5; fs -= 0.25) {
      if (Math.max(colHeight(income, fs, collapsed), colHeight(expenses, fs, collapsed)) <= avail) return { fs, collapsed }
    }
    const candidates = [...income, ...expenses].filter((c) => !collapsed.has(c.label) && c.items.length > 3)
    if (!candidates.length) return { fs: 5.5, collapsed }
    candidates.sort((a, b) => b.items.length - a.items.length)
    collapsed.add(candidates[0].label)
  }
}

function registerFonts(doc) {
  const f = (n) => path.join(FONT_DIR, n)
  doc.registerFont('Sans', f('jost-latin-400-normal.woff'))
  doc.registerFont('SansItalic', f('jost-latin-400-italic.woff'))
  doc.registerFont('SansMedium', f('jost-latin-500-normal.woff'))
  doc.registerFont('SansSemi', f('jost-latin-600-normal.woff'))
  doc.registerFont('Serif', f('cormorant-garamond-latin-600-normal.woff'))
  doc.registerFont('SerifItalic', f('cormorant-garamond-latin-600-italic.woff'))
}

export function buildBoardPdf({ label, income, expenses, totalIncome, totalExpense, net }) {
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: M, left: M, right: M, bottom: 0 }, bufferPages: true })
  const chunks = []
  doc.on('data', (c) => chunks.push(c))
  const finished = new Promise((resolve) => doc.on('end', resolve))
  registerFonts(doc)

  const { fs, collapsed } = plan(income, expenses)
  const g = geo(fs)
  const W = PAGE_W - 2 * M

  // masthead
  doc.rect(0, 0, PAGE_W, 7).fill(NAVY)
  doc.rect(M, 0, 46, 7).fill(GOLD)
  doc.font('Serif').fontSize(27).fillColor(NAVY).text('Saratoga Shteibel', M, 26, { lineBreak: false })
  doc.font('SansMedium').fontSize(7.5).fillColor(GOLD_DK).text('STATEMENT OF ACTIVITIES', M, 58, { characterSpacing: 2, lineBreak: false })
  doc.font('Serif').fontSize(23).fillColor(NAVY).text(String(label), M, 30, { width: W, align: 'right', lineBreak: false })
  doc.font('Sans').fontSize(8).fillColor(MUTED).text('Toms River, New Jersey', M, 58, { width: W, align: 'right', lineBreak: false })
  doc.moveTo(M, RULE_Y).lineTo(PAGE_W - M, RULE_Y).lineWidth(0.75).strokeColor(GOLD).stroke()

  // headline figures
  const cellW = W / 3
  const stats = [
    { k: 'Total income', v: money(totalIncome), c: GREEN },
    { k: 'Total expenses', v: money(Math.abs(totalExpense)), c: RUST },
    { k: net >= 0 ? 'Surplus' : 'Deficit', v: money(net), c: net >= 0 ? NAVY : RUST },
  ]
  doc.roundedRect(M + 2 * cellW + 4, SUM_Y, cellW - 4, SUM_H, 4).fill(TINT)
  stats.forEach((s, i) => {
    const x = M + i * cellW
    if (i > 0) doc.moveTo(x, SUM_Y + 4).lineTo(x, SUM_Y + SUM_H - 4).lineWidth(0.5).strokeColor(HAIR).stroke()
    doc.font('SansMedium').fontSize(7).fillColor(MUTED).text(s.k.toUpperCase(), x + 14, SUM_Y + 8, { characterSpacing: 1.3, lineBreak: false })
    doc.font('Serif').fontSize(25).fillColor(s.c).text(s.v, x + 14, SUM_Y + 17, { lineBreak: false })
  })

  const drawColumn = (x, title, cats, total, color, absolute) => {
    let y = START_Y
    const amtW = fs * 6.4, dateW = fs * 3.4
    const amt = (n) => money(absolute ? Math.abs(n) : n)
    const right = x + COL_W - PAD - amtW

    doc.font('Serif').fontSize(18).fillColor(NAVY).text(title, x, y - 2, { lineBreak: false })
    doc.moveTo(x, y + 22).lineTo(x + COL_W, y + 22).lineWidth(1).strokeColor(GOLD).stroke()
    y += g.titleH

    cats.forEach((c) => {
      y += g.bandGap
      doc.roundedRect(x, y, COL_W, g.band, 3).fill(TINT)
      doc.font('SansSemi').fontSize(fs + 0.5)
      const ty = y + (g.band - doc.currentLineHeight()) / 2
      const name = fitText(doc, c.label, COL_W - amtW - 44)
      doc.fillColor(NAVY).text(name, x + PAD, ty, { lineBreak: false })
      const nameW = doc.widthOfString(name)
      doc.font('Sans').fontSize(fs - 0.5).fillColor(MUTED).text(`   ${c.n}`, x + PAD + nameW, ty + 0.5, { lineBreak: false })
      doc.font('SansSemi').fontSize(fs + 0.5).fillColor(color).text(amt(c.total), right, ty, { width: amtW, align: 'right', lineBreak: false })
      y += g.band

      if (collapsed.has(c.label)) {
        doc.font('SansItalic').fontSize(fs).fillColor(MUTED)
        doc.text(`${c.n} transactions - itemization omitted to fit one page`, x + PAD, y + (g.row - doc.currentLineHeight()) / 2, { lineBreak: false })
        y += g.row
        return
      }
      c.items.forEach((it, i) => {
        if (i % 2) doc.rect(x, y, COL_W, g.row).fill(ZEBRA)
        doc.font('Sans').fontSize(fs)
        const ry = y + (g.row - doc.currentLineHeight()) / 2
        doc.fillColor(MUTED).text(shortDate(it.date), x + PAD, ry, { lineBreak: false })
        doc.fillColor(INK).text(fitText(doc, rowLabel(it), COL_W - dateW - amtW - PAD * 2 - 4), x + PAD + dateW, ry, { lineBreak: false })
        doc.text(amt(it.amount), right, ry, { width: amtW, align: 'right', lineBreak: false })
        y += g.row
      })
    })

    y += 5
    doc.moveTo(x, y).lineTo(x + COL_W, y).lineWidth(1).strokeColor(GOLD).stroke()
    y += 6
    doc.font('Serif').fontSize(fs + 6).fillColor(NAVY).text(`Total ${title.toLowerCase()}`, x + PAD, y, { lineBreak: false })
    doc.fillColor(color).text(amt(total), right - 30, y, { width: amtW + 30, align: 'right', lineBreak: false })
  }

  drawColumn(M, 'Income', income, totalIncome, GREEN, false)
  drawColumn(M + COL_W + GAP, 'Expenses', expenses, totalExpense, RUST, true)

  // footer
  const stamp = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  doc.moveTo(M, PAGE_H - 40).lineTo(PAGE_W - M, PAGE_H - 40).lineWidth(0.5).strokeColor(HAIR).stroke()
  doc.font('Sans').fontSize(7).fillColor(MUTED)
  doc.text('Every figure ties to the bank statement', M, PAGE_H - 32, { lineBreak: false })
  doc.text(`Generated ${stamp}`, M, PAGE_H - 32, { width: W, align: 'right', lineBreak: false })

  const pages = doc.bufferedPageRange().count
  doc.end()
  return finished.then(() => ({ pdf: Buffer.concat(chunks), pages, fontSize: fs, collapsed: [...collapsed] }))
}
