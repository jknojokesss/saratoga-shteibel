const INQUIRY_TO = 'saratogashteibel@gmail.com'

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

/** Subject-only mailto — avoids broken body= handling in many mail apps. */
export function mailtoWithSubject(subject) {
  return `mailto:${INQUIRY_TO}?subject=${encodeURIComponent(subject)}`
}

export function inquiryDraftForListing(item) {
  const subject = `Rental inquiry: ${item.title || 'listing'}`
  const lines = [
    'Hi,',
    '',
    'I am interested in this rental on the Saratoga Shteibel site:',
    '',
    `Listing: ${item.title}`,
    item.address ? `Address: ${item.address}` : null,
    item.neighborhood ? `Area: ${item.neighborhood}` : null,
    formatRent(item.monthlyRent) ? `Rent: ${formatRent(item.monthlyRent)}/month` : null,
    '',
    'My name:',
    'Phone:',
    'Email:',
    'Desired move-in:',
    'Notes:',
    '',
  ].filter(Boolean)

  return { subject, body: lines.join('\n'), to: INQUIRY_TO }
}

export function generalInquiryDraft() {
  const subject = 'Housing question - Saratoga Shteibel'
  const body = ['Hi,', '', 'I have a question about homes near the shul.', '', ''].join('\n')
  return { subject, body, to: INQUIRY_TO }
}

/** @deprecated Use inquiryDraftForListing + InquireEmailLink */
export function inquiryEmailForListing(item) {
  const { subject } = inquiryDraftForListing(item)
  return mailtoWithSubject(subject)
}

/** @deprecated Use generalInquiryDraft + InquireEmailLink */
export function generalInquiryMailto() {
  const { subject } = generalInquiryDraft()
  return mailtoWithSubject(subject)
}
