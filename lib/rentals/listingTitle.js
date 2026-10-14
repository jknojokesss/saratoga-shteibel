/** Auto title for public submissions (no separate headline field). */
export function listingTitleFromFields({ address, bedrooms, bathrooms, neighborhood }) {
  const street = String(address || '').split(',')[0].trim()
  const parts = []
  if (bedrooms != null && bedrooms !== '') {
    parts.push(`${bedrooms} bed`)
  }
  if (bathrooms != null && bathrooms !== '') {
    parts.push(`${bathrooms} bath`)
  }
  if (street) parts.push(street)
  else if (neighborhood) parts.push(String(neighborhood).trim())
  return parts.length ? parts.join(' · ') : 'Community rental'
}
