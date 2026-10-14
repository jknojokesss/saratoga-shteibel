const CENSUS = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'
const BENCHMARK = 'Public_AR_Current'
const LOCALITY_SUFFIX = ', Toms River, NJ'

function titleCaseWord(w) {
  if (!w) return w
  if (w.length <= 2 && /^[A-Z]+$/.test(w)) return w
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
}

function formatMatchedAddress(matched) {
  const raw = String(matched || '').trim()
  if (!raw) return ''
  const parts = raw.split(',').map((p) => p.trim())
  if (parts.length < 3) return raw
  const street = parts[0]
    .split(/\s+/)
    .map((word) => titleCaseWord(word))
    .join(' ')
  const city = titleCaseWord(parts[1])
  const stateZip = parts.slice(2).join(', ')
  const stateZipPretty = stateZip.replace(/\b([A-Z]{2})\b/, (m) => m)
  return `${street}, ${city}, ${stateZipPretty}`
}

function buildSearchLine(query) {
  const q = String(query || '').trim()
  if (!q) return ''
  const lower = q.toLowerCase()
  if (lower.includes('toms river') || lower.includes(', nj')) return q
  return `${q}${LOCALITY_SUFFIX}`
}

export async function searchRentalAddresses(query) {
  const searchLine = buildSearchLine(query)
  if (searchLine.length < 3) return []

  const url = `${CENSUS}?${new URLSearchParams({
    address: searchLine,
    benchmark: BENCHMARK,
    format: 'json',
  })}`

  const upstream = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!upstream.ok) {
    throw new Error('Address lookup failed')
  }

  const data = await upstream.json()
  const matches = data?.result?.addressMatches || []
  const seen = new Set()
  const results = []

  for (const row of matches) {
    const label = formatMatchedAddress(row.matchedAddress)
    if (!label || seen.has(label)) continue
    seen.add(label)
    const coords = row.coordinates || {}
    results.push({
      label,
      lat: coords.y,
      lon: coords.x,
    })
    if (results.length >= 6) break
  }

  return results
}
