import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { getClientIp, hashClientIp } from '../../../lib/rentals/clientIp'
import { validateInquiryInput } from '../../../lib/rentals/inquiryValidate'
import { fetchListingForInquiry } from '../../../lib/rentals/queries'
import { isInquiryRateLimited } from '../../../lib/rentals/rateLimit'
import { isRentalsEmailConfigured, sendRentalInquiryEmail } from '../../../lib/rentals/sendInquiryEmail'

const SUCCESS_MESSAGE =
  'Thank you. Your request was received. Someone from the shul will follow up with you.'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = getClientIp(req)
  const ipHash = hashClientIp(ip)

  try {
    const { errors, data, spam } = validateInquiryInput(req.body || {})
    if (spam) {
      return res.status(200).json({ ok: true, message: SUCCESS_MESSAGE })
    }
    if (errors.length) {
      return res.status(400).json({ error: errors.join(' ') })
    }

    if (await isInquiryRateLimited(ipHash)) {
      return res.status(429).json({
        error: 'Too many requests from your network. Please try again in about an hour.',
      })
    }

    const listing = await fetchListingForInquiry(data.listing_id)
    if (!listing) {
      return res.status(404).json({ error: 'This listing is no longer available.' })
    }

    let emailStatus = 'failed'
    if (isRentalsEmailConfigured()) {
      const sendResult = await sendRentalInquiryEmail({ listing, inquiry: data })
      emailStatus = sendResult.ok ? 'sent' : 'failed'
      if (!sendResult.ok) console.error('rentals/inquire email failed', sendResult.error)
    }

    const { error: insertError } = await supabaseAdmin.from('rental_inquiries').insert({
      listing_id: data.listing_id,
      requester_name: data.requester_name,
      requester_phone: data.requester_phone,
      requester_email: data.requester_email,
      move_in_date: data.move_in_date,
      message: data.message,
      email_status: emailStatus,
      ip_hash: ipHash,
    })
    if (insertError) throw insertError

    return res.status(200).json({ ok: true, message: SUCCESS_MESSAGE })
  } catch (e) {
    console.error('rentals/inquire', e)
    const msg = String(e?.message || e || '')
    if (msg.includes('rental_inquiries') || msg.includes('schema cache')) {
      return res.status(503).json({
        error: 'Inquiries are not set up yet. Run supabase/migrations/20261015_rental_inquiries.sql.',
      })
    }
    return res.status(500).json({ error: 'Could not submit your request. Please try again.' })
  }
}
