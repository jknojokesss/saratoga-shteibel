import { searchRentalAddresses } from '../../../lib/rentals/censusAddressSearch'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const q = String(req.query.q || '').trim()
  if (q.length < 3) {
    return res.status(200).json({ results: [] })
  }

  try {
    const results = await searchRentalAddresses(q)
    return res.status(200).json({ results })
  } catch (e) {
    console.error('rentals/address-search', e)
    return res.status(502).json({ error: 'Address lookup failed. You can still type the full address.' })
  }
}
