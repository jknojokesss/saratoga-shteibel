const INQUIRY_TO = 'saratogashteibel@gmail.com'

function formatRent(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function inquiryEmailForListing(item) {
  const to = INQUIRY_TO
  const subject = `Rental inquiry: ${item.title}`
  const lines = [
    'Hi,',
    '',
    'I am interested in this rental on the Saratoga Shteibel site:',
    '',
    `Listing: ${item.title}`,
    item.address ? `Address: ${item.address}` : null,
    item.neighborhood ? `Area: ${item.neighborhood}` : null,
    item.monthlyRent ? `Rent: ${formatRent(item.monthlyRent)}/month` : null,
    '',
    'My name:',
    'Phone:',
    'Email:',
    'Desired move-in:',
    'Notes:',
    '',
  ].filter(Boolean)

  const params = new URLSearchParams()
  params.set('subject', subject)
  params.set('body', lines.join('\n'))
  return `mailto:${to}?${params.toString()}`
}

export function generalInquiryMailto() {
  const to = INQUIRY_TO
  const subject = 'Rental question — Saratoga Shteibel'
  const body = [
    'Hi,',
    '',
    'I have a question about rentals near the shul.',
    '',
    '',
  ].join('\n')
  const params = new URLSearchParams()
  params.set('subject', subject)
  params.set('body', body)
  return `mailto:${to}?${params.toString()}`
}
