
/**
 * MODULE: API GATEWAY (Main Controller)
 * Menangani request HTTP dari React Frontend
 */

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    let payload = {};
    
    // Parsing Input
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    let result = {};

    // --- ROUTING / DISPATCHER ---
    switch (action) {
      // Auth & User (DataGuru.gs)
      case 'login':
        result = handleLogin(payload.email, payload.password);
        break;
      case 'fetchTeachers': // NEW
        result = getAllTeachers();
        break;
      case 'createTeacher':
        result = createTeacher(payload);
        break;
      case 'importTeachers':
        result = importTeachers(payload.teachers);
        break;

      // Siswa (DataSiswa.gs)
      case 'fetchStudentsByClass':
        result = getStudentsByClass(payload.className);
        break;
      case 'fetchAllStudents': // NEW
        result = getAllStudents();
        break;
      case 'createStudent':
        result = createStudent(payload);
        break;
      case 'importStudents': // NEW
        result = importStudents(payload.students);
        break;

      // Transaksi (Laporan.gs)
      case 'submitAttendance':
        result = saveAttendance(payload);
        break;

      // Statistik (Dashboard.gs)
      case 'fetchDashboardStats':
        result = getDashboardStats();
        break;
        
      // System (BackupRestore.gs)
      case 'backupDatabase':
        result = backupDatabase();
        break;
      case 'restoreDatabase':
        result = restoreDatabase(payload);
        break;

      default:
        throw new Error('Invalid Action: ' + action);
    }

    return responseJSON({ status: 'success', data: result });

  } catch (error) {
    return responseJSON({ status: 'error', message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
