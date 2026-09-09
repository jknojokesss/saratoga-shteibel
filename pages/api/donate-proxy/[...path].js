const UPSTREAM = 'https://saratoga-payment.vercel.app/api'
const ALLOWED = new Set(['pay', 'sponsor-slots', 'donorsfund', 'config'])

export default async function handler(req, res) {
  const path = [].concat(req.query.path || []).join('/')
  if (!ALLOWED.has(path)) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const headers = { accept: req.headers.accept || 'application/json' }
  if (req.headers['content-type']) headers['content-type'] = req.headers['content-type']

  const init = { method: req.method, headers }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})
  }

  try {
    const upstream = await fetch(`${UPSTREAM}/${path}`, init)
    const text = await upstream.text()
    const contentType = upstream.headers.get('content-type') || 'application/json'
    res.setHeader('content-type', contentType)
    res.setHeader('cache-control', 'no-store')
    res.status(upstream.status).send(text)
  } catch (err) {
    res.status(502).json({ error: 'Payment service unavailable' })
  }
}
