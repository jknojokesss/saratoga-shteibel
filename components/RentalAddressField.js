import { useEffect, useRef, useState } from 'react'
import { formatWalkToShul } from '../lib/rentals/walkToShul'
import styles from '../styles/rentalSubmit.module.css'

function mapsUrlForAddress(address) {
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`
}

export default function RentalAddressField({ value, onChange, onWalkToShulChange, required = true }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [walkHint, setWalkHint] = useState('')
  const debounceRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function scheduleSearch(text) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = text.trim()
    setVerified(false)
    setWalkHint('')
    onWalkToShulChange?.('')
    if (trimmed.length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/rentals/address-search?q=${encodeURIComponent(trimmed)}`)
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'Lookup failed')
        const next = d.results || []
        setSuggestions(next)
        setOpen(next.length > 0)
      } catch {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 320)
  }

  function pick(suggestion) {
    setQuery(suggestion.label)
    onChange(suggestion.label)
    setVerified(true)
    if (suggestion.lat != null && suggestion.lon != null) {
      const hint = formatWalkToShul(suggestion.lat, suggestion.lon)
      setWalkHint(hint)
      onWalkToShulChange?.(hint)
    } else {
      setWalkHint('')
      onWalkToShulChange?.('')
    }
    setOpen(false)
    setSuggestions([])
  }

  const showMaps = Boolean(value?.trim() && (verified || /\d/.test(value)))

  return (
    <div className={styles.field} ref={wrapRef}>
      <label className={styles.label} htmlFor="address">
        Address {required ? '*' : ''}
      </label>
      <div className={styles.addressInputWrap}>
        <input
          id="address"
          required={required}
          className={`${styles.input}${open && suggestions.length ? ` ${styles.inputWithSuggestions}` : ''}`}
          value={query}
          autoComplete="street-address"
          placeholder="e.g. 12 Saratoga Pl"
          onChange={(e) => {
            const next = e.target.value
            setQuery(next)
            onChange(next)
            scheduleSearch(next)
          }}
          onFocus={() => {
            if (suggestions.length) setOpen(true)
          }}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="address-suggestions"
        />
        {loading ? <span className={styles.addressSpinner} aria-hidden="true" /> : null}
      </div>
      {open && suggestions.length ? (
        <ul id="address-suggestions" className={styles.addressSuggestions} role="listbox">
          {suggestions.map((s) => (
            <li key={`${s.lat}-${s.lon}-${s.label}`}>
              <button type="button" className={styles.addressSuggestionBtn} onClick={() => pick(s)}>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {walkHint ? <p className={styles.addressWalkHint}>{walkHint}</p> : null}
      {showMaps ? (
        <p className={styles.addressMapsLink}>
          <a href={mapsUrlForAddress(value)} target="_blank" rel="noreferrer">
            View on map
          </a>
        </p>
      ) : null}
    </div>
  )
}
