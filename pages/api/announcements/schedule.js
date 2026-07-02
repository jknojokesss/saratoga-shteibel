// Public: current Shabbos schedule PDF URL (or null). Homepage reads this.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings').select('value').eq('key', 'shabbos_schedule_url').maybeSingle()
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ url: data?.value || null })
  } catch (e) {
    return res.status(500).json({ error: 'Could not load schedule.' })
  }
}
