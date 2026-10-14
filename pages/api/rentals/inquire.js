import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { getClientIp, hashClientIp } from '../../../lib/rentals/clientIp'
import { validateInquiryInput } from '../../../lib/rentals/inquiryValidate'
import { fetchListingForInquiry } from '../../../lib/rentals/queries'
import { isInquiryRateLimited } from '../../../lib/rentals/rateLimit'
import { sendRentalInquiryEmail } from '../../../lib/rentals/sendInquiryEmail'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = getClientIp(req)
  const ipHash = hashClientIp(ip)

  try {
    const { errors, data, spam } = validateInquiryInput(req.body || {})
    if (spam) {
      return res.status(200).json({ ok: true, message: 'Thank you. The owner will be in touch if the listing is available.' })
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
    if (!listing.owner_email) {
      return res.status(503).json({ error: 'This listing cannot accept inquiries right now. Please try again later.' })
    }

    const sendResult = await sendRentalInquiryEmail({ listing, inquiry: data })
    const emailStatus = sendResult.ok ? 'sent' : 'failed'

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

    if (!sendResult.ok) {
      console.error('rentals/inquire email failed', sendResult.error)
      return res.status(200).json({
        ok: true,
        message:
          'Your request was saved. We could not email the owner automatically; the shul will follow up.',
        emailDelivered: false,
      })
    }

    return res.status(200).json({
      ok: true,
      message: 'Thank you. Your details were sent to the listing owner.',
      emailDelivered: true,
    })
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
