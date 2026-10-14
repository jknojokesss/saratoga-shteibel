import { supabaseAdmin } from '../supabaseAdmin'

const MAX_PER_HOUR = 5
const WINDOW_MS = 60 * 60 * 1000

export async function isInquiryRateLimited(ipHash) {
  if (!ipHash) return false
  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const { count, error } = await supabaseAdmin
    .from('rental_inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since)
  if (error) throw error
  return (count ?? 0) >= MAX_PER_HOUR
}
