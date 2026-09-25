import { loadYkSales } from '../../../lib/loadYkSales'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { mergeVoterRows, lookupVoterPhone } from '../../../lib/voterPhoneLookup'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

async function loadVoterPhones() {
  try {
    const [codesRes, eligibleRes] = await Promise.all([
      supabaseAdmin.from('shul_vote_codes').select('name, phone'),
      supabaseAdmin.from('shul_vote_eligible').select('name, phone'),
    ])
    return mergeVoterRows(codesRes.data, eligibleRes.data)
  } catch {
    return []
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })
  try {
    const data = loadYkSales()
    const voters = await loadVoterPhones()
    const buyers = (data.buyers || [])
      .filter((b) => !b.skipInvoice)
      .map((b) => {
        const items = b.items || []
        const priced = items.filter((it) => it.price != null && it.price !== '')
        const subtotal = priced.reduce((s, it) => s + Number(it.qty || 1) * Number(it.price), 0)
        const phone =
          (b.phone && String(b.phone).trim()) ||
          lookupVoterPhone(b.name, voters) ||
          ''
        return {
          id: b.id,
          name: b.name,
          phone,
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
