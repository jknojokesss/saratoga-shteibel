import fs from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'yk-sales.json')

export function loadYkSales() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8')
  const data = JSON.parse(raw)
  if (!data || !Array.isArray(data.buyers)) throw new Error('Invalid yk-sales.json — expected a buyers array.')
  return data
}

export function findBuyer(data, id) {
  return data.buyers.find((b) => b.id === id)
}

export function buyerTotals(buyer) {
  const items = buyer.items || []
  const subtotal = items.reduce((s, it) => {
    if (it.price == null || it.price === '') return s
    return s + Number(it.qty || 1) * Number(it.price)
  }, 0)
  const paid = Number(buyer.paid || 0)
  const balance = Math.round((subtotal - paid) * 100) / 100
  return { subtotal, paid, balance }
}

export function invoiceFilename(buyer, data) {
  const slug = String(buyer.name || buyer.id || 'invoice')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const event = String(data.title || 'Yom-Kippur-Sale')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `Invoice-${event}-${slug}.pdf`
}
