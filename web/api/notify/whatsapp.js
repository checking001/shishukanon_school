import { requireAuth } from '../_lib/auth.js'
import { callBot } from '../_lib/bot.js'

export default async function handler (req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  const user = requireAuth(req, res)
  if (!user) return

  const { to, message, studentId } = req.body || {}
  if (!to || !message)
    return res.status(400).json({ error: 'to ও message দিন' })

  try {
    const data = await callBot('/send', {
      method: 'POST',
      body: { to, message, studentId }
    })
    return res.status(200).json(data)
  } catch (err) {
    console.error('notify/whatsapp error', err)
    return res.status(err.status || 502).json({ error: err.message })
  }
}
