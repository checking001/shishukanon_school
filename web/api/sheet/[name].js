import { readTable, appendRow } from '../lib/sheetDB.js';
import { uploadFile } from '../lib/drive.js';
import { requireAuth } from '../lib/auth.js';

// Which fields on which collections are photos/files (sent from the browser
// as base64 data URIs) that need to move to Google Drive before the row is
// saved — a Sheets cell can't hold a real photo (50,000-character limit).
const FILE_FIELDS = {
  Students: ['photo', 'guardianId'],
  Teachers: ['photo', 'idcard', 'certificate'],
};

// A few collections get their `id` generated here, mirroring the original
// app's id(prefix) helper. Everything else (Fees receipts, Salary receipts)
// generates its own id client-side before submit, same as before.
function computeId(name, body) {
  const ts = Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10);
  if (name === 'Students') return 'ST-' + ts;
  if (name === 'Teachers') return (body.type === 'employee' ? 'EMP-' : 'TC-') + ts;
  return undefined;
}

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const { name } = req.query;

  if (req.method === 'GET') {
    try {
      const { rows } = await readTable(name);
      return res.status(200).json(rows.map(({ _sheetRow, ...r }) => r));
    } catch (err) {
      console.error(`GET /api/sheet/${name} error`, err);
      return res.status(500).json({ error: 'ডেটা লোড করা যায়নি' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = { ...(req.body || {}) };

      for (const field of FILE_FIELDS[name] || []) {
        if (body[field] && body[field].startsWith('data:')) {
          body[field] = await uploadFile(body[field], `${name}-${field}-${Date.now()}.jpg`);
        }
      }

      const autoId = computeId(name, body);
      if (autoId && !body.id) body.id = autoId;

      const saved = await appendRow(name, body);
      return res.status(201).json(saved);
    } catch (err) {
      console.error(`POST /api/sheet/${name} error`, err);
      return res.status(500).json({ error: 'সংরক্ষণ করা যায়নি' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
