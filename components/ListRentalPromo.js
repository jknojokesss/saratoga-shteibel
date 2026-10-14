import Link from 'next/link'
import styles from '../styles/listRentalPromo.module.css'

export default function ListRentalPromo({ compact = false }) {
  return (
    <aside className={compact ? `${styles.promo} ${styles.promoCompact}` : styles.promo} aria-label="List a rental">
      <p className={styles.newLabel}>New</p>
      <h2 className={styles.title}>List a rental near the shul</h2>
      <p className={styles.text}>
        Fill out a short form on the site — your email app opens with everything ready to send. We review it before it
        goes live on Homes.
      </p>
      <Link href="/homes/post-rental" className={styles.cta}>
        List your rental
      </Link>
    </aside>
  )
}
