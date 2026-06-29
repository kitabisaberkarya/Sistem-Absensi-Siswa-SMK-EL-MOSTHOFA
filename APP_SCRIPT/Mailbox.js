
/**
 * MODULE: SISTEM PESAN INTERNAL (MAILBOX)
 * Sheet: Messages
 * Header: id, from, fromName, to, subject, body, timestamp, isRead, isStarred
 */

const MESSAGES_SHEET = 'Messages';

function ensureMessagesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(MESSAGES_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(MESSAGES_SHEET);
    sheet.appendRow(['id', 'from', 'fromName', 'to', 'subject', 'body', 'timestamp', 'isRead', 'isStarred']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
  }
  return sheet;
}

function getMessages(userId) {
  const sheet = ensureMessagesSheet();
  if (sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const toIdx = headers.indexOf('to');
  const fromIdx = headers.indexOf('from');

  const result = data
    .filter(row => row.some(c => c !== ''))
    .filter(row => String(row[toIdx]) === String(userId) || String(row[fromIdx]) === String(userId))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return result;
}

function sendMessage(payload) {
  const sheet = ensureMessagesSheet();
  const id = 'MSG_' + Date.now();
  sheet.appendRow([
    id,
    payload.from,
    payload.fromName,
    payload.to,
    payload.subject,
    payload.body,
    new Date().toISOString(),
    false,
    false
  ]);
  invalidateCaches([MESSAGES_SHEET]);
  return { message: 'Pesan berhasil dikirim.', id };
}

function markMessageRead(messageId) {
  const sheet = ensureMessagesSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const readIdx = headers.indexOf('isRead');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(messageId)) {
      sheet.getRange(i + 1, readIdx + 1).setValue(true);
      return { message: 'OK' };
    }
  }
  return { message: 'Not found' };
}

function toggleStarMessage(messageId) {
  const sheet = ensureMessagesSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const starIdx = headers.indexOf('isStarred');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(messageId)) {
      const current = data[i][starIdx];
      sheet.getRange(i + 1, starIdx + 1).setValue(!current);
      return { message: 'OK', starred: !current };
    }
  }
  return { message: 'Not found' };
}

function deleteMessage(messageId) {
  const sheet = ensureMessagesSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(messageId)) {
      sheet.deleteRow(i + 1);
      return { message: 'Deleted' };
    }
  }
  throw new Error('Pesan tidak ditemukan.');
}
