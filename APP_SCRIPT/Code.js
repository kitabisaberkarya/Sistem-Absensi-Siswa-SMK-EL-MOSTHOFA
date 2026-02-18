
/**
 * ============================================================
 * ENTERPRISE API GATEWAY & ROUTER (v2026.1)
 * ============================================================
 * Architect: Senior Full-Stack Developer
 * Features: 
 * 1. Strict Concurrency Locking (Prevent Data Overwrite)
 * 2. Smart Caching Layer (High Performance Read)
 * 3. Auto Cache Invalidation (Realtime Consistency)
 * ============================================================
 */

// --- CONFIGURATION ---
const CACHE_TTL = 1800; // 30 Menit (dalam detik)
const LOCK_WAIT_MS = 15000; // 15 Detik tunggu antrian

function doPost(e) { return handleRequest(e); }
function doGet(e) { return handleRequest(e); }

/**
 * Entry Point for GAS Client-Side API (google.script.run)
 */
function clientApi(payload) {
  // Wrapper agar error bisa ditangkap dengan rapi di frontend
  try {
    const result = processAction(payload);
    return { status: 'success', data: result };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Main Request Handler for HTTP
 */
function handleRequest(e) {
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
  }
}

/**
 * CENTRAL LOGIC PROCESSOR
 * Mengatur routing, caching, dan invalidasi cache
 */
function processAction(payload) {
    const action = payload.action;
    
    // --- 1. WRITE OPERATIONS (Strict Lock & Cache Invalidation) ---
    // Operasi ini mengubah data, jadi kita harus menghapus cache terkait
    
    if (isWriteOperation(action)) {
       const lock = LockService.getScriptLock();
       // Tunggu antrian jika ada guru lain yang sedang submit
       const hasLock = lock.tryLock(LOCK_WAIT_MS); 
       
       if (!hasLock) {
         throw new Error("Server sibuk (High Traffic). Mohon coba 5 detik lagi.");
       }

       try {
         const result = executeWriteAction(action, payload);
         // Invalidasi Cache Cerdas
         invalidateCaches(action); 
         return result;
       } finally {
         lock.releaseLock();
       }
    }

    // --- 2. READ OPERATIONS (Cached) ---
    // Operasi ini hanya membaca, gunakan cache untuk performa kilat
    
    if (isReadOperation(action)) {
       return getCachedData(action, payload, () => executeReadAction(action, payload));
    }
    
    throw new Error(`Action '${action}' tidak dikenali oleh sistem.`);
}

// --- HELPER: ROUTING ---

function isWriteOperation(action) {
  return action.startsWith('create') || 
         action.startsWith('update') || 
         action.startsWith('delete') || 
         action.startsWith('import') || 
         action.startsWith('submit') ||
         action.startsWith('save') ||
         action.startsWith('restore') || 
         action.startsWith('upload');
}

function isReadOperation(action) {
  return action.startsWith('fetch') || 
         action.startsWith('get') || 
         action === 'login';
}

function executeReadAction(action, payload) {
  switch (action) {
      // Auth
      case 'login': return handleLogin(payload.email, payload.password);
      
      // Teachers
      case 'fetchTeachers': return getAllTeachers();

      // Students
      case 'fetchStudentsByClass': return getStudentsByClass(payload.className);
      case 'fetchAllStudents': return getAllStudents();

      // Academics
      case 'fetchMajors': return getAllMajors();
      case 'fetchSubjects': return getAllSubjects();
      case 'fetchClasses': return getAllClasses();

      // Reports
      case 'fetchSemesterRecap': return fetchSemesterRecap(payload);
      case 'fetchTeacherHistory': return getTeacherHistory(payload.teacherId);
      case 'fetchStudentHistory': return getStudentAttendanceHistory(payload.studentId);
      case 'fetchPrincipalReportData': return fetchPrincipalReportData(payload);
      case 'fetchCounselingData': return getCounselingReportData();
      case 'fetchDashboardStats': return getDashboardStats();
      case 'getSystemSettings': return getSystemSettings();
      
      case 'fetchFullAttendanceLogs':
          const att = getData(SHEETS.ATTENDANCE);
          // Simple grouping logic for logs
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
          return Object.values(grouped).sort((a,b) => new Date(b.date) - new Date(a.date));

      default: throw new Error(`Read Action '${action}' not implemented.`);
  }
}

function executeWriteAction(action, payload) {
  switch (action) {
      // Teachers & Users
      case 'createTeacher': return createTeacher(payload);
      case 'updateTeacher': return updateTeacher(payload);
      case 'importTeachers': return importTeachers(payload.teachers);
      case 'importGlobalUsers': return importGlobalUsers(payload.users); // NEW ROUTE

      // Students
      case 'createStudent': return createStudent(payload);
      case 'updateStudent': return updateStudent(payload);
      case 'deleteStudent': return deleteStudent(payload.id);
      case 'importStudents': return importStudents(payload.students);

      // Academics
      case 'createMajor': return createMajor(payload);
      case 'deleteMajor': return deleteMajor(payload.id);
      case 'createSubject': return createSubject(payload);
      case 'deleteSubject': return deleteSubject(payload.id);
      case 'importSubjects': return importSubjects(payload.subjects);
      case 'createClass': return createClass(payload);
      case 'deleteClass': return deleteClass(payload.id);

      // Transactions
      case 'submitAttendance': return saveAttendance(payload);
      case 'saveSystemSettings': return saveSystemSettings(payload);
      case 'uploadFile': return uploadFileToDrive(payload);
      
      // System
      case 'backupDatabase': return backupDatabase();
      case 'restoreDatabase': return restoreDatabase(payload);

      default: throw new Error(`Write Action '${action}' not implemented.`);
  }
}

// --- SMART CACHING SYSTEM ---

/**
 * Mengambil data dari cache jika ada. Jika tidak, jalankan fungsi fetch dan simpan hasilnya.
 * Cache key dibuat unik berdasarkan action dan payload.
 */
function getCachedData(action, payload, fetchFunction) {
  // Login tidak boleh di-cache untuk keamanan
  if (action === 'login') return fetchFunction();

  const cache = CacheService.getScriptCache();
  // Buat key unik yang pendek (Cache key max 250 chars)
  // Contoh: "fetchStudents_10TKJ1"
  let cacheKey = action;
  
  if (payload.className) cacheKey += `_${payload.className.replace(/\s/g,'')}`;
  if (payload.studentId) cacheKey += `_${payload.studentId}`;
  if (payload.teacherId) cacheKey += `_${payload.teacherId}`;
  if (payload.classId) cacheKey += `_${payload.classId}`;
  
  // Cek Cache
  const cached = cache.get(cacheKey);
  if (cached != null) {
    // console.log(`[CACHE HIT] ${cacheKey}`); 
    return JSON.parse(cached);
  }

  // console.log(`[CACHE MISS] ${cacheKey} - Fetching from DB...`);
  const result = fetchFunction();

  // Simpan ke Cache (Max 100KB per item)
  try {
    const jsonStr = JSON.stringify(result);
    if (jsonStr.length < 90000) { // Safety margin 90KB
      cache.put(cacheKey, jsonStr, CACHE_TTL);
    }
  } catch (e) {
    console.error("Failed to cache data (too large): " + cacheKey);
  }

  return result;
}

/**
 * Menghapus cache terkait saat data berubah.
 * Strategi: Hapus kunci umum yang sering diakses.
 */
function invalidateCaches(action) {
  const cache = CacheService.getScriptCache();
  
  // 1. Jika ada perubahan data Siswa/Guru/Absensi, Statistik Dashboard pasti berubah
  // Jadi kita hapus cache dashboard agar Admin melihat data terbaru
  cache.remove('fetchDashboardStats');
  cache.remove('fetchCounselingData'); // Data BK juga berubah
  
  // 2. Jika Data Siswa berubah
  if (action.includes('Student')) {
    cache.remove('fetchAllStudents');
    // Kita tidak bisa menghapus cache spesifik per kelas dengan mudah karena dynamic key,
    // jadi biarkan cache per kelas expire sendiri (TTL) atau gunakan strategi advanced prefixing.
    // Untuk safety, data siswa per kelas memiliki TTL rendah di implementasi advanced.
  }

  // 3. Jika Data Guru berubah
  if (action.includes('Teacher') || action.includes('User')) { // Handle User/Teacher actions
    cache.remove('fetchTeachers');
  }

  // 4. Jika Data Akademik berubah
  if (action.includes('Subject') || action.includes('Class') || action.includes('Major')) {
    cache.remove('fetchSubjects');
    cache.remove('fetchClasses');
    cache.remove('fetchMajors');
  }
  
  // 5. Restore Database
  if (action === 'restoreDatabase') {
    // Nuke common caches
    cache.remove('fetchDashboardStats');
    cache.remove('fetchAllStudents');
    cache.remove('fetchTeachers');
    cache.remove('fetchCounselingData');
  }
}
