
/**
 * MODULE: MANAJEMEN DATA AKADEMIK
 * Menangani CRUD Jurusan (Majors), Mata Pelajaran (Subjects), dan Kelas (Classes)
 * Copy paste isi file ini ke file "DataAkademik.gs" di Google Apps Script Editor.
 */

// --- MAJORS (JURUSAN) ---

function getAllMajors() {
  return getData(SHEETS.MAJORS);
}

function createMajor(payload) {
  const sheet = getSheetOrSetup(SHEETS.MAJORS);
  const majors = getData(SHEETS.MAJORS);
  
  if (majors.find(m => m.code === payload.code)) {
    throw new Error(`Jurusan dengan kode ${payload.code} sudah ada.`);
  }

  const newId = 'M_' + Date.now();
  // Header: ['id', 'code', 'name']
  sheet.appendRow([newId, payload.code, payload.name]);
  
  logSystem('ADMIN', `Created Major: ${payload.name}`);
  return { message: 'Major created successfully' };
}

function deleteMajor(id) {
  const sheet = getSheetOrSetup(SHEETS.MAJORS);
  const data = sheet.getDataRange().getValues();
  const idIndex = 0; // Column ID is at index 0

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      logSystem('ADMIN', `Deleted Major ID: ${id}`);
      return { message: 'Major deleted successfully' };
    }
  }
  throw new Error("Major ID not found");
}

// --- SUBJECTS (MATA PELAJARAN) ---

function getAllSubjects() {
  return getData(SHEETS.SUBJECTS);
}

function createSubject(payload) {
  const sheet = getSheetOrSetup(SHEETS.SUBJECTS);
  const subjects = getData(SHEETS.SUBJECTS);
  
  if (subjects.find(s => s.code === payload.code)) {
    throw new Error(`Mapel dengan kode ${payload.code} sudah ada.`);
  }

  const newId = 'SUB_' + Date.now();
  // Header: ['id', 'code', 'name', 'category']
  sheet.appendRow([newId, payload.code, payload.name, payload.category]);
  
  logSystem('ADMIN', `Created Subject: ${payload.name}`);
  return { message: 'Subject created successfully' };
}

function deleteSubject(id) {
  const sheet = getSheetOrSetup(SHEETS.SUBJECTS);
  const data = sheet.getDataRange().getValues();
  const idIndex = 0; // Column ID is at index 0

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      logSystem('ADMIN', `Deleted Subject ID: ${id}`);
      return { message: 'Subject deleted successfully' };
    }
  }
  throw new Error("Subject ID not found");
}

// --- CLASSES (DATA KELAS) ---

function getAllClasses() {
  const classes = getData(SHEETS.CLASSES);
  // Map internal keys to frontend expectation if needed, but current headers match
  return classes.map(c => ({
    id: c.id,
    name: c.name,
    level: c.level,
    major: c.majorId // Mapping majorId from sheet to 'major' prop in frontend if needed, or keep consistent
  }));
}

function createClass(payload) {
  const sheet = getSheetOrSetup(SHEETS.CLASSES);
  const classes = getData(SHEETS.CLASSES);
  
  // Validasi Nama Kelas Unik
  if (classes.find(c => c.name.toLowerCase() === payload.name.toLowerCase())) {
    throw new Error(`Kelas ${payload.name} sudah ada.`);
  }

  const newId = 'CLS_' + Date.now();
  // Header: ['id', 'name', 'level', 'majorId']
  sheet.appendRow([newId, payload.name, payload.level, payload.major]);
  
  logSystem('ADMIN', `Created Class: ${payload.name}`);
  return { message: 'Class created successfully' };
}

function deleteClass(id) {
  const sheet = getSheetOrSetup(SHEETS.CLASSES);
  const data = sheet.getDataRange().getValues();
  const idIndex = 0; 

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      logSystem('ADMIN', `Deleted Class ID: ${id}`);
      return { message: 'Class deleted successfully' };
    }
  }
  throw new Error("Class ID not found");
}
