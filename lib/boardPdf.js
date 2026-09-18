import PDFDocument from 'pdfkit'
import path from 'path'

const NAVY = '#1e2d4e', GOLD = '#c9a84c', GOLD_DK = '#a8862f', MUTED = '#6b6b6b', QUIET = '#8f8f8f', GREEN = '#2e7d32', RUST = '#b2543a', INK = '#141414'
const HAIR = '#d6d6d6'
const PAGE_W = 612, PAGE_H = 792, M = 40, GAP = 22
const COL_W = (PAGE_W - 2 * M - GAP) / 2
const RULE_Y = 76, SUM_Y = 84, SUM_H = 48, START_Y = 152
const BOTTOM = PAGE_H - 46

const FONT_DIR = path.join(process.cwd(), 'lib', 'fonts')

const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const shortDate = (d) => Number(String(d).slice(5, 7)) + '/' + Number(String(d).slice(8, 10))
const titleCase = (s) => s.toLowerCase().replace(/(^|[\s(&-])([a-z])/g, (m, p, c) => p + c.toUpperCase())
// The bundled fonts are Latin only; drop anything else (e.g. Hebrew dedications) instead of printing boxes.
const clean = (s) => String(s).replace(/[^ -~ -ÿ‐-‧™]/g, ' ').replace(/\s+/g, ' ').trim()

// Splits a ledger row into a bold name and a lighter note. Bank-feed text for card
// merchants and processor fees is unreadable, so those get cleaned up or named.
function labelParts(it) {
  const full = String(it.description || '')
  const memo = (full.match(/\[memo: ([^\]]*)\]/) || [])[1]
  const raw = full.replace(/\s*\[[^\]]*\]/g, '').trim()
  let who = String(it.who || '').trim()
  if (who && (who === who.toUpperCase() || who === who.toLowerCase())) who = titleCase(who)
  if (/CO ENTRY DESCR:\s*DISCOUNT/i.test(raw)) return { main: 'Card processing', note: 'discount fee', quiet: true }
  if (/CO ENTRY DESCR:\s*FEE/i.test(raw)) return { main: 'Card processing', note: 'per-transaction fee', quiet: true }
  if (who) {
    const note = raw
      .replace(/^Donation:\s*/i, '')
      .replace(/\s*-\s*Kiddush is sponsored by.*$/i, '')
      .replace(/^Kiddush Sponsorship\s*/i, '')
      .replace(/^Kiddush for\s+/i, '')
      .replace(/^\((.*)\)$/, '$1')
      .trim()
    let main = who, extra = ''
    if (/^Zelle payment/i.test(note)) main = who + ' (Zelle)'
    else if (note && !/^Schedule:/i.test(note) && !/^Monthly Membership/i.test(note) && !/^Membership$/i.test(note)) extra = note
    return { main, note: [extra, memo].filter(Boolean).join(' - ') }
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
  return { main: titleCase(cleaned), note: '' }
}

const rowParts = (it) => {
  const p = labelParts(it)
  return { main: clean(p.main) || 'Transaction', note: clean(p.note), quiet: !!p.quiet }
}

// Single-string label (used in tests).
export const rowLabel = (it) => {
  const p = rowParts(it)
  return [p.main, p.note].filter(Boolean).join(' - ')
}

function fitText(doc, str, maxW) {
  if (doc.widthOfString(str) <= maxW) return str
  let s = str
  while (s.length > 1 && doc.widthOfString(s + '…') > maxW) s = s.slice(0, -1)
  return s.trimEnd() + '…'
}

const geo = (fs) => ({ row: fs * 1.36, band: fs * 1.75, bandGap: fs * 0.7, titleH: 24, totalH: (fs + 5) * 1.25 + 14 })

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
  doc.font('Serif').fontSize(27).fillColor(NAVY).text('Saratoga Shteibel', M, 24, { lineBreak: false })
  doc.font('SansMedium').fontSize(7.5).fillColor(GOLD_DK).text('STATEMENT OF ACTIVITIES', M, 56, { characterSpacing: 2, lineBreak: false })
  doc.font('Serif').fontSize(23).fillColor(NAVY).text(String(label), M, 28, { width: W, align: 'right', lineBreak: false })
  doc.font('Sans').fontSize(8).fillColor(MUTED).text('Toms River, New Jersey', M, 56, { width: W, align: 'right', lineBreak: false })
  doc.moveTo(M, RULE_Y).lineTo(PAGE_W - M, RULE_Y).lineWidth(0.75).strokeColor(NAVY).stroke()

  // headline figures, framed by two rules
  const cellW = W / 3
  const stats = [
    { k: 'Total income', v: money(totalIncome), c: GREEN },
    { k: 'Total expenses', v: money(Math.abs(totalExpense)), c: RUST },
    { k: net >= 0 ? 'Surplus' : 'Deficit', v: money(net), c: net >= 0 ? NAVY : RUST },
  ]
  stats.forEach((s, i) => {
    const x0 = M + i * cellW
    const tx = x0 + (i ? 16 : 0)
    if (i > 0) doc.moveTo(x0, SUM_Y + 6).lineTo(x0, SUM_Y + SUM_H - 2).lineWidth(0.5).strokeColor(NAVY).stroke()
    doc.font('SansMedium').fontSize(7).fillColor(MUTED).text(s.k.toUpperCase(), tx, SUM_Y + 9, { characterSpacing: 1.5, lineBreak: false })
    doc.font('SansMedium').fontSize(22).fillColor(s.c).text(s.v, tx, SUM_Y + 20, { lineBreak: false })
  })
  doc.moveTo(M, SUM_Y + SUM_H + 4).lineTo(PAGE_W - M, SUM_Y + SUM_H + 4).lineWidth(0.75).strokeColor(NAVY).stroke()

  const drawColumn = (x, title, cats, total, color, absolute) => {
    let y = START_Y
    const amtW = fs * 6.4, dateW = fs * 3.5
    const amt = (n) => money(absolute ? Math.abs(n) : n)
    const right = x + COL_W - amtW

    doc.font('SansSemi').fontSize(9).fillColor(NAVY).text(title.toUpperCase(), x, y, { characterSpacing: 2.4, lineBreak: false })
    doc.moveTo(x, y + 15).lineTo(x + COL_W, y + 15).lineWidth(2).strokeColor(NAVY).stroke()
    y += g.titleH

    cats.forEach((c, ci) => {
      y += ci ? g.bandGap : g.bandGap * 0.4
      if (ci) doc.moveTo(x, y).lineTo(x + COL_W, y).lineWidth(0.75).strokeColor(NAVY).stroke()
      doc.font('SansSemi').fontSize(fs + 0.5)
      const ty = y + (g.band - doc.currentLineHeight()) / 2
      const name = fitText(doc, c.label, COL_W - amtW - 44)
      doc.fillColor(NAVY).text(name, x, ty, { lineBreak: false })
      const nameW = doc.widthOfString(name)
      doc.font('Sans').fontSize(fs - 0.5).fillColor(MUTED).text(`   ${c.n}`, x + nameW, ty + 0.5, { lineBreak: false })
      doc.font('SansSemi').fontSize(fs + 0.5).fillColor(color).text(amt(c.total), right, ty, { width: amtW, align: 'right', lineBreak: false })
      y += g.band

      if (collapsed.has(c.label)) {
        doc.font('SansItalic').fontSize(fs).fillColor(MUTED)
        doc.text(`${c.n} transactions - itemization omitted to fit one page`, x, y + (g.row - doc.currentLineHeight()) / 2, { lineBreak: false })
        y += g.row
        return
      }
      const quietCat = /^(Processing fees|Bank & government fees)/.test(c.label)
      c.items.forEach((it) => {
        const p = rowParts(it)
        const quiet = quietCat || p.quiet
        doc.font('Sans').fontSize(fs)
        const ry = y + (g.row - doc.currentLineHeight()) / 2
        doc.fillColor(quiet ? QUIET : MUTED).text(shortDate(it.date), x, ry, { lineBreak: false })

        const maxW = COL_W - dateW - amtW - 8
        doc.font(quiet ? 'Sans' : 'SansMedium').fontSize(fs)
        const main = fitText(doc, p.main, maxW)
        doc.fillColor(quiet ? QUIET : INK).text(main, x + dateW, ry, { lineBreak: false })
        if (p.note && main === p.main) {
          const mw = doc.widthOfString(main)
          doc.font('Sans').fontSize(fs)
          const room = maxW - mw - 6
          if (room > 28) doc.fillColor(quiet ? QUIET : MUTED).text('– ' + fitText(doc, p.note, room - doc.widthOfString('– ')), x + dateW + mw + 5, ry, { lineBreak: false })
        }
        doc.font(quiet ? 'Sans' : 'SansMedium').fontSize(fs).fillColor(quiet ? QUIET : INK).text(amt(it.amount), right, ry, { width: amtW, align: 'right', lineBreak: false })

        y += g.row
        doc.moveTo(x, y).lineTo(x + COL_W, y).lineWidth(0.25).strokeColor(HAIR).stroke()
      })
    })

    y += 4
    doc.moveTo(x, y).lineTo(x + COL_W, y).lineWidth(2).strokeColor(NAVY).stroke()
    y += 7
    doc.font('SansSemi').fontSize(fs + 1).fillColor(NAVY).text(`TOTAL ${title.toUpperCase()}`, x, y + 2, { characterSpacing: 1.4, lineBreak: false })
    doc.font('SansSemi').fontSize(fs + 5).fillColor(color).text(amt(total), right - 40, y - 1, { width: amtW + 40, align: 'right', lineBreak: false })
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
