import { geocodeRentalAddress } from '../../../lib/rentals/censusAddressSearch'
import { formatWalkToShul } from '../../../lib/rentals/walkToShul'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const address = String(req.query.address || '').trim()
  if (!address) return res.status(200).json({ distance_to_shul: '' })

  try {
    const hit = await geocodeRentalAddress(address)
    if (!hit?.lat || !hit?.lon) {
      return res.status(200).json({ distance_to_shul: '' })
    }
    return res.status(200).json({ distance_to_shul: formatWalkToShul(hit.lat, hit.lon) })
  } catch (e) {
    console.error('rentals/walk-to-shul', e)
    return res.status(200).json({ distance_to_shul: '' })
  }
}
