
/**
 * MODULE: MANAJEMEN DATA AKADEMIK
 */

// --- MAJORS ---
function getAllMajors() { return getData(SHEETS.MAJORS); }

function createMajor(payload) {
  const sheet = getSheetOrSetup(SHEETS.MAJORS);
  const majors = getData(SHEETS.MAJORS);
  if (majors.find(m => m.code === payload.code)) throw new Error(`Kode ${payload.code} exist.`);
  const newId = 'M_' + Date.now();
  sheet.appendRow([newId, payload.code, payload.name]);
  invalidateCaches([SHEETS.MAJORS]);
  return { message: 'Success' };
}

function deleteMajor(id) {
  const sheet = getSheetOrSetup(SHEETS.MAJORS);
  deleteRowById(sheet, id);
  invalidateCaches([SHEETS.MAJORS]);
  return { message: 'Deleted' };
}

function updateMajor(payload) {
  const sheet = getSheetOrSetup(SHEETS.MAJORS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.id)) {
      sheet.getRange(i + 1, 2).setValue(payload.code);
      sheet.getRange(i + 1, 3).setValue(payload.name);
      invalidateCaches([SHEETS.MAJORS]);
      return { message: 'Updated' };
    }
  }
  throw new Error('Jurusan tidak ditemukan.');
}

// --- SUBJECTS ---
function getAllSubjects() { return getData(SHEETS.SUBJECTS); }

function createSubject(payload) {
  const sheet = getSheetOrSetup(SHEETS.SUBJECTS);
  const subjects = getData(SHEETS.SUBJECTS);
  if (subjects.find(s => s.code === payload.code)) throw new Error(`Mapel ${payload.code} exist.`);
  const newId = 'SUB_' + Date.now();
  sheet.appendRow([newId, payload.code, payload.name, payload.category]);
  invalidateCaches([SHEETS.SUBJECTS]);
  return { message: 'Success' };
}

function deleteSubject(id) {
  const sheet = getSheetOrSetup(SHEETS.SUBJECTS);
  deleteRowById(sheet, id);
  invalidateCaches([SHEETS.SUBJECTS]);
  return { message: 'Deleted' };
}

function updateSubject(payload) {
  const sheet = getSheetOrSetup(SHEETS.SUBJECTS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.id)) {
      sheet.getRange(i + 1, 2).setValue(payload.code);
      sheet.getRange(i + 1, 3).setValue(payload.name);
      sheet.getRange(i + 1, 4).setValue(payload.category);
      invalidateCaches([SHEETS.SUBJECTS]);
      return { message: 'Updated' };
    }
  }
  throw new Error('Mata pelajaran tidak ditemukan.');
}

/**
 * IMPORT SUBJECTS (NEW)
 * Payload: [{code, name, category}, ...]
 */
function importSubjects(subjectsList) {
  const sheet = getSheetOrSetup(SHEETS.SUBJECTS);
  const existingSubjects = getData(SHEETS.SUBJECTS);
  const existingCodes = new Set(existingSubjects.map(s => s.code ? String(s.code).trim().toUpperCase() : ''));
  
  const newRows = [];
  let count = 0;
  const timestamp = Date.now();
  
  subjectsList.forEach((s, index) => {
    const code = s.code ? String(s.code).trim().toUpperCase() : '';
    const name = s.name ? String(s.name).trim() : '';
    
    if (code && name && !existingCodes.has(code)) {
      newRows.push([
        'SUB_' + timestamp + '_' + index,
        code,
        name,
        s.category || 'Umum'
      ]);
      existingCodes.add(code);
      count++;
    }
  });
  
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }
  
  // Invalidate cache
  invalidateCaches([SHEETS.SUBJECTS]);
  
  return { success: true, message: `Berhasil mengimpor ${count} mata pelajaran.`, count: count };
}

// --- CLASSES ---
function getAllClasses() { return getData(SHEETS.CLASSES); }

function createClass(payload) {
  const sheet = getSheetOrSetup(SHEETS.CLASSES);
  const classes = getData(SHEETS.CLASSES);
  if (classes.find(c => c.name.toLowerCase() === payload.name.toLowerCase())) throw new Error(`Kelas ${payload.name} exist.`);
  const newId = 'CLS_' + Date.now();
  sheet.appendRow([newId, payload.name, payload.level, payload.major]);
  invalidateCaches([SHEETS.CLASSES]);
  return { message: 'Success' };
}

function deleteClass(id) {
  const sheet = getSheetOrSetup(SHEETS.CLASSES);
  deleteRowById(sheet, id);
  invalidateCaches([SHEETS.CLASSES]);
  return { message: 'Deleted' };
}

function updateClass(payload) {
  const sheet = getSheetOrSetup(SHEETS.CLASSES);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.id)) {
      sheet.getRange(i + 1, 2).setValue(payload.name);
      sheet.getRange(i + 1, 3).setValue(payload.level);
      sheet.getRange(i + 1, 4).setValue(payload.major);
      invalidateCaches([SHEETS.CLASSES]);
      return { message: 'Updated' };
    }
  }
  throw new Error('Kelas tidak ditemukan.');
}

// Helper
function deleteRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error("ID not found");
}
