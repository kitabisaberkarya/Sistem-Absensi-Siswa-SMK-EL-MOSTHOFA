
/**
 * @OnlyCurrentDoc (REMOVED: To allow DriveApp access for Backups)
 * MODULE: PENGATURAN SISTEM
 * Konfigurasi utama database dan schema
 */

// --- KONFIGURASI NAMA SHEET ---
const SHEETS = {
  USERS: 'Users',
  STUDENTS: 'Students',
  ATTENDANCE: 'Attendance_Log',
  LOGS: 'System_Logs'
};

// --- DEFINISI HEADER DATABASE ---
const SHEET_HEADERS = {
  [SHEETS.USERS]: ['id', 'name', 'email', 'password', 'role', 'nip', 'phone', 'subject', 'gender', 'status', 'avatar'],
  [SHEETS.STUDENTS]: ['id', 'name', 'nis', 'className', 'gender', 'parentPhone', 'address'],
  [SHEETS.ATTENDANCE]: ['log_id', 'date', 'classId', 'subject', 'teacherId', 'topic', 'studentId', 'studentName', 'status', 'note', 'timestamp'],
  [SHEETS.LOGS]: ['id', 'user', 'action', 'timestamp', 'status']
};

// --- UTILS: GLOBAL HELPERS (Digunakan di semua file) ---

/**
 * Mendapatkan Sheet atau membuatnya jika belum ada
 */
function getSheetOrSetup(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = SHEET_HEADERS[sheetName];
    
    if (headers) {
      // 1. Set Headers
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      
      // 2. Apply Validations
      if (sheetName === SHEETS.USERS) {
        _setValidation(sheet, "E2:E", ['TEACHER', 'COUNSELOR', 'PRINCIPAL', 'ADMIN']);
        _setValidation(sheet, "I2:I", ['L', 'P']);
        _setValidation(sheet, "J2:J", ['Active', 'Inactive']);
      } else if (sheetName === SHEETS.ATTENDANCE) {
        _setValidation(sheet, "I2:I", ['Hadir', 'Sakit', 'Izin', 'Alpha']);
      }
    }
  }
  return sheet;
}

/**
 * Helper Validation (Internal)
 */
function _setValidation(sheet, rangeA1, list) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(list, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(rangeA1).setDataValidation(rule);
}

/**
 * Mengambil semua data dari sheet sebagai Array of Objects
 */
function getData(sheetName) {
  const sheet = getSheetOrSetup(sheetName);
  if (sheet.getLastRow() < 2) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Hapus header
  
  return data.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
}

/**
 * Mencatat Log Sistem
 */
function logSystem(user, action) {
  const sheet = getSheetOrSetup(SHEETS.LOGS);
  sheet.appendRow([Utilities.getUuid(), user, action, new Date(), 'Success']);
}
