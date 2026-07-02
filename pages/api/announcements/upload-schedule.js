// Passcode-gated: uploads a Shabbos schedule PDF to Supabase Storage (overwriting
// the previous one) and records its public URL in site_settings.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export const config = { api: { bodyParser: { sizeLimit: '15mb' } } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { passcode, dataBase64 } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })
  if (!dataBase64) return res.status(400).json({ error: 'No file provided.' })

  try {
    const base64 = dataBase64.includes(',') ? dataBase64.split(',')[1] : dataBase64
    const buffer = Buffer.from(base64, 'base64')
    if (buffer.length > 15 * 1024 * 1024) return res.status(400).json({ error: 'File too large (max 15MB).' })

    const path = 'shabbos-schedule.pdf'
    const { error: upErr } = await supabaseAdmin.storage.from('shul')
      .upload(path, buffer, { contentType: 'application/pdf', upsert: true })
    if (upErr) throw upErr

    const { data: pub } = supabaseAdmin.storage.from('shul').getPublicUrl(path)
    const url = pub.publicUrl + '?v=' + Date.now() // cache-bust so the new PDF shows immediately

    const { error: setErr } = await supabaseAdmin.from('site_settings')
      .upsert({ key: 'shabbos_schedule_url', value: url, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (setErr) throw setErr

    return res.status(200).json({ ok: true, url })
  } catch (e) {
    return res.status(500).json({ error: 'Upload failed. Please try again.' })
  }
}
