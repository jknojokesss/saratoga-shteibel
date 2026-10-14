import styles from '../styles/siteHero.module.css'

export default function PageHero({ kicker, title, subtitle, children }) {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.heroSub}>{subtitle}</p> : null}
        {children ? <div className={styles.heroActions}>{children}</div> : null}
      </div>
    </header>
  )
}
