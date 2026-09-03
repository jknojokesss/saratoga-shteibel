// Passcode-gated auction admin. The ONLY place bidder names/phones are exposed.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.AUCTION_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, action } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    if (action === 'open') await supabaseAdmin.from('shul_auction').update({ is_open: true }).eq('id', 1)
    else if (action === 'close') await supabaseAdmin.from('shul_auction').update({ is_open: false }).eq('id', 1)
    else if (action === 'reset') await supabaseAdmin.from('shul_auction_bids').delete().not('id', 'is', null)
    else if (action === 'set_item') {
      const b = req.body, patch = { updated_at: new Date().toISOString() }
      if (typeof b.title === 'string') patch.title = b.title
      if (typeof b.description === 'string') patch.description = b.description
      if (typeof b.imageUrl === 'string') patch.image_url = b.imageUrl
      if (b.startingBid !== undefined && b.startingBid !== '') patch.starting_bid = Number(b.startingBid)
      if (b.increment !== undefined && b.increment !== '') patch.increment = Number(b.increment)
      if ('endsAt' in b) patch.ends_at = b.endsAt || null
      await supabaseAdmin.from('shul_auction').update(patch).eq('id', 1)
    }

    const { data: a } = await supabaseAdmin.from('shul_auction').select('*').eq('id', 1).single()
    const { data: bids } = await supabaseAdmin
      .from('shul_auction_bids').select('name, phone, amount, created_at').order('amount', { ascending: false }).order('created_at', { ascending: true })
    const high = bids && bids.length ? Number(bids[0].amount) : null
    return res.status(200).json({
      title: a.title,
      description: a.description,
      imageUrl: a.image_url,
      startingBid: Number(a.starting_bid),
      increment: Number(a.increment),
      isOpen: a.is_open,
      endsAt: a.ends_at,
      highBid: high,
      bidCount: (bids || []).length,
      bids: (bids || []).map((x) => ({ name: x.name, phone: x.phone, amount: Number(x.amount), at: x.created_at })),
    })
  } catch (e) {
    return res.status(500).json({ error: 'Admin request failed.' })
  }
}
