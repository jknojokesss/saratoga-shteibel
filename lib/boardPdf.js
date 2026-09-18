import PDFDocument from 'pdfkit'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', MUTED = '#7a7068', GREEN = '#2e7d32', RUST = '#b2543a', INK = '#2a2a2a', LINE = '#ddd5c4'
const PAGE_W = 612, PAGE_H = 792, M = 36, GAP = 18
const COL_W = (PAGE_W - 2 * M - GAP) / 2
const START_Y = 132
const BOTTOM = PAGE_H - 44

const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const shortDate = (d) => Number(String(d).slice(5, 7)) + '/' + Number(String(d).slice(8, 10))
const titleCase = (s) => s.toLowerCase().replace(/(^|[\s(&-])([a-z])/g, (m, p, c) => p + c.toUpperCase())

// Turns a ledger row into a short human label. Bank-feed text for card merchants and
// processor fees is unreadable, so those get cleaned up or named.
export function rowLabel(it) {
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
  const cleaned = raw
    .replace(/\d{3}-\d{3}-\d{4}/g, '')
    .replace(/\s+\d{2}\/\d{2}\s*$/, '')
    .replace(/\s+(NJ|NY|PA|FL|CT)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(\b[A-Z][A-Z ]{2,}?)\s+\1$/, '$1')
  return titleCase(cleaned) || 'Transaction'
}

function fitText(doc, str, maxW) {
  if (doc.widthOfString(str) <= maxW) return str
  let s = str
  while (s.length > 1 && doc.widthOfString(s + '…') > maxW) s = s.slice(0, -1)
  return s.trimEnd() + '…'
}

const geo = (fs) => ({ row: fs * 1.32, catH: fs * 1.32 + 4, catGap: fs * 0.55, totalH: fs * 1.5 + 10, titleH: 18 })

function colHeight(cats, fs, collapsed) {
  const g = geo(fs)
  return g.titleH + cats.reduce((h, c) => h + g.catGap + g.catH + (collapsed.has(c.label) ? g.row : c.items.length * g.row), 0) + g.totalH
}

// Largest font size (down to 5.5pt) at which both columns fit; if none fits, collapse the
// biggest category to a single line and try again.
function plan(income, expenses) {
  const collapsed = new Set()
  const avail = BOTTOM - START_Y
  for (;;) {
    for (let fs = 8.5; fs >= 5.5; fs -= 0.25) {
      if (Math.max(colHeight(income, fs, collapsed), colHeight(expenses, fs, collapsed)) <= avail) return { fs, collapsed }
    }
    const candidates = [...income, ...expenses].filter((c) => !collapsed.has(c.label) && c.items.length > 3)
    if (!candidates.length) return { fs: 5.5, collapsed }
    candidates.sort((a, b) => b.items.length - a.items.length)
    collapsed.add(candidates[0].label)
  }
}

export function buildBoardPdf({ label, income, expenses, totalIncome, totalExpense, net }) {
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: M, left: M, right: M, bottom: 0 }, bufferPages: true })
  const chunks = []
  doc.on('data', (c) => chunks.push(c))
  const finished = new Promise((resolve) => doc.on('end', resolve))

  const { fs, collapsed } = plan(income, expenses)
  const g = geo(fs)

  doc.font('Helvetica-Bold').fontSize(17).fillColor(NAVY).text('Saratoga Shteibel', M, M, { width: PAGE_W - 2 * M, align: 'center', lineBreak: false })
  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(`STATEMENT OF ACTIVITIES   |   ${String(label).toUpperCase()}`, M, M + 24, { width: PAGE_W - 2 * M, align: 'center', characterSpacing: 1, lineBreak: false })

  const boxY = M + 44, boxH = 38, boxW = (PAGE_W - 2 * M - 20) / 3
  ;[
    { k: 'Total income', v: totalIncome, c: GREEN },
    { k: 'Total expenses', v: totalExpense, c: RUST },
    { k: net >= 0 ? 'Surplus' : 'Deficit', v: net, c: net >= 0 ? NAVY : RUST },
  ].forEach((b, i) => {
    const x = M + i * (boxW + 10)
    doc.rect(x, boxY, boxW, boxH).lineWidth(0.75).strokeColor(LINE).stroke()
    doc.rect(x, boxY, boxW, 2.5).fillColor(b.c).fill()
    doc.font('Helvetica').fontSize(7).fillColor(MUTED).text(b.k.toUpperCase(), x + 9, boxY + 9, { lineBreak: false })
    doc.font('Helvetica-Bold').fontSize(15).fillColor(b.c).text(money(b.v), x + 9, boxY + 19, { lineBreak: false })
  })

  const drawColumn = (x, title, cats, total, color) => {
    let y = START_Y
    doc.font('Helvetica-Bold').fontSize(9).fillColor(color).text(title.toUpperCase(), x, y, { characterSpacing: 1.2, lineBreak: false })
    doc.moveTo(x, y + 13).lineTo(x + COL_W, y + 13).lineWidth(1.25).strokeColor(GOLD).stroke()
    y += g.titleH
    const dateW = fs * 3.4, amtW = fs * 6.2
    cats.forEach((c) => {
      y += g.catGap
      doc.font('Helvetica-Bold').fontSize(fs + 0.5).fillColor(NAVY)
      doc.text(fitText(doc, `${c.label}  (${c.n})`, COL_W - amtW - 4), x, y, { lineBreak: false })
      doc.fillColor(color).text(money(c.total), x + COL_W - amtW, y, { width: amtW, align: 'right', lineBreak: false })
      y += g.catH - 2
      doc.moveTo(x, y).lineTo(x + COL_W, y).lineWidth(0.4).strokeColor(LINE).stroke()
      y += 2
      if (collapsed.has(c.label)) {
        doc.font('Helvetica-Oblique').fontSize(fs).fillColor(MUTED).text(`${c.n} transactions - itemization omitted to fit one page`, x + dateW, y, { lineBreak: false })
        y += g.row
        return
      }
      c.items.forEach((it) => {
        doc.font('Helvetica').fontSize(fs).fillColor(MUTED).text(shortDate(it.date), x, y, { lineBreak: false })
        doc.fillColor(INK).text(fitText(doc, rowLabel(it), COL_W - dateW - amtW - 6), x + dateW, y, { lineBreak: false })
        doc.text(money(it.amount), x + COL_W - amtW, y, { width: amtW, align: 'right', lineBreak: false })
        y += g.row
      })
    })
    y += 3
    doc.moveTo(x, y).lineTo(x + COL_W, y).lineWidth(1.25).strokeColor(GOLD).stroke()
    y += 5
    doc.font('Helvetica-Bold').fontSize(fs + 1).fillColor(NAVY).text(`Total ${title.toLowerCase()}`, x, y, { lineBreak: false })
    doc.fillColor(color).text(money(total), x + COL_W - amtW - 20, y, { width: amtW + 20, align: 'right', lineBreak: false })
  }

  drawColumn(M, 'Income', income, totalIncome, GREEN)
  drawColumn(M + COL_W + GAP, 'Expenses', expenses, totalExpense, RUST)

  const stamp = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  doc.font('Helvetica').fontSize(7).fillColor(MUTED).text(`Generated ${stamp}   |   every figure ties to the bank statement`, M, PAGE_H - 30, { width: PAGE_W - 2 * M, align: 'center', lineBreak: false })

  const pages = doc.bufferedPageRange().count
  doc.end()
  return finished.then(() => ({ pdf: Buffer.concat(chunks), pages, fontSize: fs, collapsed: [...collapsed] }))
}
