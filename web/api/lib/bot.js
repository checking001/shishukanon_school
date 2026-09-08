export async function callBot (path, { method = 'GET', body } = {}) {
  const botUrl = process.env.WHATSAPP_BOT_URL
  const botSecret = process.env.WHATSAPP_BOT_SECRET
  if (!botUrl) {
    const err = new Error(
      'WHATSAPP_BOT_URL সেট করা নেই — বট ডিপ্লয় করে .env-এ ঠিকানা দিন'
    )
    err.status = 503
    throw err
  }
  let res
  try {
    res = await fetch(`${botUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${botSecret}`
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000)
    })
  } catch (err) {
    const e = new Error('WhatsApp বট-এ সংযোগ করা যায়নি: ' + err.message)
    e.status = 502
    throw e
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'বট থেকে সাড়া পাওয়া যায়নি')
    err.status = res.status
    throw err
  }
  return data
}
