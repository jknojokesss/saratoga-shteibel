// Public: current Shabbos zmanim flyer URL (or null).
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ url: '/zmanim/this-week.pdf' })
}
