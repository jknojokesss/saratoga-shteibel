import { descriptionViolatesFairHousing } from './discriminatoryPhrases'
import { sanitizeEmail, sanitizePhone, sanitizeText } from './sanitize'

export function validateInquiryInput(raw) {
  const errors = []
  const name = sanitizeText(raw.name ?? raw.requesterName, 80)
  const phone = sanitizePhone(raw.phone ?? raw.requesterPhone)
  const email = sanitizeEmail(raw.email ?? raw.requesterEmail)
  const message = sanitizeText(raw.message, 500)

  if (!name) errors.push('Name is required.')

  if (!phone && !email) {
    errors.push('Phone or email is required.')
  }
  if (raw.email && !email && String(raw.email).trim()) {
    errors.push('Enter a valid email address.')
  }

  let moveInDate = null
  const mid = raw.moveInDate ?? raw.move_in_date
  if (mid) {
    const s = String(mid).slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      errors.push('Move-in date must be YYYY-MM-DD.')
    } else {
      moveInDate = s
    }
  }

  if (message && descriptionViolatesFairHousing(message)) {
    errors.push('Message may not state preferences about who may rent. Describe your interest only.')
  }

  const honeypot = sanitizeText(raw.company ?? raw.website, 200)
  if (honeypot) {
    return { errors: [], data: null, spam: true }
  }

  if (!raw.listingId && !raw.listing_id) {
    errors.push('Listing is required.')
  }

  const listingId = String(raw.listingId ?? raw.listing_id ?? '').trim()
  if (!listingId) errors.push('Listing is required.')

  return {
    errors,
    spam: false,
    data: {
      listing_id: listingId,
      requester_name: name,
      requester_phone: phone,
      requester_email: email,
      move_in_date: moveInDate,
      message,
    },
  }
}

export function rowToAdminInquiry(row) {
  return {
    id: row.id,
    listingId: row.listing_id,
    requesterName: row.requester_name,
    requesterPhone: row.requester_phone || '',
    requesterEmail: row.requester_email || '',
    moveInDate: row.move_in_date,
    message: row.message || '',
    createdAt: row.created_at,
    emailStatus: row.email_status,
  }
}
