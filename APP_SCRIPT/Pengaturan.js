
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
  CLASSES: 'Classes',
  SETTINGS: 'Settings' // NEW TABLE
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
  [SHEETS.CLASSES]: ['id', 'name', 'level', 'majorId'],
  [SHEETS.SETTINGS]: ['key', 'value', 'description'] // NEW HEADERS
};

// --- CACHING & LOCKING SYSTEM ---
const CACHE_TTL = 1800; // 30 menit dalam detik
const LOCK_WAIT_MS = 15000; // 15 Detik tunggu antrian

function getFromCache(key) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  if (cached) return JSON.parse(cached);
  return null;
}

function setToCache(key, data) {
  const cache = CacheService.getScriptCache();
  try {
    cache.put(key, JSON.stringify(data), CACHE_TTL);
  } catch (e) {
    // Jika data terlalu besar untuk cache, abaikan saja
    console.warn("Cache put failed: " + e.message);
  }
}

function invalidateCaches(sheetNames) {
  const cache = CacheService.getScriptCache();
  if (Array.isArray(sheetNames)) {
    cache.removeAll(sheetNames);
  } else {
    cache.remove(sheetNames);
  }
}

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
 * Dengan pembersihan header (trim) dan Caching
 */
function getData(sheetName) {
  // Cek Cache dulu
  const cachedData = getFromCache(sheetName);
  if (cachedData) return cachedData;

  const sheet = getSheetOrSetup(sheetName);
  if (sheet.getLastRow() < 2) return [];
  
  const data = sheet.getDataRange().getValues();
  // Ambil header dan bersihkan dari spasi ekstra
  const headers = data.shift().map(h => String(h).trim()); 
  
  const result = data
    .filter(row => row.some(cell => cell !== "" && cell !== null)) // ABAIKAN BARIS KOSONG
    .map(row => {
      let obj = {};
      headers.forEach((h, i) => {
        if (h) {
          obj[h] = row[i];
          if (h === 'Kelas') obj['className'] = row[i];
          if (h === 'Nama') obj['name'] = row[i];
        }
      });
      return obj;
    });

  // Simpan ke Cache
  setToCache(sheetName, result);
  return result;
}

function logSystem(user, action) {
  const sheet = getSheetOrSetup(SHEETS.LOGS);
  sheet.appendRow([Utilities.getUuid(), user, action, new Date(), 'Success']);
}
