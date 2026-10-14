/**
 * Sends inquiry notification via Resend HTTP API (no extra npm package).
 * Configure: RESEND_API_KEY, RENTALS_FROM_EMAIL, RENTALS_GABBAI_BCC (optional).
 */

function formatRent(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function getRentalsEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY || process.env.RENTALS_RESEND_API_KEY
  const from = process.env.RENTALS_FROM_EMAIL || process.env.RESEND_FROM_EMAIL
  const bcc = process.env.RENTALS_GABBAI_BCC || ''
  return { apiKey, from, bcc }
}

export function isRentalsEmailConfigured() {
  const { apiKey, from } = getRentalsEmailConfig()
  return Boolean(apiKey && from)
}

export async function sendRentalInquiryEmail({ listing, inquiry }) {
  const { apiKey, from, bcc } = getRentalsEmailConfig()
  if (!apiKey || !from) {
    return { ok: false, error: 'Email is not configured (RESEND_API_KEY and RENTALS_FROM_EMAIL).' }
  }

  const ownerTo = listing.owner_email || listing.ownerEmail
  if (!ownerTo) {
    return { ok: false, error: 'Listing has no owner email.' }
  }

  const lines = [
    'Someone requested details about your rental listing on Saratoga Shteibel.',
    '',
    `Listing: ${listing.title}`,
    listing.neighborhood ? `Neighborhood: ${listing.neighborhood}` : null,
    `Rent: ${formatRent(listing.monthly_rent ?? listing.monthlyRent)}/month`,
    '',
    'Requester:',
    `Name: ${inquiry.requester_name}`,
    inquiry.requester_phone ? `Phone: ${inquiry.requester_phone}` : null,
    inquiry.requester_email ? `Email: ${inquiry.requester_email}` : null,
    inquiry.move_in_date ? `Desired move-in: ${inquiry.move_in_date}` : null,
    inquiry.message ? `Message: ${inquiry.message}` : null,
    '',
    'Reply to this email to reach the requester (Reply-To is set to them when an email was provided).',
  ].filter(Boolean)

  const payload = {
    from,
    to: [ownerTo],
    subject: `Rental inquiry: ${listing.title}`,
    text: lines.join('\n'),
  }

  if (bcc) payload.bcc = [bcc]
  if (inquiry.requester_email) payload.reply_to = inquiry.requester_email

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, error: body || `Resend HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e?.message || e) }
  }
}
