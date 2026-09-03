// Record a bid. Must beat the current high by at least the increment.
// Stores name + phone privately (server-only table); the public never sees them.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const name = (req.body?.name || '').trim()
  const phone = (req.body?.phone || '').trim()
  const amount = Number(req.body?.amount)
  if (!name) return res.status(400).json({ error: 'Please enter your name.' })
  if (!phone) return res.status(400).json({ error: 'Please enter your phone number.' })
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Please enter a valid bid amount.' })

  try {
    const { data: a } = await supabaseAdmin.from('shul_auction').select('*').eq('id', 1).single()
    const closedByTime = a.ends_at ? new Date(a.ends_at).getTime() <= Date.now() : false
    if (!a.is_open || closedByTime) return res.status(409).json({ error: 'Bidding is closed.' })

    const { data: bids } = await supabaseAdmin.from('shul_auction_bids').select('amount')
    const amounts = (bids || []).map((b) => Number(b.amount))
    const high = amounts.length ? Math.max(...amounts) : null
    const inc = Number(a.increment)
    const nextMin = high != null ? high + inc : Number(a.starting_bid)
    if (amount < nextMin) return res.status(400).json({ error: `The next bid must be at least $${nextMin.toLocaleString()}.` })

    const { error } = await supabaseAdmin.from('shul_auction_bids').insert({ name, phone, amount })
    if (error) throw error
    return res.status(200).json({ ok: true, highBid: amount, nextMin: amount + inc })
  } catch (e) {
    return res.status(500).json({ error: 'Could not record your bid. Please try again.' })
  }
}
