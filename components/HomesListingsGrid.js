import { MarketListingCard } from './MarketListingsSection'
import { RentalListingCard } from './RentalsListingCards'
import styles from '../styles/rentals.module.css'

const WALDEN_INTRO = 'Separate community — not part of Saratoga Phase 1 or 2.'

function buildPhaseRows(rentals, market) {
  const walden = market.filter((l) => l.community === 'walden-woods')
  const saratoga = market.filter((l) => !l.community)

  return [
    {
      key: 'phase-1',
      title: 'Saratoga · Phase 1',
      rentals: rentals.filter((r) => r.phase === 1),
      sales: saratoga.filter((l) => l.phase === 1),
    },
    {
      key: 'phase-2',
      title: 'Saratoga · Phase 2',
      rentals: rentals.filter((r) => r.phase === 2),
      sales: saratoga.filter((l) => l.phase === 2),
    },
    {
      key: 'walden',
      title: 'Walden Woods',
      intro: WALDEN_INTRO,
      rentals: rentals.filter((r) => r.community === 'walden-woods'),
      sales: walden,
    },
    {
      key: 'other-rent',
      title: 'Community rentals',
      rentals: rentals.filter((r) => !r.phase && r.community !== 'walden-woods'),
      sales: [],
    },
  ].filter((row) => row.rentals.length > 0 || row.sales.length > 0)
}

export default function HomesListingsGrid({ rentals, marketListings }) {
  const rows = buildPhaseRows(rentals, marketListings)

  return (
    <div className={styles.homesPhasesStack}>
      {rows.map((row) => (
        <section key={row.key} className={styles.homesPhaseRow} aria-label={row.title}>
          <h3 className={styles.marketPhaseTitle}>{row.title}</h3>
          {row.intro ? <p className={styles.homesPhaseIntro}>{row.intro}</p> : null}
          <div className={`${styles.homesPhaseCol} ${styles.buyingCol}`} aria-label="Rentals">
            {row.rentals.map((item) => (
              <RentalListingCard key={item.id} item={item} />
            ))}
          </div>
          <div className={`${styles.homesPhaseCol} ${styles.buyingCol}`} aria-label="Homes for sale">
            {row.sales.map((item) => (
              <MarketListingCard key={item.id} item={item} wideGrid={false} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
