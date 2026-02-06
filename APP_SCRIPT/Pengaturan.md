

/**
 * MODULE: PENGATURAN SISTEM
 * Konfigurasi utama database dan schema
 */

// --- KONFIGURASI NAMA SHEET ---
const SHEETS = {
  USERS: 'Users',
  STUDENTS: 'Students',
  ATTENDANCE: 'Attendance_Log',
  LOGS: 'System_Logs',
  MAJORS: 'Majors',
  SUBJECTS: 'Subjects',
  CLASSES: 'Classes'
};

// --- DEFINISI HEADER DATABASE ---
// Pastikan urutan ini SAMA dengan yang ada di Google Sheet
const SHEET_HEADERS = {
  [SHEETS.USERS]: ['id', 'name', 'email', 'password', 'role', 'nip', 'phone', 'subject', 'gender', 'status', 'avatar'],
  [SHEETS.STUDENTS]: ['id', 'name', 'nis', 'className', 'gender', 'parentPhone', 'address'],
  [SHEETS.ATTENDANCE]: ['log_id', 'date', 'classId', 'subject', 'teacherId', 'topic', 'studentId', 'studentName', 'status', 'note', 'timestamp'],
  [SHEETS.LOGS]: ['id', 'user', 'action', 'timestamp', 'status'],
  [SHEETS.MAJORS]: ['id', 'code', 'name'],
  [SHEETS.SUBJECTS]: ['id', 'code', 'name', 'category'],
  [SHEETS.CLASSES]: ['id', 'name', 'level', 'majorId']
};

// --- UTILS: GLOBAL HELPERS ---

function getSheetOrSetup(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = SHEET_HEADERS[sheetName];
    if (headers) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }
  }
  return sheet;
}

/**
 * Mengambil semua data dari sheet sebagai Array of Objects
 * Dengan pembersihan header (trim)
 */
function getData(sheetName) {
  const sheet = getSheetOrSetup(sheetName);
  if (sheet.getLastRow() < 2) return [];
  
  const data = sheet.getDataRange().getValues();
  // Ambil header dan bersihkan dari spasi ekstra
  const headers = data.shift().map(h => String(h).trim()); 
  
  return data.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      // Map header value ke object key
      // Jika header kosong, skip
      if (h) {
         obj[h] = row[i];
         // Fallback alias (optional)
         if (h === 'Kelas') obj['className'] = row[i];
         if (h === 'Nama') obj['name'] = row[i];
      }
    });
    return obj;
  });
}

function logSystem(user, action) {
  const sheet = getSheetOrSetup(SHEETS.LOGS);
  sheet.appendRow([Utilities.getUuid(), user, action, new Date(), 'Success']);
}
