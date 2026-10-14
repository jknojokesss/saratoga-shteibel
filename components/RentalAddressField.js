import { useEffect, useRef, useState } from 'react'
import styles from '../styles/rentalSubmit.module.css'

function mapsUrlForAddress(address) {
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`
}

export default function RentalAddressField({ value, onChange, required = true }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
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
        setSuggestions(d.results || [])
        setOpen((d.results || []).length > 0)
      } catch {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 280)
  }

  function pick(label) {
    setQuery(label)
    onChange(label)
    setOpen(false)
    setSuggestions([])
  }

  return (
    <div className={styles.field} ref={wrapRef}>
      <label className={styles.label} htmlFor="address">Street address *</label>
      <input
        id="address"
        required={required}
        className={styles.input}
        value={query}
        autoComplete="street-address"
        placeholder="Start typing — pick from maps"
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
      {loading ? <p className={styles.addressStatus}>Looking up address…</p> : null}
      {open && suggestions.length ? (
        <ul id="address-suggestions" className={styles.addressSuggestions} role="listbox">
          {suggestions.map((s) => (
            <li key={`${s.lat}-${s.lon}-${s.label}`}>
              <button type="button" className={styles.addressSuggestionBtn} onClick={() => pick(s.label)}>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {value?.trim() ? (
        <p className={styles.addressMapsLink}>
          <a href={mapsUrlForAddress(value)} target="_blank" rel="noreferrer">
            Open in Google Maps
          </a>
        </p>
      ) : null}
      <p className={styles.hint}>Choose a suggested address from the list when possible.</p>
    </div>
  )
}
