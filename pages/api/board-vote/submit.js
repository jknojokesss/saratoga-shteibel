// Record a board-vote ballot. Two writes that share NO key (keeps it anonymous):
//   1) claim the code (used=true) via a conditional update (used=false) — this is
//      the double-vote guard and can't race into two ballots.
//   2) insert an anonymous ballot (3 candidate ids), no code id, no timestamp.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const code = (req.body?.code || '').trim().toUpperCase()
  const choices = Array.isArray(req.body?.choices) ? req.body.choices.map(Number).filter(Boolean) : []
  const uniq = [...new Set(choices)]
  if (!code) return res.status(400).json({ error: 'Missing code.' })

  try {
    const { data: status } = await supabaseAdmin
      .from('shul_board_status').select('is_open, picks, pick_exact').eq('id', 1).single()
    if (!status?.is_open) return res.status(409).json({ error: 'Voting is not open.' })
    const need = status.picks || 3
    const exact = status.pick_exact !== false
    if (exact && uniq.length !== need) return res.status(400).json({ error: `Please pick exactly ${need} candidates.` })
    if (!exact && (uniq.length < 1 || uniq.length > need)) return res.status(400).json({ error: `Please pick 1 to ${need} candidates.` })

    // Only actual candidates may receive votes. If a fixed slate exists, enforce it.
    const { data: slate } = await supabaseAdmin.from('shul_board_candidates').select('member_id')
    if (slate && slate.length) {
      const valid = new Set(slate.map(s => s.member_id))
      if (!uniq.every(id => valid.has(id))) return res.status(400).json({ error: 'Invalid candidate selection.' })
    }

    // Atomically claim the code: only succeeds if it exists AND is unused.
    const { data: claimed, error: claimErr } = await supabaseAdmin
      .from('shul_vote_codes').update({ used: true })
      .eq('code', code).eq('used', false).select('id')
    if (claimErr) throw claimErr

    if (!claimed || claimed.length === 0) {
      const { data: exists } = await supabaseAdmin
        .from('shul_vote_codes').select('used').eq('code', code).maybeSingle()
      if (!exists) return res.status(403).json({ error: "That code isn't valid." })
      return res.status(409).json({ error: 'This code has already been used to vote.' })
    }

    const { error: ballotErr } = await supabaseAdmin
      .from('shul_board_ballots').insert({
        choice1: uniq[0] || null, choice2: uniq[1] || null, choice3: uniq[2] || null,
        choice4: uniq[3] || null, choice5: uniq[4] || null,
      })
    if (ballotErr) {
      await supabaseAdmin.from('shul_vote_codes').update({ used: false }).eq('code', code)
      throw ballotErr
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: 'Could not record your vote. Please try again.' })
  }
}
