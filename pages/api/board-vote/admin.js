// Passcode-gated admin for the board vote.
// While OPEN: returns only a turnout count (no tally) — organizers can't see
// which way it's going. Once CLOSED: returns the tally + who voted.
// "Who voted" is turnout only (the used-code names); it is NOT linked to any
// ballot, so anonymity holds.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { passcode, action } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    if (action === 'close') {
      await supabaseAdmin.from('shul_board_status').update({ is_open: false }).eq('id', 1)
    } else if (action === 'reopen') {
      await supabaseAdmin.from('shul_board_status').update({ is_open: true }).eq('id', 1)
    } else if (action === 'reset') {
      await supabaseAdmin.from('shul_board_ballots').delete().not('id', 'is', null)
      await supabaseAdmin.from('shul_vote_codes').update({ used: false }).eq('used', true)
      await supabaseAdmin.from('shul_board_status').update({ is_open: true }).eq('id', 1)
    } else if (action === 'set_rule') {
      await supabaseAdmin.from('shul_board_status').update({ pick_exact: req.body.exact !== false }).eq('id', 1)
    }

    const { data: status } = await supabaseAdmin
      .from('shul_board_status').select('is_open, title, picks, pick_exact').eq('id', 1).single()
    const { data: codes } = await supabaseAdmin
      .from('shul_vote_codes').select('name, used').order('name')

    const base = {
      isOpen: status.is_open,
      title: status.title,
      picks: status.picks || 5,
      pickExact: status.pick_exact !== false,
      totalEligible: codes.length,
      votedCount: codes.filter((c) => c.used).length,
    }

    if (status.is_open) return res.status(200).json(base)

    const { data: ballots } = await supabaseAdmin
      .from('shul_board_ballots').select('choice1, choice2, choice3, choice4, choice5')
    const { data: members } = await supabaseAdmin.from('books_members').select('id, name')
    const nameById = {}
    ;(members || []).forEach((m) => { nameById[m.id] = m.name })

    const counts = {}
    ;(ballots || []).forEach((b) => {
      ;[b.choice1, b.choice2, b.choice3, b.choice4, b.choice5].forEach((id) => { if (id) counts[id] = (counts[id] || 0) + 1 })
    })
    const tally = Object.entries(counts)
      .map(([id, votes]) => ({ name: nameById[id] || ('#' + id), votes }))
      .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name))

    const totalVotes = Object.values(counts).reduce((s, n) => s + n, 0)
    // Anonymous audit: how many ballots used how many picks (accounts for every vote).
    const dist = {}
    ;(ballots || []).forEach((b) => {
      const n = [b.choice1, b.choice2, b.choice3, b.choice4, b.choice5].filter(Boolean).length
      dist[n] = (dist[n] || 0) + 1
    })
    const pickDistribution = Object.entries(dist)
      .sort((a, b) => b[0] - a[0])
      .map(([n, c]) => `${n} pick${n > 1 ? 's' : ''} × ${c} ballot${c > 1 ? 's' : ''}`)
      .join(' · ')
    return res.status(200).json({
      ...base,
      ballotCount: (ballots || []).length,
      totalVotes,
      pickDistribution,
      tally,
      voted: codes.filter((c) => c.used).map((c) => c.name),
      notVoted: codes.filter((c) => !c.used).map((c) => c.name),
    })
  } catch (e) {
    return res.status(500).json({ error: 'Admin request failed.' })
  }
}
