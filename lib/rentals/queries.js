import { supabaseAdmin } from '../supabaseAdmin'
import { isListingActive, rowToAdmin, rowToPublic } from './validate'

const SELECT =
  'id,title,neighborhood,monthly_rent,bedrooms,bathrooms,available_date,description,distance_to_shul,contact_name,contact_phone,contact_email,status,created_at,expires_at'

export async function fetchActiveListings() {
  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('rental_listings')
    .select(SELECT)
    .eq('status', 'active')
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToPublic)
}

export async function fetchAllListingsAdmin() {
  const { data, error } = await supabaseAdmin
    .from('rental_listings')
    .select(SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToAdmin)
}

export { isListingActive }
