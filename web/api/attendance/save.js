import { upsertMany } from '../lib/sheetDB.js';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = requireAuth(req, res);
  if (!user) return;

  const { records } = req.body || {};
  if (!Array.isArray(records) || !records.length) {
    return res.status(400).json({ error: 'records দিন' });
  }

  try {
    const saved = await upsertMany('Attendance', records, ['date', 'studentId']);
    return res.status(200).json(saved);
  } catch (err) {
    console.error('attendance/save error', err);
    return res.status(500).json({ error: 'সংরক্ষণ করা যায়নি' });
  }
}
