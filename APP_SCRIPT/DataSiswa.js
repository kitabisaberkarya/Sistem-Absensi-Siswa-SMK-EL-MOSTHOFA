
/**
 * MODULE: MANAJEMEN SISWA
 */

function getStudentsByClass(className) {
  const students = getData(SHEETS.STUDENTS);
  if (!className) return [];
  
  // Normalisasi yang lebih cerdas: hapus spasi, simbol, dan case-insensitive
  const normalize = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = normalize(className);
  
  return students.filter(s => {
    // Cek di berbagai kemungkinan nama kolom
    const rawClass = s.className || s.Kelas || s.kelas || s.class || '';
    return normalize(rawClass) === target;
  });
}

function getAllStudents() {
  return getData(SHEETS.STUDENTS);
}

function createStudent(payload) {
  const sheet = getSheetOrSetup(SHEETS.STUDENTS);
  const students = getData(SHEETS.STUDENTS);
  
  // Validasi NIS Unik
  if (students.find(s => String(s.nis) === String(payload.nis))) {
    throw new Error(`NIS ${payload.nis} sudah terdaftar.`);
  }

  const newId = 'S' + Date.now();
  sheet.appendRow([
    newId,
    payload.name,
    payload.nis,
    payload.className,
    payload.gender,
    payload.parentPhone,
    payload.address
  ]);
  
  return { message: 'Student created successfully' };
}

function updateStudent(payload) {
  const sheet = getSheetOrSetup(SHEETS.STUDENTS);
  const data = sheet.getDataRange().getValues();
  const idColIndex = 0;
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(payload.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error("Student ID not found.");

  sheet.getRange(rowIndex, 2).setValue(payload.name);
  sheet.getRange(rowIndex, 4).setValue(payload.className);
  sheet.getRange(rowIndex, 5).setValue(payload.gender);
  sheet.getRange(rowIndex, 6).setValue(payload.parentPhone);
  sheet.getRange(rowIndex, 7).setValue(payload.address);

  return { message: 'Student updated successfully' };
}

function deleteStudent(payload) {
  const sheet = getSheetOrSetup(SHEETS.STUDENTS);
  const data = sheet.getDataRange().getValues();
  const idColIndex = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(payload.id)) {
      sheet.deleteRow(i + 1);
      return { message: 'Student deleted successfully' };
    }
  }
  throw new Error("Student ID not found.");
}

/**
 * IMPORT STUDENTS FIX
 * Mencegah duplikasi NIS secara ketat.
 */
function importStudents(studentsList) {
  const sheet = getSheetOrSetup(SHEETS.STUDENTS);
  const existingStudents = getData(SHEETS.STUDENTS);
  
  // Create a Set of existing NIS for O(1) lookup
  const existingNIS = new Set(existingStudents.map(s => String(s.nis).trim()));
  
  const newRows = [];
  let count = 0;
  
  studentsList.forEach(s => {
    const nis = String(s.nis).trim();
    const name = String(s.name).trim();
    
    // Validasi: NIS belum ada dan Nama tidak kosong
    if (nis && name && !existingNIS.has(nis)) {
       const newId = 'S_' + Math.floor(Math.random() * 10000000);
       newRows.push([
         newId,
         name,
         nis,
         s.className,
         s.gender,
         s.parentPhone || '',
         s.address || ''
       ]);
       existingNIS.add(nis); // Add to set to prevent duplicates within the same import batch
       count++;
    }
  });
  
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }
  
  return { message: `Berhasil import ${count} siswa. Data NIS ganda diabaikan.`, count: count };
}
