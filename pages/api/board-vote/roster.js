// Passcode-gated: returns the voter roster with codes, for the organizer's
// send-out page. Codes are voting credentials, so this is admin-only.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })
  try {
    const { data } = await supabaseAdmin
      .from('shul_vote_codes').select('name, phone, code, used').order('name')
    return res.status(200).json({ voters: data || [] })
  } catch (e) {
    return res.status(500).json({ error: 'Could not load the roster.' })
  }
}
