


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
      case 'fetchTeachers': 
        result = getAllTeachers();
        break;
      case 'createTeacher':
        result = createTeacher(payload);
        break;
      case 'updateTeacher': // NEW
        result = updateTeacher(payload);
        break;
      case 'importTeachers':
        result = importTeachers(payload.teachers);
        break;

      // Siswa (DataSiswa.gs)
      case 'fetchStudentsByClass':
        result = getStudentsByClass(payload.className);
        break;
      case 'fetchAllStudents':
        result = getAllStudents();
        break;
      case 'createStudent':
        result = createStudent(payload);
        break;
      case 'updateStudent': // NEW
        result = updateStudent(payload);
        break;
      case 'deleteStudent': // NEW
        result = deleteStudent(payload);
        break;
      case 'importStudents':
        result = importStudents(payload.students);
        break;
      
      // Data Akademik (DataAkademik.gs)
      case 'fetchMajors':
        result = getAllMajors();
        break;
      case 'createMajor':
        result = createMajor(payload);
        break;
      case 'deleteMajor':
        result = deleteMajor(payload.id);
        break;
      case 'fetchSubjects':
        result = getAllSubjects();
        break;
      case 'createSubject':
        result = createSubject(payload);
        break;
      case 'deleteSubject':
        result = deleteSubject(payload.id);
        break;
      
      // Kelas (NEW)
      case 'fetchClasses':
        result = getAllClasses();
        break;
      case 'createClass':
        result = createClass(payload);
        break;
      case 'deleteClass':
        result = deleteClass(payload.id);
        break;

      // Transaksi (Laporan.gs)
      case 'submitAttendance':
        result = saveAttendance(payload);
        break;
      case 'fetchSemesterRecap':
        result = fetchSemesterRecap(payload);
        break;
      case 'fetchTeacherHistory': // NEW ROUTE
        result = getTeacherHistory(payload.teacherId);
        break;
      case 'fetchStudentHistory': // NEW ROUTE FOR BK
        result = getStudentAttendanceHistory(payload.studentId);
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