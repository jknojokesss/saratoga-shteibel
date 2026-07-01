// Passcode-gated announcement management. Reuses the shul admin passcode.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { passcode, action, item } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    if (action === 'create') {
      if (!item || !item.title || !item.title.trim()) return res.status(400).json({ error: 'Title is required.' })
      const { error } = await supabaseAdmin.from('announcements').insert({
        tag: (item.tag || '').trim(),
        title: item.title.trim(),
        body: (item.body || '').trim(),
        pin: item.pin || '#c9a84c',
        sort_order: Number.isFinite(item.sort_order) ? item.sort_order : 0,
      })
      if (error) throw error

    } else if (action === 'update') {
      if (!item || !item.id) return res.status(400).json({ error: 'Missing id.' })
      if (!item.title || !item.title.trim()) return res.status(400).json({ error: 'Title is required.' })
      const { error } = await supabaseAdmin.from('announcements').update({
        tag: (item.tag || '').trim(),
        title: item.title.trim(),
        body: (item.body || '').trim(),
        pin: item.pin || '#c9a84c',
        sort_order: Number.isFinite(item.sort_order) ? item.sort_order : 0,
      }).eq('id', item.id)
      if (error) throw error

    } else if (action === 'delete') {
      if (!item || !item.id) return res.status(400).json({ error: 'Missing id.' })
      const { error } = await supabaseAdmin.from('announcements').delete().eq('id', item.id)
      if (error) throw error
    } else if (action !== 'list') {
      return res.status(400).json({ error: 'Unknown action.' })
    }

    // Always return the full current list (all items, ordered) after any action.
    const { data, error: listErr } = await supabaseAdmin
      .from('announcements')
      .select('id, tag, title, body, pin, sort_order')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (listErr) throw listErr
    return res.status(200).json({ announcements: data || [] })
  } catch (e) {
    return res.status(500).json({ error: 'Request failed. Please try again.' })
  }
}
