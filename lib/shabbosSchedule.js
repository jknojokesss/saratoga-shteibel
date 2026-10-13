import { supabaseAdmin } from './supabaseAdmin'

/** Flyer committed in repo when you send the weekly image (deploy updates the site). */
const FLYER_VERSION = '5786-oct-13'
const STATIC = {
  scheduleUrl: `/zmanim/this-week.pdf?v=${FLYER_VERSION}`,
  previewUrl: `/zmanim/this-week.png?v=${FLYER_VERSION}`,
}

function withVersion(url) {
  if (!url || url.includes('?v=')) return url
  return `${url}${url.includes('?') ? '&' : '?'}v=${FLYER_VERSION}`
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

    const { data: previewRow } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'shabbos_schedule_preview_url')
      .maybeSingle()

    const hasPdf = Boolean(pdfRow?.value)
    const hasPreview = Boolean(previewRow?.value)

    // Incomplete admin upload (PDF only) used to break the page — show the deployed flyer instead.
    if (!hasPdf || !hasPreview) {
      return { ...STATIC, source: 'static' }
    }

    return {
      scheduleUrl: '/api/schedule-file',
      previewUrl: withVersion(previewRow.value),
      source: 'upload',
    }
  } catch {
    return { ...STATIC, source: 'static' }
  }
}
