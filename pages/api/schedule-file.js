// Serves the current Shabbos schedule PDF behind a clean same-domain URL
// (/shabbos-schedule.pdf via rewrite), so the Supabase storage URL never shows.
import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings').select('value').eq('key', 'shabbos_schedule_url').maybeSingle()
    if (!data?.value) return res.status(404).send('No schedule has been posted yet.')

    const upstream = await fetch(data.value)
    if (!upstream.ok) return res.status(502).send('Could not load the schedule.')

    const buf = Buffer.from(await upstream.arrayBuffer())
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="shabbos-schedule.pdf"')
    res.setHeader('Cache-Control', 'public, max-age=300')
    return res.status(200).send(buf)
  } catch (e) {
    return res.status(500).send('Error loading schedule.')
  }
}
