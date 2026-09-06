import { updateRow, deleteRow } from '../../lib/sheetDB.js'
import { requireAuth } from '../../lib/auth.js'

export default async function handler (req, res) {
  const user = requireAuth(req, res)
  if (!user) return

  const { name, id } = req.query

  if (req.method === 'PUT') {
    try {
      const body = { ...(req.body || {}) }
      const updated = await updateRow(name, r => r.id === id, body)
      if (!updated)
        return res.status(404).json({ error: 'রেকর্ড খুঁজে পাওয়া যায়নি' })
      return res.status(200).json(updated)
    } catch (err) {
      console.error(`PUT /api/sheet/${name}/${id} error`, err)
      return res.status(500).json({ error: 'আপডেট করা যায়নি' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const ok = await deleteRow(name, r => r.id === id)
      if (!ok)
        return res.status(404).json({ error: 'রেকর্ড খুঁজে পাওয়া যায়নি' })
      return res.status(200).json({ deleted: true })
    } catch (err) {
      console.error(`DELETE /api/sheet/${name}/${id} error`, err)
      return res.status(500).json({ error: 'মুছে ফেলা যায়নি' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
