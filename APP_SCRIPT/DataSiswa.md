
/**
 * MODULE: MANAJEMEN SISWA
 */

function getStudentsByClass(className) {
  const students = getData(SHEETS.STUDENTS);
  return students.filter(s => s.className === className);
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
