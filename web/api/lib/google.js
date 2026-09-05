import { google } from 'googleapis';

let _sheets = null;
let _drive = null;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY environment variable missing');
  }
  return new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
}

export function sheetsClient() {
  if (!_sheets) _sheets = google.sheets({ version: 'v4', auth: getAuth() });
  return _sheets;
}

export function driveClient() {
  if (!_drive) _drive = google.drive({ version: 'v3', auth: getAuth() });
  return _drive;
}

export const SHEET_ID = process.env.GOOGLE_SHEET_ID;
