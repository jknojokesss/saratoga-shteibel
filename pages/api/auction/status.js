// Public auction status. Returns the item + the current HIGH BID AMOUNT and bid count.
// Never returns any bidder name or phone — anonymity to everyone but the backend.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  try {
    const { data: a } = await supabaseAdmin.from('shul_auction').select('*').eq('id', 1).single()
    if (!a) return res.status(200).json({ exists: false })
    // amount + time ONLY — never a name or phone (public history stays anonymous).
    const { data: bids } = await supabaseAdmin
      .from('shul_auction_bids').select('amount, created_at').order('amount', { ascending: false })
    const amounts = (bids || []).map((b) => Number(b.amount))
    const high = amounts.length ? amounts[0] : null
    const start = Number(a.starting_bid), inc = Number(a.increment)
    const closedByTime = a.ends_at ? new Date(a.ends_at).getTime() <= Date.now() : false
    return res.status(200).json({
      exists: true,
      open: a.is_open && !closedByTime,
      title: a.title,
      description: a.description,
      imageUrl: a.image_url,
      startingBid: start,
      increment: inc,
      endsAt: a.ends_at,
      highBid: high,
      bidCount: amounts.length,
      nextMin: high != null ? high + inc : start,
      history: (bids || []).map((b) => ({ amount: Number(b.amount), at: b.created_at })),
    })
  } catch (e) {
    return res.status(500).json({ error: 'Could not load the auction.' })
  }
}
