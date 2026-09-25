import { loadYkSales } from '../../../lib/loadYkSales'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })
  try {
    const data = loadYkSales()
    const buyers = (data.buyers || [])
      .filter((b) => !b.skipInvoice)
      .map((b) => {
      const items = b.items || []
      const priced = items.filter((it) => it.price != null && it.price !== '')
      const subtotal = priced.reduce((s, it) => s + Number(it.qty || 1) * Number(it.price), 0)
      return {
        id: b.id,
        name: b.name,
        phone: b.phone || '',
        itemCount: items.length,
        subtotal,
        paid: Number(b.paid || 0),
      }
    })
    return res.status(200).json({ title: data.title, buyers })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Could not load sales data.' })
  }
}
