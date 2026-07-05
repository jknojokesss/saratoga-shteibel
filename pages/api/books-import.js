// Passcode-gated bulk import for the shul accounting staging tables.
// Only allows tables named books_* so it can't touch anything else.
// Used by a local script that parses CSVs and POSTs rows here.
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { passcode, table, rows, truncate } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })
  if (!table || !/^books_[a-z0-9_]+$/.test(table)) return res.status(400).json({ error: 'Invalid table (must be books_*).' })
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows must be an array.' })

  try {
    if (truncate) {
      const { error: delErr } = await supabaseAdmin.from(table).delete().gt('id', -1)
      if (delErr) throw delErr
    }
    if (rows.length === 0) return res.status(200).json({ inserted: 0, truncated: !!truncate })

    const { error } = await supabaseAdmin.from(table).insert(rows)
    if (error) throw error
    return res.status(200).json({ inserted: rows.length })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Import failed.' })
  }
}
