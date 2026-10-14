import Image from 'next/image'
import styles from '../styles/rentals.module.css'

function typeLabel(t) {
  if (t === 'sale') return 'For sale'
  if (t === 'rent') return 'For rent'
  return 'Listing'
}

export default function MarketListingsSection({ listings }) {
  if (!listings?.length) return null

  return (
    <section className={`${styles.marketSection} ${styles.splitSection}`} aria-labelledby="market-listings-heading">
      <div className={styles.marketSectionHeader}>
        <h2 id="market-listings-heading" className={styles.sectionTitle}>Buying</h2>
        <p className={styles.sectionIntro}>
          Area homes for sale (MLS prices, Oct 2026). Confirm on Zillow — links open in a new tab.
        </p>
      </div>
      <div className={styles.marketGrid} role="list">
          {listings.map((item) => (
            <a
              key={item.id}
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
                    alt=""
                    fill
                    sizes="(max-width: 520px) 100vw, 280px"
                    className={styles.marketCardImg}
                  />
                ) : (
                  <div className={styles.marketCardImgFallback} aria-hidden />
                )}
                <span className={styles.marketType}>{typeLabel(item.listingType)}</span>
              </div>
              <div className={styles.marketCardBody}>
                {item.priceLabel ? <span className={styles.marketPrice}>{item.priceLabel}</span> : null}
                <span className={styles.marketTitle}>{item.title}</span>
                {item.blurb ? <span className={styles.marketBlurb}>{item.blurb}</span> : null}
                <span className={styles.marketSource}>View on {item.source || 'site'} →</span>
              </div>
            </a>
          ))}
      </div>
    </section>
  )
}
