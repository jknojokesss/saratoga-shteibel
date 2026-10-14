import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { inquiriesToCsv } from '../../../lib/rentals/csv'
import { rowToAdminInquiry } from '../../../lib/rentals/inquiryValidate'
import { fetchAllListingsAdmin, ADMIN_SELECT } from '../../../lib/rentals/queries'
import { sendRentalInquiryEmail } from '../../../lib/rentals/sendInquiryEmail'
import { expiryFromNow, validateListingInput, rowToAdmin } from '../../../lib/rentals/validate'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { passcode, action, listing, id, listingId, inquiryId } = req.body || {}
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
        .select(ADMIN_SELECT)
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
        .select(ADMIN_SELECT)
        .single()
      if (error) throw error
      return res.status(200).json({ listing: rowToAdmin(row) })
    }

    if (action === 'set_status') {
      if (!id) return res.status(400).json({ error: 'Missing listing id.' })
      const st = listing?.status
      if (st !== 'active' && st !== 'hidden' && st !== 'leased') {
        return res.status(400).json({ error: 'Status must be active, hidden, or leased.' })
      }
      const patch = { status: st }
      if (st === 'leased' && !listing?.clearLeased) {
        patch.leased_at = listing?.leased_at || new Date().toISOString().slice(0, 10)
      }
      if (st !== 'leased') patch.leased_at = null

      const { data: row, error } = await supabaseAdmin
        .from('rental_listings')
        .update(patch)
        .eq('id', id)
        .select(ADMIN_SELECT)
        .single()
      if (error) throw error
      return res.status(200).json({ listing: rowToAdmin(row) })
    }

    if (action === 'mark_leased') {
      if (!id) return res.status(400).json({ error: 'Missing listing id.' })
      const leasedAt = listing?.leasedAt || listing?.leased_at || new Date().toISOString().slice(0, 10)
      const { data: row, error } = await supabaseAdmin
        .from('rental_listings')
        .update({ status: 'leased', leased_at: leasedAt })
        .eq('id', id)
        .select(ADMIN_SELECT)
        .single()
      if (error) throw error
      return res.status(200).json({ listing: rowToAdmin(row) })
    }

    if (action === 'renew') {
      if (!id) return res.status(400).json({ error: 'Missing listing id.' })
      const { data: row, error } = await supabaseAdmin
        .from('rental_listings')
        .update({ expires_at: expiryFromNow(60), status: 'active', leased_at: null })
        .eq('id', id)
        .select(ADMIN_SELECT)
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

    if (action === 'list_inquiries') {
      const lid = listingId || id
      if (!lid) return res.status(400).json({ error: 'Missing listing id.' })
      const { data, error } = await supabaseAdmin
        .from('rental_inquiries')
        .select('*')
        .eq('listing_id', lid)
        .order('created_at', { ascending: false })
      if (error) throw error
      return res.status(200).json({ inquiries: (data || []).map(rowToAdminInquiry) })
    }

    if (action === 'resend_inquiry') {
      if (!inquiryId) return res.status(400).json({ error: 'Missing inquiry id.' })
      const { data: inquiry, error: iErr } = await supabaseAdmin
        .from('rental_inquiries')
        .select('*')
        .eq('id', inquiryId)
        .single()
      if (iErr) throw iErr
      if (!inquiry) return res.status(404).json({ error: 'Inquiry not found.' })

      const { data: listing, error: lErr } = await supabaseAdmin
        .from('rental_listings')
        .select('id,title,neighborhood,monthly_rent,owner_email')
        .eq('id', inquiry.listing_id)
        .single()
      if (lErr) throw lErr

      const sendResult = await sendRentalInquiryEmail({ listing, inquiry })
      const emailStatus = sendResult.ok ? 'sent' : 'failed'
      await supabaseAdmin.from('rental_inquiries').update({ email_status: emailStatus }).eq('id', inquiryId)

      if (!sendResult.ok) {
        return res.status(502).json({ error: sendResult.error || 'Email could not be sent.' })
      }
      return res.status(200).json({ ok: true, emailStatus })
    }

    if (action === 'export_inquiries_csv') {
      const lid = listingId || null
      let q = supabaseAdmin
        .from('rental_inquiries')
        .select('*, rental_listings(title)')
        .order('created_at', { ascending: false })
      if (lid) q = q.eq('listing_id', lid)
      const { data, error } = await q
      if (error) throw error
      const rows = (data || []).map((row) => ({
        ...rowToAdminInquiry(row),
        listingTitle: row.rental_listings?.title || '',
      }))
      return res.status(200).json({ csv: inquiriesToCsv(rows) })
    }

    return res.status(400).json({ error: 'Unknown action.' })
  } catch (e) {
    console.error('rentals/admin', action, e)
    const msg = String(e?.message || e || '')
    if (msg.includes('rental_listings') || msg.includes('rental_inquiries') || msg.includes('schema cache')) {
      return res.status(503).json({
        error: 'Rentals database tables are missing. Run supabase/migrations for rental_listings and rental_inquiries.',
      })
    }
    return res.status(500).json({ error: 'Request failed. Try again or check server logs.' })
  }
}
