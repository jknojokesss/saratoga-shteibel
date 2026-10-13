import { getShabbosScheduleUrls } from '../../../lib/shabbosSchedule'

// Public: current Shabbos zmanim flyer URLs (uploaded or static fallback).
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const urls = await getShabbosScheduleUrls()
  return res.status(200).json({ ...urls, url: urls.scheduleUrl })
}
