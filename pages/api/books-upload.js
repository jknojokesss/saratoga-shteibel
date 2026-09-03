// Incremental CSV ingest for the books. Passcode-gated. Parses a source CSV,
// dedupes against what's already loaded, appends ONLY new rows to the source
// table AND the ledger (as status='review'), then runs books_autocat().
// Never truncates; existing categorizations are untouched.
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

function splitLine(line) {
  const out = []; let cur = ''; let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else { if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = '' } else cur += c }
  }
  out.push(cur); return out
}
const num = (v) => { if (v == null || v === '') return null; const n = parseFloat(String(v).replace(/[$,]/g, '')); return isNaN(n) ? null : n }
const mdy = (v) => { const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec((v || '').trim()); return m ? `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` : null }
const st = (v) => { const t = (v || '').trim(); return t === '' ? null : t }
const zelleName = (d) => { const m = /Zelle payment (?:from|to) (.+?)\s+\S+$/.exec(d || ''); return m ? m[1].trim() : null }

async function existingSet(table, cols) {
  const set = new Set()
  for (let from = 0; ; from += 1000) {
    const { data } = await supabaseAdmin.from(table).select(cols.join(',')).range(from, from + 999)
    ;(data || []).forEach(r => set.add(cols.map(c => String(r[c])).join('|')))
    if (!data || data.length < 1000) break
  }
  return set
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, source, csv } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })
  if (!csv || !source) return res.status(400).json({ error: 'Missing source or file.' })

  try {
    const lines = String(csv).replace(/^﻿/, '').split(/\r?\n/)
    const srcRows = []   // rows to append to the source staging table
    const ledgerRows = [] // rows to append to books_ledger
    let parsed = 0

    if (source === 'sola') {
      const seen = await existingSet('books_sola', ['ref_num'])
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const f = splitLine(lines[i]); const d = mdy(f[1]); if (!d) continue
        parsed++
        const ref = st(f[0]); if (!ref || seen.has(ref)) continue
        seen.add(ref)
        const row = { ref_num: ref, txn_date: d, txn_time: st(f[2]), amount: num(f[3]), processing_fee: num(f[4]), net_sale: num(f[5]), cardholder_name: st(f[6]), account_mask: st(f[7]), card_type: st(f[8]), result: st(f[9]), command: st(f[10]), description: st(f[11]), international: st(f[12]) }
        srcRows.push(row)
        if (row.result === 'Approved') ledgerRows.push({ txn_date: d, source: 'sola', source_ref: ref, counterparty: row.cardholder_name, description: row.description, amount: row.amount, status: 'review' })
      }
    } else if (source === 'donorsfund') {
      const seen = await existingSet('books_donorsfund', ['confirmation_number'])
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const f = splitLine(lines[i]); const d = mdy(f[0]); if (!d) continue
        parsed++
        const conf = st(f[1]); if (!conf || seen.has(conf)) continue
        seen.add(conf)
        const row = { txn_date: d, confirmation_number: conf, transaction_type: st(f[2]), payment_type: st(f[3]), asset_type: st(f[4]), amount: num(f[5]), fees: num(f[6]), net_amount: num(f[7]), shared_name: st(f[8]), shared_fund_name: st(f[9]), shared_email: st(f[10]), shared_phone: st(f[11]), shared_address: st(f[12]), memo: st(f[13]), barcode: st(f[14]) }
        srcRows.push(row)
        if (row.transaction_type === 'Grant' && d >= '2024-07-08') ledgerRows.push({ txn_date: d, source: 'donorsfund', source_ref: conf, counterparty: row.shared_name, description: row.memo || row.shared_fund_name || 'DF grant', amount: row.amount, status: 'review' })
      }
    } else if (source === 'chase') {
      const seen = await existingSet('books_chase', ['posting_date', 'amount', 'balance'])
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const f = splitLine(lines[i]); const d = mdy(f[1]); if (!d) continue
        parsed++
        const amount = num(f[3]); const balance = num(f[5])
        const key = [d, String(amount), String(balance)].join('|')
        if (seen.has(key)) continue
        seen.add(key)
        const type = st(f[4]); const descr = st(f[2])
        srcRows.push({ details: st(f[0]), posting_date: d, description: descr, amount, type, balance, check_slip: st(f[6]) })
        const isSettlement = (type === 'ACH_CREDIT' || type === 'MISC_CREDIT') && (/MERCH BNKCD/i.test(descr || '') || /The Donors/i.test(descr || ''))
        const isSant = /SANTANDER BANK|SANTBK/i.test(descr || '')
        if (type !== 'ACCT_XFER' && !isSettlement && !isSant) {
          ledgerRows.push({ txn_date: d, source: 'chase', counterparty: zelleName(descr), description: descr, amount, status: 'review' })
        }
      }
    } else {
      return res.status(400).json({ error: 'Unknown source: ' + source })
    }

    // Append (batches of 300)
    const table = source === 'sola' ? 'books_sola' : source === 'donorsfund' ? 'books_donorsfund' : 'books_chase'
    for (let i = 0; i < srcRows.length; i += 300) { const { error } = await supabaseAdmin.from(table).insert(srcRows.slice(i, i + 300)); if (error) throw error }
    for (let i = 0; i < ledgerRows.length; i += 300) { const { error } = await supabaseAdmin.from('books_ledger').insert(ledgerRows.slice(i, i + 300)); if (error) throw error }

    await supabaseAdmin.rpc('books_autocat')

    const { count: reviewLeft } = await supabaseAdmin.from('books_ledger').select('id', { count: 'exact', head: true }).eq('status', 'review')
    return res.status(200).json({ ok: true, source, parsed, addedSource: srcRows.length, addedLedger: ledgerRows.length, reviewLeft })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Import failed.' })
  }
}
