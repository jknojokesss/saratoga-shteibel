import { loadYkSales, findBuyer, invoiceFilename } from '../../../lib/loadYkSales'
import { buildSaleInvoicePdf } from '../../../lib/saleInvoicePdf'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, buyerId } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })
  if (!buyerId) return res.status(400).json({ error: 'Missing buyerId.' })
  try {
    const data = loadYkSales()
    const buyer = findBuyer(data, buyerId)
    if (!buyer) return res.status(404).json({ error: 'Buyer not found.' })
    const { pdf } = await buildSaleInvoicePdf({ data, buyer })
    const filename = invoiceFilename(buyer, data)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.status(200).send(pdf)
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to generate invoice.' })
  }
}
