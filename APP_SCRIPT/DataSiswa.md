/**
 * MODULE: MANAJEMEN SISWA
 */

function getStudentsByClass(className) {
  const students = getData(SHEETS.STUDENTS);
  return students.filter(s => s.className === className);
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