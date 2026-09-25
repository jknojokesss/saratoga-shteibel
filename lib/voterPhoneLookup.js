// Match invoice buyer names to shul_vote_codes / shul_vote_eligible phones.

export function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function mergeVoterRows(codes, eligible) {
  const seen = new Set()
  const out = []
  for (const row of [...(codes || []), ...(eligible || [])]) {
    const phone = String(row.phone || '').replace(/\D/g, '')
    if (!phone || !row.name) continue
    const key = phone + '|' + normalizeName(row.name)
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ name: row.name, phone: row.phone })
  }
  return out
}

export function lookupVoterPhone(buyerName, voters) {
  const bn = normalizeName(buyerName)
  if (!bn || !voters?.length) return ''

  for (const v of voters) {
    if (normalizeName(v.name) === bn) return v.phone
  }

  const parts = bn.split(' ')
  if (parts.length === 1 && parts[0].length >= 4) {
    const last = parts[0]
    const hits = voters.filter((v) => {
      const vp = normalizeName(v.name).split(' ')
      return vp[vp.length - 1] === last || vp.includes(last)
    })
    if (hits.length === 1) return hits[0].phone
  }

  for (const v of voters) {
    const vn = normalizeName(v.name)
    if (vn.includes(bn) || bn.includes(vn)) return v.phone
  }

  const first = parts[0]
  if (first.length >= 3) {
    const hits = voters.filter((v) => {
      const vn = normalizeName(v.name)
      return vn === first || vn.startsWith(first + ' ')
    })
    if (hits.length === 1) return hits[0].phone
  }

  return ''
}
