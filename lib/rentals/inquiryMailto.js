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

function buildMailto(to, { subject, body }) {
  const parts = []
  if (subject) parts.push(`subject=${encodeURIComponent(subject)}`)
  if (body) parts.push(`body=${encodeURIComponent(body)}`)
  const query = parts.length ? `?${parts.join('&')}` : ''
  return `mailto:${to}${query}`
}

export function inquiryEmailForListing(item) {
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

  return buildMailto(INQUIRY_TO, { subject, body: lines.join('\n') })
}

export function generalInquiryMailto() {
  const subject = 'Housing question - Saratoga Shteibel'
  const body = ['Hi,', '', 'I have a question about homes near the shul.', '', ''].join('\n')
  return buildMailto(INQUIRY_TO, { subject, body })
}
