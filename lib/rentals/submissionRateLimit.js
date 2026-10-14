import { supabaseAdmin } from '../supabaseAdmin'

const MAX_PER_HOUR = 3
const WINDOW_MS = 60 * 60 * 1000

export async function isSubmissionRateLimited(ipHash) {
  if (!ipHash) return false
  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const { count, error } = await supabaseAdmin
    .from('rental_listings')
    .select('id', { count: 'exact', head: true })
    .eq('submitter_ip_hash', ipHash)
    .gte('created_at', since)
  if (error) {
    if (String(error.message || '').includes('submitter_ip_hash')) {
      return false
    }
    throw error
  }
  return (count ?? 0) >= MAX_PER_HOUR
}
