

/**
 * MAIN ROUTER
 */
function doPost(e) { return handleRequest(e); }
function doGet(e) { return handleRequest(e); }

function clientApi(payload) {
  // This is the direct entry point for google.script.run from client-side
  const result = processAction(payload);
  return { status: 'success', data: result };
}

function processAction(payload) {
    const action = payload.action;
    let result = {};

    switch (action) {
      case 'login': result = handleLogin(payload.email, payload.password); break;
      
      // Teachers
      case 'fetchTeachers': result = getAllTeachers(); break;
      case 'createTeacher': result = createTeacher(payload); break;
      case 'updateTeacher': result = updateTeacher(payload); break;
      case 'importTeachers': result = importTeachers(payload.teachers); break;

      // Students
      case 'fetchStudentsByClass': result = getStudentsByClass(payload.className); break;
      case 'fetchAllStudents': result = getAllStudents(); break;
      case 'createStudent': result = createStudent(payload); break;
      case 'updateStudent': result = updateStudent(payload); break;
      case 'deleteStudent': result = deleteStudent(payload.id); break;
      case 'importStudents': result = importStudents(payload.students); break;

      // Academics
      case 'fetchMajors': result = getAllMajors(); break;
      case 'createMajor': result = createMajor(payload); break;
      case 'deleteMajor': result = deleteMajor(payload.id); break;
      
      case 'fetchSubjects': result = getAllSubjects(); break;
      case 'createSubject': result = createSubject(payload); break;
      case 'deleteSubject': result = deleteSubject(payload.id); break;
      case 'importSubjects': result = importSubjects(payload.subjects); break;
      
      case 'fetchClasses': result = getAllClasses(); break;
      case 'createClass': result = createClass(payload); break;
      case 'deleteClass': result = deleteClass(payload.id); break;

      // Reports & Transactions
      case 'submitAttendance': result = saveAttendance(payload); break;
      case 'fetchSemesterRecap': result = fetchSemesterRecap(payload); break;
      case 'fetchTeacherHistory': result = getTeacherHistory(payload.teacherId); break;
      case 'fetchStudentHistory': result = getStudentAttendanceHistory(payload.studentId); break;
      case 'fetchPrincipalReportData': result = fetchPrincipalReportData(payload); break;
      case 'fetchCounselingData': result = getCounselingReportData(); break;
      
      // Dashboard
      case 'fetchDashboardStats': result = getDashboardStats(); break;

      // Backup
      case 'backupDatabase': result = backupDatabase(); break;
      case 'restoreDatabase': result = restoreDatabase(payload); break;
      
      // Settings
      case 'getSystemSettings': result = getSystemSettings(); break;
      case 'saveSystemSettings': result = saveSystemSettings(payload); break;
      case 'uploadFile': result = uploadFileToDrive(payload); break;
      
      case 'fetchFullAttendanceLogs':
          const att = getData(SHEETS.ATTENDANCE);
          const grouped = {};
          att.forEach(r => {
             if(!grouped[r.log_id]) {
                 grouped[r.log_id] = {
                     logId: r.log_id,
                     date: r.date,
                     className: r.classId,
                     subject: r.subject,
                     teacherId: r.teacherId,
                     topic: r.topic,
                     studentCount: 0,
                     timestamp: r.timestamp
                 }
             }
             grouped[r.log_id].studentCount++;
          });
          result = Object.values(grouped).sort((a,b) => new Date(b.date) - new Date(a.date));
          break;

      default: throw new Error('Invalid Action: ' + action);
    }
    return result;
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); 

  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const result = processAction(payload);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
