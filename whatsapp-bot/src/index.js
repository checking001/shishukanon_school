import express from 'express'
import QRCode from 'qrcode'
import pino from 'pino'
import { MongoClient } from 'mongodb'
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'
import { useMongoAuthState } from './authState.js'
import { enqueueSend, queueLength } from './queue.js'

const PORT = process.env.PORT || 3000
const BOT_SECRET = process.env.BOT_SECRET
const MONGODB_URI = process.env.MONGODB_URI
if (!BOT_SECRET) throw new Error('BOT_SECRET environment variable missing')
if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable missing')

const logger = pino({ level: process.env.LOG_LEVEL || 'warn' })
let connectedNumber = null // কোন নম্বর দিয়ে সংযুক্ত আছে, Settings পেজে দেখানোর জন্য
let currentClearState = null // Logout/Change Number বাটনের জন্য বর্তমান clearState() রেফারেন্স

let sock = null
let latestQR = null // pairing-এর সময় দেখানোর জন্য সর্বশেষ QR string
let connectionState = 'connecting' // 'connecting' | 'open' | 'close'

function toJid (rawNumber) {
  let n = String(rawNumber || '').replace(/\D/g, '')
  if (n.startsWith('01')) n = '88' + n // বাংলাদেশি লোকাল নম্বর -> কান্ট্রি কোডসহ
  return n + '@s.whatsapp.net'
}

async function startBot () {
  const mongo = new MongoClient(MONGODB_URI)
  await mongo.connect()
  const authCollection = mongo.db('shishu_kanon').collection('wa_auth')
  const { state, saveCreds, clearState } = await useMongoAuthState(
    authCollection
  )
  currentClearState = clearState

  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    // WhatsApp মাঝে মাঝে সাধারণ "web" browser signature নতুন device pairing-এ
    // reject করে (২০২৬-এর শুরু থেকে বেশ কিছু রিপোর্ট আছে) — macOS পরিচয় দিলে
    // pairing বেশি নির্ভরযোগ্যভাবে হয় বলে দেখা গেছে।
    browser: Browsers.macOS('Desktop'),
    printQRInTerminal: false,
    syncFullHistory: false
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async update => {
    const { connection, qr, lastDisconnect } = update
    if (qr) latestQR = qr
    if (connection) connectionState = connection

    if (connection === 'open') {
      latestQR = null
      connectedNumber = sock.user?.id?.split(':')[0]?.split('@')[0] || null
      logger.info('WhatsApp connected')
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      connectedNumber = null
      const loggedOut = statusCode === DisconnectReason.loggedOut
      logger.warn({ statusCode, loggedOut }, 'WhatsApp connection closed')
      if (loggedOut) {
        await clearState()
        latestQR = null
      }
      setTimeout(startBot, 4000)
    }
  })
}

async function sendMessage ({ to, message }) {
  if (connectionState !== 'open') {
    throw new Error(
      'WhatsApp বট এখনো connected না — /qr পেজ থেকে QR স্ক্যান করুন।'
    )
  }
  await sock.sendMessage(toJid(to), { text: message })
  return { sent: true }
}

// ==== HTTP API ====
const app = express()
app.use(express.json())

function requireSecret (req, res, next) {
  const auth = req.headers.authorization || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null
  const key = req.query.key || req.headers['x-bot-secret'] || bearer
  if (key !== BOT_SECRET) return res.status(401).send('Unauthorized')
  next()
}

app.get('/health', (req, res) => {
  res.json({ status: connectionState, queue: queueLength() })
})
app.get('/status', requireSecret, (req, res) => {
  res.json({ connected: connectionState === 'open', number: connectedNumber })
})

app.get('/qr-data', requireSecret, async (req, res) => {
  if (connectionState === 'open') {
    return res.json({
      connected: true,
      number: connectedNumber,
      qrDataUrl: null
    })
  }
  if (!latestQR) {
    return res.json({ connected: false, number: null, qrDataUrl: null })
  }
  const qrDataUrl = await QRCode.toDataURL(latestQR)
  res.json({ connected: false, number: null, qrDataUrl })
})

app.post('/logout', requireSecret, async (req, res) => {
  try {
    if (sock) {
      try {
        await sock.logout()
      } catch {
        /* আগে থেকে বিচ্ছিন্ন থাকলে এরর হতে পারে, নিরাপদে উপেক্ষা */
      }
    } else if (currentClearState) {
      await currentClearState()
    }
    res.json({ loggedOut: true })
  } catch (err) {
    logger.error(err, 'logout failed')
    res.status(500).json({ error: err.message })
  }
})

app.get('/qr', requireSecret, async (req, res) => {
  if (connectionState === 'open') {
    return res.send('<h2>✅ WhatsApp আগে থেকেই Connected আছে।</h2>')
  }
  if (!latestQR) {
    res.set('Refresh', '3')
    return res.send(
      '<h2>QR তৈরি হচ্ছে… এই পেজটা কয়েক সেকেন্ড পর নিজে থেকেই রিফ্রেশ হবে।</h2>'
    )
  }
  const dataUrl = await QRCode.toDataURL(latestQR)
  res.send(`
    <html><head><meta http-equiv="refresh" content="20"></head>
    <body style="font-family:sans-serif;text-align:center;padding:30px">
      <h2>WhatsApp দিয়ে এই QR কোডটা স্ক্যান করুন</h2>
      <p>WhatsApp → Settings → Linked Devices → Link a Device</p>
      <img src="${dataUrl}" style="width:280px;height:280px" />
      <p style="color:#888">প্রতি ২০ সেকেন্ডে নতুন QR আসবে যতক্ষণ না স্ক্যান করা হয়</p>
    </body></html>
  `)
})

app.post('/send', requireSecret, async (req, res) => {
  const { to, message } = req.body || {}
  if (!to || !message)
    return res.status(400).json({ error: 'to এবং message দিন' })
  if (connectionState !== 'open') {
    return res.status(503).json({
      error: 'WhatsApp বট এখনো connected না — /qr পেজ থেকে QR স্ক্যান করুন।'
    })
  }
  const position = enqueueSend(sendMessage, { to, message }, (err, result) => {
    if (err) logger.error({ to, err: err.message }, 'send failed')
    else logger.info({ to }, 'message sent')
  })
  res.json({ queued: true, position })
})

app.listen(PORT, () => logger.info(`WhatsApp bot HTTP server on :${PORT}`))
startBot().catch(err => {
  logger.error(err, 'failed to start WhatsApp bot')
  process.exit(1)
})
