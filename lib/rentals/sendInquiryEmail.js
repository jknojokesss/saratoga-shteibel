import nodemailer from 'nodemailer'

/** Inquiries are emailed to the shul inbox (forward to owners as needed). */
const DEFAULT_NOTIFY = 'saratogashteibel@gmail.com'

function formatRent(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function getRentalsEmailConfig() {
  const notifyTo = process.env.RENTALS_NOTIFY_EMAIL || DEFAULT_NOTIFY
  const smtpUser = process.env.RENTALS_SMTP_USER || notifyTo
  const smtpPass = process.env.RENTALS_SMTP_PASS || process.env.GMAIL_APP_PASSWORD || ''
  return { notifyTo, smtpUser, smtpPass }
}

export function isRentalsEmailConfigured() {
  const { smtpPass, smtpUser } = getRentalsEmailConfig()
  return Boolean(smtpUser && smtpPass)
}

export async function sendRentalInquiryEmail({ listing, inquiry }) {
  const { notifyTo, smtpUser, smtpPass } = getRentalsEmailConfig()
  if (!smtpPass) {
    return {
      ok: false,
      error: 'Email is not configured (set RENTALS_SMTP_PASS or GMAIL_APP_PASSWORD for the Gmail account).',
    }
  }

  const ownerEmail = listing.owner_email || listing.ownerEmail

  const lines = [
    'New rental inquiry on Saratoga Shteibel.',
    '',
    `Listing: ${listing.title}`,
    listing.neighborhood ? `Neighborhood: ${listing.neighborhood}` : null,
    `Rent: ${formatRent(listing.monthly_rent ?? listing.monthlyRent)}/month`,
    ownerEmail ? `Listing owner email (private): ${ownerEmail}` : null,
    '',
    'Requester:',
    `Name: ${inquiry.requester_name}`,
    inquiry.requester_phone ? `Phone: ${inquiry.requester_phone}` : null,
    inquiry.requester_email ? `Email: ${inquiry.requester_email}` : null,
    inquiry.move_in_date ? `Desired move-in: ${inquiry.move_in_date}` : null,
    inquiry.message ? `Message: ${inquiry.message}` : null,
    '',
    inquiry.requester_email
      ? 'Reply-To is set to the requester — use Reply in Gmail to respond.'
      : 'Contact the requester by phone if no email was given.',
  ].filter(Boolean)

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: smtpUser,
      to: notifyTo,
      replyTo: inquiry.requester_email || undefined,
      subject: `Rental inquiry: ${listing.title}`,
      text: lines.join('\n'),
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e?.message || e) }
  }
}
