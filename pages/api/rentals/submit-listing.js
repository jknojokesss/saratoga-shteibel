import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { getClientIp, hashClientIp } from '../../../lib/rentals/clientIp'
import { notifySubmissionWebhook } from '../../../lib/rentals/notifySubmission'
import { ADMIN_SELECT } from '../../../lib/rentals/queries'
import { submissionApprovalDraft } from '../../../lib/rentals/submissionMailto'
import { isSubmissionRateLimited } from '../../../lib/rentals/submissionRateLimit'
import { validateSubmissionInput } from '../../../lib/rentals/submissionValidate'
import { expiryFromNow, rowToAdmin } from '../../../lib/rentals/validate'

const SUCCESS_MESSAGE =
  'Thank you — your listing was saved for review. We will post it on the site after approval.'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = getClientIp(req)
  const ipHash = hashClientIp(ip)

  try {
    const { errors, data, spam } = validateSubmissionInput(req.body || {})
    if (spam) {
      return res.status(200).json({ ok: true, message: SUCCESS_MESSAGE })
    }
    if (errors.length) {
      return res.status(400).json({ error: errors.join(' ') })
    }

    if (await isSubmissionRateLimited(ipHash)) {
      return res.status(429).json({
        error: 'Too many submissions from your network. Please try again in about an hour.',
      })
    }

    const insertRow = {
      ...data,
      status: 'hidden',
      expires_at: expiryFromNow(60),
      submitter_ip_hash: ipHash || null,
    }

    const { data: row, error } = await supabaseAdmin
      .from('rental_listings')
      .insert(insertRow)
      .select(ADMIN_SELECT)
      .single()
    if (error) throw error

    const listing = rowToAdmin(row)
    const emailDraft = submissionApprovalDraft(row, row.id)

    const webhookResult = await notifySubmissionWebhook({ listing: row, listingId: row.id })
    if (!webhookResult.ok && !webhookResult.skipped) {
      console.error('rentals/submit-listing webhook', webhookResult.error)
    }

    return res.status(200).json({
      ok: true,
      message: SUCCESS_MESSAGE,
      listingId: row.id,
      emailDraft,
      webhookNotified: webhookResult.ok === true,
    })
  } catch (e) {
    console.error('rentals/submit-listing', e)
    const msg = String(e?.message || e || '')
    if (msg.includes('rental_listings') || msg.includes('schema cache')) {
      return res.status(503).json({
        error: 'Submissions are not set up yet. Please email saratogashteibel@gmail.com with your listing details.',
      })
    }
    return res.status(500).json({ error: 'Could not save your listing. Please try again or email the shul.' })
  }
}
