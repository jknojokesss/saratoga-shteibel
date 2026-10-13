const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { passcode } = req.body || {}
  if (!ADMIN_CODE) {
    return res.status(503).json({ error: 'Admin is not configured on this server.' })
  }
  if (passcode !== ADMIN_CODE) {
    return res.status(401).json({ error: 'Wrong passcode.' })
  }
  return res.status(200).json({ ok: true })
}
