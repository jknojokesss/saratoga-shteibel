import { geocodeRentalAddress } from './censusAddressSearch'

/** Saratoga Shteibel — 166 Woodleigh Pl, Toms River, NJ (Census geocode). */
export const SHUL_COORDS = { lat: 40.041785062214, lon: -74.244056518112 }

const WALK_MPH = 3

function toRad(deg) {
  return (deg * Math.PI) / 180
}

export function milesBetween(lat1, lon1, lat2, lon2) {
  const R = 3958.8
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatWalkToShul(fromLat, fromLon) {
  const mi = milesBetween(fromLat, fromLon, SHUL_COORDS.lat, SHUL_COORDS.lon)
  const walkMin = Math.max(1, Math.round((mi / WALK_MPH) * 60))
  const miLabel = mi < 0.1 ? mi.toFixed(2) : mi < 10 ? (Math.round(mi * 10) / 10).toFixed(1) : String(Math.round(mi))
  return `~${walkMin} min walk · ~${miLabel} mi to shul`
}

export async function enrichListingWithWalkToShul(data) {
  if (!data || data.distance_to_shul?.trim()) return data
  const address = data.address?.trim()
  if (!address) return data

  const hit = await geocodeRentalAddress(address)
  if (hit?.lat != null && hit?.lon != null) {
    data.distance_to_shul = formatWalkToShul(hit.lat, hit.lon)
  }
  return data
}
