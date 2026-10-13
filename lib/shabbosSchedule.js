import { supabaseAdmin } from './supabaseAdmin'

const STATIC = {
  scheduleUrl: '/zmanim/this-week.pdf',
  previewUrl: '/zmanim/this-week.png',
}

/** URLs for the public Zmanim page (uploaded schedule or static fallback). */
export async function getShabbosScheduleUrls() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { ...STATIC, source: 'static' }
    }

    const { data: pdfRow } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'shabbos_schedule_url')
      .maybeSingle()

    if (!pdfRow?.value) {
      return { ...STATIC, source: 'static' }
    }

    const { data: previewRow } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'shabbos_schedule_preview_url')
      .maybeSingle()

    return {
      scheduleUrl: '/api/schedule-file',
      previewUrl: previewRow?.value || null,
      source: 'upload',
    }
  } catch {
    return { ...STATIC, source: 'static' }
  }
}
