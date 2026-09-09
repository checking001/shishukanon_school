import { requireAuth } from '../_lib/auth.js'
import { callBot } from '../_lib/bot.js'

export default async function handler (req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  const user = requireAuth(req, res)
  if (!user) return
  try {
    const data = await callBot('/logout', { method: 'POST' })
    return res.status(200).json(data)
  } catch (err) {
    return res.status(err.status || 502).json({ error: err.message })
  }
}
