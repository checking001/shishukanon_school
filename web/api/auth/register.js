import bcrypt from 'bcryptjs';
import { readTable, appendRow, updateRow } from '../lib/sheetDB.js';
import { requireAuth } from '../lib/auth.js';
import { uploadFile } from '../lib/drive.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password, photo } = req.body || {};
  if (!username) return res.status(400).json({ error: 'Username দিন' });
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password কমপক্ষে ৬ অক্ষরের হতে হবে' });
  }

  try {
    const { rows } = await readTable('Admins');

    // Once an admin already exists, changing credentials requires being
    // logged in — an unauthenticated visitor on the login screen can no
    // longer take over the account. First-run registration stays open.
    if (rows.length > 0) {
      const user = requireAuth(req, res);
      if (!user) return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const photoUrl = photo ? await uploadFile(photo, `admin-${username}-${Date.now()}.jpg`) : '';

    const existing = rows.find((r) => r.username === username);
    if (existing) {
      await updateRow('Admins', (r) => r.username === username, {
        passwordHash,
        photo: photoUrl || existing.photo || '',
      });
    } else {
      await appendRow('Admins', { username, passwordHash, photo: photoUrl });
    }

    return res.status(200).json({ username, photo: photoUrl });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ error: 'সার্ভার সমস্যা, একটু পর আবার চেষ্টা করুন' });
  }
}
