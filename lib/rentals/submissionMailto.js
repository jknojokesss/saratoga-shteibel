const NOTIFY_TO = 'saratogashteibel@gmail.com'

function formatRent(n) {
  if (n == null || n === '') return null
  const num = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(num)) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num)
}

/** Subject-only mailto — body copied on click (same pattern as rental inquiries). */
export function mailtoWithSubject(subject) {
  return `mailto:${NOTIFY_TO}?subject=${encodeURIComponent(subject)}`
}

export function submissionApprovalDraft(listing, listingId) {
  const subject = `Rental listing for approval: ${listing.title || 'New listing'}`
  const lines = [
    'Hi,',
    '',
    'Please review this rental submission for the Saratoga Shteibel Homes page.',
    listingId ? `Listing ID (admin): ${listingId}` : null,
    '',
    `Title: ${listing.title}`,
    `Address: ${listing.address}`,
    listing.neighborhood ? `Area: ${listing.neighborhood}` : null,
    formatRent(listing.monthly_rent ?? listing.monthlyRent)
      ? `Rent: ${formatRent(listing.monthly_rent ?? listing.monthlyRent)}/month`
      : null,
    listing.bedrooms != null && listing.bedrooms !== ''
      ? `Bedrooms: ${listing.bedrooms}`
      : null,
    listing.bathrooms != null && listing.bathrooms !== ''
      ? `Bathrooms: ${listing.bathrooms}`
      : null,
    listing.available_date || listing.availableDate
      ? `Available: ${listing.available_date || listing.availableDate}`
      : null,
    listing.distance_to_shul || listing.distanceToShul
      ? `Walk to shul: ${listing.distance_to_shul || listing.distanceToShul}`
      : null,
    '',
    listing.description ? `Description:\n${listing.description}` : null,
    '',
    'Submitter contact:',
    listing.contact_name || listing.contactName
      ? `Name: ${listing.contact_name || listing.contactName}`
      : null,
    listing.contact_phone || listing.contactPhone
      ? `Phone: ${listing.contact_phone || listing.contactPhone}`
      : null,
    listing.contact_email || listing.contactEmail
      ? `Email: ${listing.contact_email || listing.contactEmail}`
      : null,
    '',
    'Thank you!',
  ].filter(Boolean)

  return { subject, body: lines.join('\n'), to: NOTIFY_TO }
}
