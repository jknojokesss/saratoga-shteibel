const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const q = String(req.query.q || '').trim()
  if (q.length < 3) {
    return res.status(200).json({ results: [] })
  }

  const search = `${q}, Toms River, New Jersey`
  const url = `${NOMINATIM}?${new URLSearchParams({
    format: 'json',
    addressdetails: '1',
    countrycodes: 'us',
    limit: '8',
    q: search,
  })}`

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'SaratogaShteibelHomes/1.0 (contact: saratogashteibel@gmail.com)',
        Accept: 'application/json',
      },
    })
    if (!upstream.ok) {
      return res.status(502).json({ error: 'Address lookup failed. Type the address manually.' })
    }
    const data = await upstream.json()
    const results = (data || []).map((row) => ({
      label: row.display_name,
      lat: row.lat,
      lon: row.lon,
    }))
    return res.status(200).json({ results })
  } catch (e) {
    console.error('rentals/address-search', e)
    return res.status(500).json({ error: 'Address lookup unavailable.' })
  }
}
