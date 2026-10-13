// Passcode-gated: uploads Shabbos schedule PDF and/or preview image to Supabase Storage.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export const config = { api: { bodyParser: { sizeLimit: '15mb' } } }

function decodeBase64(dataBase64) {
  const base64 = dataBase64.includes(',') ? dataBase64.split(',')[1] : dataBase64
  return Buffer.from(base64, 'base64')
}

function guessImageType(dataBase64) {
  if (dataBase64.includes('image/png')) return { contentType: 'image/png', ext: 'png' }
  if (dataBase64.includes('image/webp')) return { contentType: 'image/webp', ext: 'webp' }
  return { contentType: 'image/jpeg', ext: 'jpg' }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { passcode, dataBase64, previewBase64 } = req.body || {}

  if (!ADMIN_CODE) {
    return res.status(503).json({ error: 'Admin upload is not configured on this server (missing passcode).' })
  }
  if (passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })
  if (!dataBase64 && !previewBase64) {
    return res.status(400).json({ error: 'Provide a PDF and/or a preview image.' })
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'File storage is not configured (Supabase).' })
  }

  try {
    let pdfUrl = null
    let previewUrl = null

    if (dataBase64) {
      const buffer = decodeBase64(dataBase64)
      if (buffer.length > 15 * 1024 * 1024) return res.status(400).json({ error: 'PDF too large (max 15MB).' })

      const path = 'shabbos-schedule.pdf'
      const { error: upErr } = await supabaseAdmin.storage.from('shul')
        .upload(path, buffer, { contentType: 'application/pdf', upsert: true })
      if (upErr) throw upErr

      const { data: pub } = supabaseAdmin.storage.from('shul').getPublicUrl(path)
      pdfUrl = pub.publicUrl + '?v=' + Date.now()

      const { error: setErr } = await supabaseAdmin.from('site_settings')
        .upsert({ key: 'shabbos_schedule_url', value: pdfUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (setErr) throw setErr
    }

    if (previewBase64) {
      const buffer = decodeBase64(previewBase64)
      if (buffer.length > 15 * 1024 * 1024) return res.status(400).json({ error: 'Image too large (max 15MB).' })

      const { contentType, ext } = guessImageType(previewBase64)
      const path = `shabbos-schedule-preview.${ext}`
      const { error: upErr } = await supabaseAdmin.storage.from('shul')
        .upload(path, buffer, { contentType, upsert: true })
      if (upErr) throw upErr

      const { data: pub } = supabaseAdmin.storage.from('shul').getPublicUrl(path)
      previewUrl = pub.publicUrl + '?v=' + Date.now()

      const { error: setErr } = await supabaseAdmin.from('site_settings')
        .upsert({ key: 'shabbos_schedule_preview_url', value: previewUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (setErr) throw setErr
    }

    return res.status(200).json({ ok: true, url: pdfUrl, preview: previewUrl })
  } catch (e) {
    console.error('upload-schedule', e)
    return res.status(500).json({ error: 'Upload failed. Check that Supabase storage bucket "shul" exists.' })
  }
}
