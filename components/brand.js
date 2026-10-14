/** Site palette (midnight / brass / paper — matches rentals). */
export const MIDNIGHT = '#161d25'
export const MIDNIGHT_2 = '#202a34'
export const NAVY = MIDNIGHT
export const NAVY_DEEP = '#121820'

export const BRASS = '#b08d4b'
export const BRASS_LO = '#8a6e39'
export const GOLD = BRASS
export const GOLD_LIGHT = '#d4bc8a'

export const PAPER = '#ecede8'
export const PAPER_HI = '#f6f6f2'
export const CREAM = PAPER_HI

export const INK = '#14181d'
export const SLATE = '#6e7a85'
export const MUTED = SLATE
export const BORDER = '#cdd0cb'

export const ADDRESS = '166 Woodleigh Place'
export const CITY = 'Toms River, NJ 08755'
export const FULL_ADDRESS = `${ADDRESS}, ${CITY}`
export const MAPS_QUERY = encodeURIComponent(FULL_ADDRESS)
export const MAPS_EMBED = `https://maps.google.com/maps?q=${MAPS_QUERY}&z=16&output=embed`
export const MAPS_LINK = `https://maps.google.com/?q=${MAPS_QUERY}`
export const PAYMENT_URL = 'https://saratoga-payment.vercel.app'
export const DONATE_FORM_URL = '/donate-form.html?v=donate12'
