import { sheetsClient, SHEET_ID } from './google.js';

// Turns a 1-based column number into a spreadsheet column letter (1 -> A, 27 -> AA).
function colLetter(n) {
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// Reads a whole tab and returns { headers, rows } where each row is
// { ...fields, _sheetRow } — _sheetRow is the 1-based row number in the
// actual spreadsheet (row 1 is the header), used internally for update/delete.
export async function readTable(tab) {
  const sheets = sheetsClient();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: tab,
  });
  const values = data.values || [];
  const headers = values[0] || [];
  const rows = values.slice(1).map((r, i) => {
    const obj = { _sheetRow: i + 2 };
    headers.forEach((h, c) => { obj[h] = r[c] ?? ''; });
    return obj;
  });
  return { headers, rows };
}

export async function appendRow(tab, obj) {
  const sheets = sheetsClient();
  const { headers } = await readTable(tab);
  const row = headers.map((h) => (obj[h] ?? '').toString());
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
  return obj;
}

// Appends several rows in a single API call — used for bulk saves (e.g. attendance).
export async function appendRows(tab, objs) {
  if (!objs.length) return [];
  const sheets = sheetsClient();
  const { headers } = await readTable(tab);
  const values = objs.map((obj) => headers.map((h) => (obj[h] ?? '').toString()));
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
  return objs;
}

// Finds the first row where match(row) is true, merges `updates` into it,
// and writes the whole row back. Returns the merged row, or null if not found.
export async function updateRow(tab, match, updates) {
  const sheets = sheetsClient();
  const { headers, rows } = await readTable(tab);
  const target = rows.find(match);
  if (!target) return null;
  const merged = { ...target, ...updates };
  const values = headers.map((h) => (merged[h] ?? '').toString());
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A${target._sheetRow}:${colLetter(headers.length)}${target._sheetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
  delete merged._sheetRow;
  return merged;
}

// Deletes the first row where match(row) is true.
export async function deleteRow(tab, match) {
  const sheets = sheetsClient();
  const { rows } = await readTable(tab);
  const target = rows.find(match);
  if (!target) return false;
  const sheetId = await getTabGid(tab);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: target._sheetRow - 1, endIndex: target._sheetRow },
        },
      }],
    },
  });
  return true;
}

// Bulk upsert keyed by one or more fields — used by the Attendance "Save" button,
// which writes/updates one row per student in a single round trip.
export async function upsertMany(tab, records, keyFields) {
  const sheets = sheetsClient();
  const { headers, rows } = await readTable(tab);
  const sameKey = (a, b) => keyFields.every((k) => String(a[k]) === String(b[k]));

  const updates = [];
  const toAppend = [];
  for (const rec of records) {
    const existing = rows.find((r) => sameKey(r, rec));
    if (existing) {
      const merged = { ...existing, ...rec };
      updates.push({
        range: `${tab}!A${existing._sheetRow}:${colLetter(headers.length)}${existing._sheetRow}`,
        values: [headers.map((h) => (merged[h] ?? '').toString())],
      });
    } else {
      toAppend.push(headers.map((h) => (rec[h] ?? '').toString()));
    }
  }

  if (updates.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'USER_ENTERED', data: updates },
    });
  }
  if (toAppend.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${tab}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: toAppend },
    });
  }
  return records;
}

const gidCache = new Map();
async function getTabGid(tab) {
  if (gidCache.has(tab)) return gidCache.get(tab);
  const sheets = sheetsClient();
  const { data } = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  for (const s of data.sheets) {
    gidCache.set(s.properties.title, s.properties.sheetId);
  }
  if (!gidCache.has(tab)) throw new Error(`"${tab}" নামে কোনো শীট (tab) পাওয়া যায়নি`);
  return gidCache.get(tab);
}
