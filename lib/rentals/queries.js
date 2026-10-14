import { supabaseAdmin } from '../supabaseAdmin'
import { isListingActive, rowToAdmin, rowToPublic } from './validate'

export const PUBLIC_SELECT =
  'id,title,neighborhood,monthly_rent,bedrooms,bathrooms,available_date,description,distance_to_shul,status,created_at,expires_at'

export const ADMIN_SELECT =
  'id,title,neighborhood,monthly_rent,bedrooms,bathrooms,available_date,description,distance_to_shul,contact_name,contact_phone,contact_email,owner_email,status,leased_at,created_at,expires_at'

export async function fetchActiveListings() {
  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('rental_listings')
    .select(PUBLIC_SELECT)
    .eq('status', 'active')
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToPublic)
}

export async function fetchAllListingsAdmin() {
  const { data, error } = await supabaseAdmin
    .from('rental_listings')
    .select(ADMIN_SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToAdmin)
}

export async function fetchListingForInquiry(id) {
  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('rental_listings')
    .select('id,title,neighborhood,monthly_rent,owner_email,status,expires_at')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data || data.status !== 'active') return null
  if (new Date(data.expires_at) <= new Date(now)) return null
  return data
}

export { isListingActive }
