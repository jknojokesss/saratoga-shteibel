/**
 * Optional outbound notify — no Resend. Set RENTALS_NOTIFY_WEBHOOK_URL to a Slack or Discord incoming webhook.
 */

export function isSubmissionWebhookConfigured() {
  return Boolean(process.env.RENTALS_NOTIFY_WEBHOOK_URL?.trim())
}

export async function notifySubmissionWebhook({ listing, listingId }) {
  const url = process.env.RENTALS_NOTIFY_WEBHOOK_URL?.trim()
  if (!url) return { ok: false, skipped: true }

  const rent =
    listing.monthly_rent != null
      ? `$${listing.monthly_rent}/mo`
      : listing.monthlyRent != null
        ? `$${listing.monthlyRent}/mo`
        : '—'

  const text = [
    '**New rental submission** (hidden until approved in admin)',
    `**${listing.title}** — ${listing.address}`,
    rent,
    listing.contact_name || listing.contactName
      ? `Contact: ${listing.contact_name || listing.contactName}`
      : null,
    listing.contact_phone || listing.contactPhone
      ? `Phone: ${listing.contact_phone || listing.contactPhone}`
      : null,
    listing.contact_email || listing.contactEmail
      ? `Email: ${listing.contact_email || listing.contactEmail}`
      : null,
    listingId ? `ID: \`${listingId}\`` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text }),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    return { ok: false, error: `Webhook ${res.status}: ${errBody.slice(0, 160)}` }
  }
  return { ok: true }
}
