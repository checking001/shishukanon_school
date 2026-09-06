import { google } from 'googleapis'

let _sheets = null

function getAuth () {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  if (!email || !key) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY environment variable missing'
    )
  }
  return new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
}

export function sheetsClient () {
  if (!_sheets) _sheets = google.sheets({ version: 'v4', auth: getAuth() })
  return _sheets
}

function extractSheetId (raw) {
  if (!raw) return raw
  const match = raw.match(/\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : raw.trim()
}

export const SHEET_ID = extractSheetId(process.env.GOOGLE_SHEET_ID)
