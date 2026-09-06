import { readTable, appendRow } from '../lib/sheetDB.js'
import { requireAuth } from '../lib/auth.js'

function computeId (name, body) {
  const ts =
    Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10)
  if (name === 'Students') return 'ST-' + ts
  if (name === 'Teachers')
    return (body.type === 'employee' ? 'EMP-' : 'TC-') + ts
  return undefined
}

export default async function handler (req, res) {
  const user = requireAuth(req, res)
  if (!user) return

  const { name } = req.query

  if (req.method === 'GET') {
    try {
      const { rows } = await readTable(name)
      return res.status(200).json(rows.map(({ _sheetRow, ...r }) => r))
    } catch (err) {
      console.error(`GET /api/sheet/${name} error`, err)
      return res.status(500).json({ error: 'ডেটা লোড করা যায়নি' })
    }
  }

  if (req.method === 'POST') {
    try {
      const body = { ...(req.body || {}) }
      const autoId = computeId(name, body)
      if (autoId && !body.id) body.id = autoId
      const saved = await appendRow(name, body)
      return res.status(201).json(saved)
    } catch (err) {
      console.error(`POST /api/sheet/${name} error`, err)
      return res.status(500).json({ error: 'সংরক্ষণ করা যায়নি' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
