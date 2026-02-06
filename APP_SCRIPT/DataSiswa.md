

/**
 * MODULE: MANAJEMEN SISWA
 */

function getStudentsByClass(className) {
  const students = getData(SHEETS.STUDENTS);
  
  // ROBUST SEARCH LOGIC:
  // 1. Bersihkan search term (hapus spasi depan/belakang, lowercase)
  const searchTarget = String(className).trim().toLowerCase();
  
  return students.filter(s => {
    // 2. Bersihkan data di database juga saat membandingkan
    const studentClass = String(s.className || '').trim().toLowerCase();
    
    // 3. Bandingkan
    return studentClass === searchTarget;
  });
}

function getAllStudents() {
  return getData(SHEETS.STUDENTS);
}

function createStudent(payload) {
  const sheet = getSheetOrSetup(SHEETS.STUDENTS);
  
  // Validasi sederhana duplicate NIS
  const students = getData(SHEETS.STUDENTS);
  if (students.find(s => s.nis == payload.nis)) {
    throw new Error(`Siswa dengan NIS ${payload.nis} sudah ada.`);
  }

  const newId = 'S' + Date.now();
  
  // Urutan: id, name, nis, className, gender, parentPhone, address
  sheet.appendRow([
    newId,
    payload.name,
    payload.nis,
    payload.className,
    payload.gender,
    payload.parentPhone,
    payload.address
  ]);
  
  logSystem('ADMIN', `Added Student: ${payload.name} to ${payload.className}`);
  return { message: 'Student created successfully' };
}

function updateStudent(payload) {
  const sheet = getSheetOrSetup(SHEETS.STUDENTS);
  const data = sheet.getDataRange().getValues();
  // Headers: id(0), name(1), nis(2), className(3), gender(4), parentPhone(5), address(6)
  
  const idColIndex = 0;
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(payload.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error("Student ID not found.");

  // Update Cells
  sheet.getRange(rowIndex, 2).setValue(payload.name);
  // NIS (col 3) is usually PK, but if you allow update: sheet.getRange(rowIndex, 3).setValue(payload.nis);
  sheet.getRange(rowIndex, 4).setValue(payload.className);
  sheet.getRange(rowIndex, 5).setValue(payload.gender);
  sheet.getRange(rowIndex, 6).setValue(payload.parentPhone);
  sheet.getRange(rowIndex, 7).setValue(payload.address);

  logSystem('ADMIN', `Updated Student: ${payload.name} (${payload.id})`);
  return { message: 'Student updated successfully' };
}

function deleteStudent(payload) {
  const sheet = getSheetOrSetup(SHEETS.STUDENTS);
  const data = sheet.getDataRange().getValues();
  const idColIndex = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(payload.id)) {
      sheet.deleteRow(i + 1);
      logSystem('ADMIN', `Deleted Student ID: ${payload.id}`);
      return { message: 'Student deleted successfully' };
    }
  }
  throw new Error("Student ID not found for deletion.");
}

function importStudents(studentsList) {
  const sheet = getSheetOrSetup(SHEETS.STUDENTS);
  const existingStudents = getData(SHEETS.STUDENTS);
  const existingNIS = new Set(existingStudents.map(s => String(s.nis)));
  
  const newRows = [];
  let count = 0;
  
  studentsList.forEach(s => {
    // Validasi duplicate NIS agar tidak double
    if (!existingNIS.has(String(s.nis))) {
       const newId = 'S' + Math.floor(Math.random() * 1000000) + '_' + s.nis;
       // Urutan: id, name, nis, className, gender, parentPhone, address
       newRows.push([
         newId,
         s.name,
         s.nis,
         s.className,
         s.gender,
         s.parentPhone || '',
         s.address || ''
       ]);
       existingNIS.add(String(s.nis));
       count++;
    }
  });
  
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }
  
  logSystem('ADMIN', `Bulk Imported ${count} Students`);
  return { message: 'Bulk import successful', count: count };
}