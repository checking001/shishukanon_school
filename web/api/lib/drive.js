import { Readable } from 'stream';
import { driveClient } from './google.js';

/**
 * Uploads a base64 data-URI image to a Google Drive folder and returns a
 * public, hot-linkable URL for it.
 *
 * Why Drive and not a Sheets cell: a Google Sheets cell can hold at most
 * 50,000 characters. A real student/guardian photo, base64-encoded, is
 * usually 80,000–200,000+ characters — it simply won't fit. Drive has no
 * such limit and gives us a real URL to store in the sheet instead.
 *
 * Note: the service account itself has no meaningful Drive storage quota,
 * so GOOGLE_DRIVE_FOLDER_ID must point to a folder inside a real Google
 * account's Drive that has been *shared with the service account as
 * Editor* (see SETUP_GUIDE.md, Step 2). Uploads use that account's quota.
 */
export async function uploadFile(dataUri, filename) {
  if (!dataUri || !dataUri.startsWith('data:')) return '';
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID সেট করা নেই — ছবি আপলোড করা যাবে না। SETUP_GUIDE.md দেখুন।');
  }

  const match = dataUri.match(/^data:(.*?);base64,(.*)$/s);
  if (!match) throw new Error('অবৈধ ছবির ফরম্যাট (data URI প্রত্যাশিত ছিল)');
  const [, mimeType, base64] = match;
  const buffer = Buffer.from(base64, 'base64');

  const drive = driveClient();
  const { data } = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: 'id',
  });

  await drive.permissions.create({
    fileId: data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  // Google's stable thumbnail endpoint — embeds reliably in an <img src>.
  return `https://drive.google.com/thumbnail?id=${data.id}&sz=w1000`;
}
