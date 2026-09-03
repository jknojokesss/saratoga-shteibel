// Public config for the board vote: whether it's open + the candidate list.
// Candidates = all members not flagged vote_excluded (the leavers).
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  try {
    const { data: status } = await supabaseAdmin
      .from('shul_board_status').select('is_open, title, picks, pick_exact').eq('id', 1).single()

    // If a fixed candidate slate is set, use it; otherwise candidates = eligible voters.
    const { data: slate } = await supabaseAdmin
      .from('shul_board_candidates').select('member_id, name, sort').order('sort')
    let cands
    if (slate && slate.length) {
      cands = slate.map(s => ({ id: s.member_id, name: s.name }))
    } else {
      const { data: voterRows } = await supabaseAdmin.from('shul_vote_codes').select('member_id')
      const ids = [...new Set((voterRows || []).map(v => v.member_id).filter(Boolean))]
      const { data: byId } = ids.length
        ? await supabaseAdmin.from('books_members').select('id, name').in('id', ids).order('name')
        : { data: [] }
      cands = byId || []
    }
    return res.status(200).json({
      open: !!status?.is_open,
      title: status?.title || 'Board Election',
      picks: status?.picks || 3,
      pickExact: status?.pick_exact !== false,
      candidates: cands || [],
    })
  } catch (e) {
    return res.status(500).json({ error: 'Could not load the ballot.' })
  }
}
