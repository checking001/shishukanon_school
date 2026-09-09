import bcrypt from 'bcryptjs'
import { readTable } from '../_lib/sheetDB.js'
import { signToken } from '../_lib/auth.js'

export default async function handler (req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: 'Username ও Password দিন' })
  }

  try {
    const { rows } = await readTable('Admins')
    const admin = rows.find(r => r.username === username)

    let ok = false
    let photo = ''
    if (admin) {
      ok = await bcrypt.compare(password, admin.passwordHash || '')
      photo = admin.photo || ''
    } else if (rows.length === 0) {
      // No admin registered yet anywhere — fall back to the bootstrap
      // credentials from environment variables (first-run only).
      ok =
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    }

    if (!ok)
      return res.status(401).json({ error: 'ইউজারনেম বা পাসওয়ার্ড ভুল' })

    const token = signToken({ username })
    return res.status(200).json({ token, username, photo })
  } catch (err) {
    console.error('login error', err)
    return res
      .status(500)
      .json({ error: 'সার্ভার সমস্যা, একটু পর আবার চেষ্টা করুন' })
  }
}
