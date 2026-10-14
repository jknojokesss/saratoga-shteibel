import Image from 'next/image'
import styles from '../styles/rentals.module.css'

function typeLabel(t) {
  if (t === 'sale') return 'For sale'
  if (t === 'rent') return 'For rent'
  return 'Listing'
}

function splitTitle(title) {
  if (!title) return { headline: '', detail: '' }
  const idx = title.indexOf(' — ')
  if (idx === -1) return { headline: title, detail: '' }
  return { headline: title.slice(0, idx), detail: title.slice(idx + 3) }
}

function MarketCard({ item, wideGrid }) {
  const { headline, detail } = splitTitle(item.title)
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.marketCard}
      role="listitem"
    >
      <div className={styles.marketCardMedia}>
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={headline || item.title}
            fill
            sizes={wideGrid ? '(max-width: 900px) 100vw, 360px' : '(max-width: 900px) 100vw, 42vw'}
            className={styles.marketCardImg}
          />
        ) : (
          <div className={styles.marketCardImgFallback} aria-hidden />
        )}
        <div className={styles.marketCardShade} aria-hidden />
        <span className={styles.marketType}>{typeLabel(item.listingType)}</span>
        {item.community === 'walden-woods' ? (
          <span className={styles.marketCommunityBadge}>Walden Woods</span>
        ) : item.phase ? (
          <span className={styles.marketPhaseBadge}>Phase {item.phase}</span>
        ) : null}
        {item.priceLabel ? <span className={styles.marketPriceOnPhoto}>{item.priceLabel}</span> : null}
      </div>
      <div className={styles.marketCardBody}>
        <span className={styles.marketHeadline}>{headline}</span>
        {detail ? <span className={styles.marketDetail}>{detail}</span> : null}
        {item.walkToShul ? <span className={styles.marketWalk}>{item.walkToShul}</span> : null}
        {item.blurb ? <span className={styles.marketBlurb}>{item.blurb}</span> : null}
        <span className={styles.marketCta}>
          View on {item.source || 'Zillow'}
          <span className={styles.marketCtaArrow} aria-hidden>→</span>
        </span>
      </div>
    </a>
  )
}

function PhaseBlock({ phase, listings, wideGrid }) {
  if (!listings.length) return null
  return (
    <div className={styles.marketPhaseBlock}>
      <h3 className={styles.marketPhaseTitle}>Saratoga · Phase {phase}</h3>
      <div className={wideGrid ? styles.marketGridWide : styles.marketGrid} role="list">
        {listings.map((item) => (
          <MarketCard key={item.id} item={item} wideGrid={wideGrid} />
        ))}
      </div>
    </div>
  )
}

function CommunityBlock({ listings, wideGrid }) {
  if (!listings.length) return null
  return (
    <div className={styles.marketCommunityBlock}>
      <h3 className={styles.marketCommunityTitle}>Walden Woods</h3>
      <p className={styles.marketCommunityIntro}>Separate community — not part of Saratoga Phase 1 or 2.</p>
      <div className={wideGrid ? styles.marketGridWide : styles.marketGrid} role="list">
        {listings.map((item) => (
          <MarketCard key={item.id} item={item} wideGrid={wideGrid} />
        ))}
      </div>
    </div>
  )
}

export default function MarketListingsSection({ listings, contentOnly = false, wideGrid = false }) {
  if (!listings?.length) return contentOnly ? <div className={styles.listingsCol} /> : null

  const colClass = wideGrid
    ? `${styles.listingsCol} ${styles.buyingCol} ${styles.buyingColWide}`
    : `${styles.listingsCol} ${styles.buyingCol}`

  const saratoga = listings.filter((l) => !l.community)
  const walden = listings.filter((l) => l.community === 'walden-woods')
  const phase1 = saratoga.filter((l) => l.phase === 1)
  const phase2 = saratoga.filter((l) => l.phase === 2)

  const grid = (
    <div className={styles.marketPhases}>
      <PhaseBlock phase={1} listings={phase1} wideGrid={wideGrid} />
      <PhaseBlock phase={2} listings={phase2} wideGrid={wideGrid} />
      <CommunityBlock listings={walden} wideGrid={wideGrid} />
    </div>
  )

  if (contentOnly) {
    return <div className={colClass}>{grid}</div>
  }

  return (
    <section className={`${styles.marketSection} ${styles.splitSection}`} aria-labelledby="market-listings-heading">
      <div className={styles.marketSectionHeader}>
        <h2 id="market-listings-heading" className={styles.sectionTitle}>Buying</h2>
        <p className={styles.sectionIntro}>
          Area homes for sale (MLS prices, Oct 2026). Confirm on Zillow — links open in a new tab.
        </p>
      </div>
      <div className={colClass}>{grid}</div>
    </section>
  )
}
