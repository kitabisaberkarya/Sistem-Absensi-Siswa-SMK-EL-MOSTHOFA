
/**
 * MODULE: API GATEWAY (Main Controller)
 * Menangani request HTTP dari React Frontend
 * UPDATED 2026: With CacheService Implementation
 */

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  // Reduce lock wait time, fail faster if busy to prevent queue pile-up
  lock.tryLock(10000); 

  try {
    let payload = {};
    
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    let result = {};

    // --- ROUTING / DISPATCHER ---
    switch (action) {
      // Auth & User
      case 'login':
        result = handleLogin(payload.email, payload.password);
        break;
      case 'fetchTeachers': 
        // Cache Key: Action Name
        result = getCachedData('fetchTeachers', getAllTeachers);
        break;
      case 'createTeacher':
        result = createTeacher(payload);
        clearCache('fetchTeachers'); // Invalidate Cache
        break;
      case 'updateTeacher':
        result = updateTeacher(payload);
        clearCache('fetchTeachers');
        break;
      case 'importTeachers':
        result = importTeachers(payload.teachers);
        clearCache('fetchTeachers');
        break;

      // Siswa
      case 'fetchStudentsByClass':
        // Caching per Class is tricky due to many keys, but efficient if unique
        // We use a shorter TTL (Time To Live)
        result = getCachedData(`fetchStudentsByClass_${payload.className}`, () => getStudentsByClass(payload.className), 600); 
        break;
      case 'fetchAllStudents':
        result = getCachedData('fetchAllStudents', getAllStudents);
        break;
      case 'createStudent':
        result = createStudent(payload);
        clearCache('fetchAllStudents');
        clearCache('fetchStudentsByClass_'); // Prefix clearing (Custom logic required or simple clear all)
        break;
      case 'updateStudent':
        result = updateStudent(payload);
        clearCache('fetchAllStudents');
        // Hack: clear all class caches manually or rely on short TTL
        break;
      case 'deleteStudent':
        result = deleteStudent(payload.id);
        clearCache('fetchAllStudents');
        break;
      case 'importStudents':
        result = importStudents(payload.students);
        clearCache('fetchAllStudents');
        break;
      
      // Data Akademik (Static Data - Long Cache)
      case 'fetchMajors':
        result = getCachedData('fetchMajors', getAllMajors, 21600); // 6 Hours
        break;
      case 'createMajor':
        result = createMajor(payload);
        clearCache('fetchMajors');
        break;
      case 'deleteMajor':
        result = deleteMajor(payload.id);
        clearCache('fetchMajors');
        break;
      case 'fetchSubjects':
        result = getCachedData('fetchSubjects', getAllSubjects, 21600);
        break;
      case 'createSubject':
        result = createSubject(payload);
        clearCache('fetchSubjects');
        break;
      case 'deleteSubject':
        result = deleteSubject(payload.id);
        clearCache('fetchSubjects');
        break;
      
      // Kelas
      case 'fetchClasses':
        result = getCachedData('fetchClasses', getAllClasses, 21600);
        break;
      case 'createClass':
        result = createClass(payload);
        clearCache('fetchClasses');
        break;
      case 'deleteClass':
        result = deleteClass(payload.id);
        clearCache('fetchClasses');
        break;

      // Transaksi & Laporan (HEAVY OPERATIONS)
      case 'submitAttendance':
        result = saveAttendance(payload);
        // CRITICAL: Clear heavy caches when attendance is submitted
        clearCache('fetchDashboardStats');
        clearCache('fetchCounselingData'); 
        break;
        
      case 'fetchSemesterRecap':
        // Unique key based on params
        const recapKey = `recap_${payload.classId}_${payload.semester}_${payload.year}`;
        result = getCachedData(recapKey, () => fetchSemesterRecap(payload), 900); // 15 mins
        break;
        
      case 'fetchTeacherHistory':
        // Realtime enough, but can cache for 1 min
        result = getTeacherHistory(payload.teacherId);
        break;
        
      case 'fetchStudentHistory': 
        result = getStudentAttendanceHistory(payload.studentId);
        break;
        
      case 'fetchPrincipalReportData':
        // Very heavy, cache for 1 hour. It's a monthly report.
        const reportKey = `principal_${payload.month}_${payload.year}`;
        result = getCachedData(reportKey, () => fetchPrincipalReportData(payload), 3600);
        break;
        
      case 'fetchCounselingData':
        // HEAVY AGGREGATION. Cache it!
        result = getCachedData('fetchCounselingData', getCounselingReportData, 1800); // 30 Mins
        break;

      // Statistik
      case 'fetchDashboardStats':
        // THE HEAVIEST. Cache it!
        result = getCachedData('fetchDashboardStats', getDashboardStats, 1800); // 30 Mins
        break;
        
      // System & Backup
      case 'backupDatabase':
        result = backupDatabase();
        break;
      case 'restoreDatabase':
        result = restoreDatabase(payload);
        // Nuke all cache after restore
        const cache = CacheService.getScriptCache();
        cache.remove('fetchDashboardStats');
        cache.remove('fetchCounselingData');
        cache.remove('fetchAllStudents');
        break;

      // SETTINGS & UPLOAD (NEW)
      case 'getSystemSettings':
        result = getSystemSettings();
        break;
      case 'saveSystemSettings':
        result = saveSystemSettings(payload);
        break;
      case 'uploadFile':
        result = uploadFileToDrive(payload);
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

// --- CACHING HELPERS ---

/**
 * Execute a function with caching wrapper.
 * @param {string} key Unique cache key
 * @param {Function} fetchFunction Function that returns the data if cache miss
 * @param {number} expirationInSeconds Cache duration (default 20 mins)
 */
function getCachedData(key, fetchFunction, expirationInSeconds = 1200) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  
  if (cached != null) {
    // Cache Hit
    return JSON.parse(cached);
  }
  
  // Cache Miss
  const result = fetchFunction();
  
  // Save to cache (limit size approx 100KB per key)
  try {
    const jsonStr = JSON.stringify(result);
    // Safety check for size, though GAS handles it by throwing error usually
    if (jsonStr.length < 100000) {
       cache.put(key, jsonStr, expirationInSeconds);
    }
  } catch (e) {
    console.error("Cache put failed (likely too big): " + key);
  }
  
  return result;
}

function clearCache(key) {
  const cache = CacheService.getScriptCache();
  cache.remove(key);
}
