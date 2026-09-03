// Validate a voting code before showing the ballot. Reveals nothing about
// membership — an unknown code just returns "invalid".
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const code = (req.body?.code || '').trim().toUpperCase()
  if (!code) return res.status(400).json({ error: 'Enter your code.' })
  try {
    const { data: row } = await supabaseAdmin
      .from('shul_vote_codes').select('used').eq('code', code).maybeSingle()
    if (!row) return res.status(403).json({ error: "That code isn't valid." })
    if (row.used) return res.status(409).json({ error: 'This code has already been used to vote.' })
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: 'Could not check the code. Please try again.' })
  }
}
