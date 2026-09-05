import { requireAuth } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = requireAuth(req, res);
  if (!user) return;

  const { to, message, studentId } = req.body || {};
  if (!to || !message) return res.status(400).json({ error: 'to ও message দিন' });

  const botUrl = process.env.WHATSAPP_BOT_URL;
  const botSecret = process.env.WHATSAPP_BOT_SECRET;
  if (!botUrl) {
    return res.status(503).json({ error: 'WHATSAPP_BOT_URL সেট করা নেই — বট ডিপ্লয় করে .env-এ ঠিকানা দিন' });
  }

  try {
    const r = await fetch(`${botUrl}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${botSecret}` },
      body: JSON.stringify({ to, message, studentId }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data.error || 'বট থেকে মেসেজ পাঠানো যায়নি' });
    return res.status(200).json(data);
  } catch (err) {
    console.error('notify/whatsapp error', err);
    return res.status(502).json({ error: 'WhatsApp বট-এ সংযোগ করা যায়নি: ' + err.message });
  }
}
