import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { expiryFromNow, validateListingInput, rowToAdmin } from '../../../lib/rentals/validate'
import { fetchAllListingsAdmin } from '../../../lib/rentals/queries'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

const SELECT =
  'id,title,neighborhood,monthly_rent,bedrooms,bathrooms,available_date,description,distance_to_shul,contact_name,contact_phone,contact_email,status,created_at,expires_at'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { passcode, action, listing, id } = req.body || {}
  if (!ADMIN_CODE) {
    return res.status(503).json({ error: 'Admin is not configured on the server (SHUL_ADMIN_CODE).' })
  }
  if (passcode !== ADMIN_CODE) {
    return res.status(401).json({ error: 'Wrong passcode. Use the same code as Membership / Financials.' })
  }

  try {
    if (action === 'list') {
      const listings = await fetchAllListingsAdmin()
      return res.status(200).json({ listings })
    }

    if (action === 'create') {
      const { errors, data } = validateListingInput(listing || {})
      if (errors.length) return res.status(400).json({ error: errors.join(' ') })

      const { data: row, error } = await supabaseAdmin
        .from('rental_listings')
        .insert({
          ...data,
          expires_at: expiryFromNow(60),
        })
        .select(SELECT)
        .single()
      if (error) throw error
      return res.status(200).json({ listing: rowToAdmin(row) })
    }

    if (action === 'update') {
      if (!id) return res.status(400).json({ error: 'Missing listing id.' })
      const { errors, data } = validateListingInput(listing || {}, { partial: false })
      if (errors.length) return res.status(400).json({ error: errors.join(' ') })

      const { data: row, error } = await supabaseAdmin
        .from('rental_listings')
        .update(data)
        .eq('id', id)
        .select(SELECT)
        .single()
      if (error) throw error
      return res.status(200).json({ listing: rowToAdmin(row) })
    }

    if (action === 'set_status') {
      if (!id) return res.status(400).json({ error: 'Missing listing id.' })
      const st = listing?.status
      if (st !== 'active' && st !== 'hidden') {
        return res.status(400).json({ error: 'Status must be active or hidden.' })
      }
      const { data: row, error } = await supabaseAdmin
        .from('rental_listings')
        .update({ status: st })
        .eq('id', id)
        .select(SELECT)
        .single()
      if (error) throw error
      return res.status(200).json({ listing: rowToAdmin(row) })
    }

    if (action === 'renew') {
      if (!id) return res.status(400).json({ error: 'Missing listing id.' })
      const { data: row, error } = await supabaseAdmin
        .from('rental_listings')
        .update({ expires_at: expiryFromNow(60) })
        .eq('id', id)
        .select(SELECT)
        .single()
      if (error) throw error
      return res.status(200).json({ listing: rowToAdmin(row) })
    }

    if (action === 'delete') {
      if (!id) return res.status(400).json({ error: 'Missing listing id.' })
      const { error } = await supabaseAdmin.from('rental_listings').delete().eq('id', id)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Unknown action.' })
  } catch (e) {
    console.error('rentals/admin', action, e)
    const msg = String(e?.message || e || '')
    if (msg.includes('rental_listings') || msg.includes('schema cache')) {
      return res.status(503).json({
        error: 'Rentals database table is missing. Run supabase/migrations/20261014_rental_listings.sql in Supabase.',
      })
    }
    return res.status(500).json({ error: 'Request failed. Try again or check server logs.' })
  }
}
