/**
 * Homes for sale or rent elsewhere (Zillow, Realtor.com, etc.).
 * Add rows here when you have links — deploy or ask in Cursor to update.
 *
 * listingType: 'sale' | 'rent'
 * source: short label shown on the card (e.g. Zillow)
 * imageUrl: path under /public or absolute https URL
 */
export const MARKET_LISTINGS = [
  {
    id: 'zillow-belmont-5302',
    title: '5302 Belmont Ct #5302 — 3 bed condo',
    url: 'https://www.zillow.com/homedetails/5302-Belmont-Ct-5302-Toms-River-NJ-08755/465746307_zpid/',
    imageUrl: '/market-listings/belmont.jpg',
    priceLabel: '$500,000',
    listingType: 'sale',
    source: 'Zillow',
    blurb: 'Palomino model, 1,929 sq ft, generator, full basement.',
  },
  {
    id: 'zillow-aqueduct-3703',
    title: '3703 Aqueduct Ct — 3 bed townhome',
    url: 'https://www.zillow.com/homedetails/3703-Aqueduct-Ct-Toms-River-NJ-08755/39572131_zpid/',
    imageUrl: '/market-listings/aqueduct.jpg',
    priceLabel: '$515,000',
    listingType: 'sale',
    source: 'Zillow',
    blurb: 'Two-story townhome near Rt 70 & GSP.',
  },
  {
    id: 'zillow-arlington-1103',
    title: '1103 Arlington Dr — 2 bed (Saratoga)',
    url: 'https://www.zillow.com/homedetails/1103-Arlington-Dr-Toms-River-NJ-08755/39571963_zpid/',
    imageUrl: '/market-listings/arlington.jpg',
    priceLabel: '$360,000',
    listingType: 'sale',
    source: 'Zillow',
    blurb: 'Updated North Dover townhouse. Also noted for rent on Zillow.',
  },
  {
    id: 'zillow-santa-anita-607',
    title: '607 Santa Anita Ln — 2 bed townhome',
    url: 'https://www.zillow.com/homedetails/607-Santa-Anita-Ln-Toms-River-NJ-08755/39571930_zpid/',
    imageUrl: '/market-listings/santa-anita.jpg',
    priceLabel: '$315,000',
    listingType: 'sale',
    source: 'Zillow',
    blurb: 'Patio, community pool, in-unit laundry.',
  },
  {
    id: 'zillow-walden-183',
    title: '183 Walden Woods Dr — 4 bed colonial',
    url: 'https://www.zillow.com/homedetails/183-Walden-Woods-Dr-Toms-River-NJ-08755/39571813_zpid/',
    imageUrl: '/market-listings/walden.jpg',
    priceLabel: '$1,349,999',
    listingType: 'sale',
    source: 'Zillow',
    blurb: 'Pool, putting green, finished basement.',
  },
]
