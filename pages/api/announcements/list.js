// Public: the homepage bulletin board reads from here. Only published items.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('id, tag, title, body, pin, sort_order')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ announcements: data || [] })
  } catch (e) {
    return res.status(500).json({ error: 'Could not load announcements.' })
  }
}
