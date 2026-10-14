import { fetchActiveListings } from '../../../lib/rentals/queries'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Cache-Control', 'no-store')
  try {
    const listings = await fetchActiveListings()
    return res.status(200).json({ listings })
  } catch (e) {
    console.error('rentals/list', e)
    return res.status(500).json({ error: 'Could not load listings.' })
  }
}
