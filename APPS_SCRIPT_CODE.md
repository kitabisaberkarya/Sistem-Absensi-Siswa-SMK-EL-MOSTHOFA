
/**
 * @OnlyCurrentDoc
 * SISTEM ABSENSI SMK EL MOSTHOFA - BACKEND API
 * 
 * Instructions:
 * 1. Paste this code into extensions > Apps Script
 * 2. Save and Deploy as Web App
 * 3. Access: "Anyone"
 */

// --- CONFIGURATION ---
const SHEETS = {
  USERS: 'Users',
  STUDENTS: 'Students',
  ATTENDANCE: 'Attendance_Log',
  LOGS: 'System_Logs'
};

// Define Headers for Automatic Sheet Creation
const SHEET_HEADERS = {
  [SHEETS.USERS]: ['id', 'name', 'email', 'password', 'role', 'nip', 'phone', 'subject', 'gender', 'status', 'avatar'],
  [SHEETS.STUDENTS]: ['id', 'name', 'nis', 'className', 'gender', 'parentPhone', 'address'],
  [SHEETS.ATTENDANCE]: ['log_id', 'date', 'classId', 'subject', 'teacherId', 'topic', 'studentId', 'studentName', 'status', 'note', 'timestamp'],
  [SHEETS.LOGS]: ['id', 'user', 'action', 'timestamp', 'status']
};

// --- HTTP HANDLERS ---

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
    
    // Handle POST data or GET parameters
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    let result = {};

    switch (action) {
      case 'login':
        result = handleLogin(payload.email, payload.password);
        break;
      case 'fetchStudentsByClass':
        result = getStudentsByClass(payload.className);
        break;
      case 'submitAttendance':
        result = saveAttendance(payload);
        break;
      case 'createTeacher':
        result = createTeacher(payload);
        break;
      case 'importTeachers': // NEW BULK ACTION
        result = importTeachers(payload.teachers);
        break;
      case 'createStudent':
        result = createStudent(payload);
        break;
      case 'fetchDashboardStats':
        result = getDashboardStats();
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

// --- CORE LOGIC ---

function handleLogin(email, password) {
  const users = getData(SHEETS.USERS);
  // Find user by Email AND Password
  const user = users.find(u => u.email === email);
  
  if (!user) throw new Error('Email tidak ditemukan.');
  
  // Basic password check (In production, use hashing, but for this GAS scope, direct compare)
  if (String(user.password) !== String(password)) {
    throw new Error('Password salah. Silakan coba lagi.');
  }
  
  // Return user matching the Frontend Types
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
  };
}

function getStudentsByClass(className) {
  const students = getData(SHEETS.STUDENTS);
  return students.filter(s => s.className === className);
}

function saveAttendance(payload) {
  const sheet = getSheetOrSetup(SHEETS.ATTENDANCE);
  
  // Payload contains records array
  const records = payload.records;
  const timestamp = new Date();
  
  const rows = records.map(record => [
    Utilities.getUuid(), // ID Log
    payload.date,
    payload.classId,
    payload.subject,
    payload.teacherId,
    payload.topic,
    record.studentId,
    record.studentName,
    record.status,
    record.note,
    timestamp
  ]);
  
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  logSystem(payload.teacherId, `Submitted Attendance for ${payload.classId}`);
  return { message: 'Data saved successfully' };
}

function createTeacher(payload) {
  const sheet = getSheetOrSetup(SHEETS.USERS);
  
  // Check duplicate
  const users = getData(SHEETS.USERS);
  if (users.find(u => u.email === payload.email)) throw new Error("Email sudah terdaftar.");

  const newId = 'T_' + Math.floor(Math.random() * 10000);
  
  // Columns: id, name, email, password, role, nip, phone, subject, gender, status, avatar
  sheet.appendRow([
    newId,
    payload.fullName,
    payload.email,
    payload.password || '123456', // Default if empty
    'TEACHER',
    payload.nip,
    payload.phone,
    payload.subject,
    payload.gender,
    payload.status,
    '' // Avatar blank
  ]);
  
  return { id: newId, message: 'Teacher created' };
}

// BULK IMPORT LOGIC
function importTeachers(teachers) {
  const sheet = getSheetOrSetup(SHEETS.USERS);
  const existingUsers = getData(SHEETS.USERS);
  const existingEmails = new Set(existingUsers.map(u => u.email));
  
  const newRows = [];
  let count = 0;

  teachers.forEach(t => {
    // Generate unique email based on code: guru.[code]@sekolah.sch.id
    const email = `guru.${t.code.toLowerCase().trim()}@sekolah.sch.id`;
    
    if (!existingEmails.has(email)) {
      const newId = 'T_' + t.code + '_' + Math.floor(Math.random() * 1000);
      newRows.push([
        newId,
        t.name,
        email,
        '123456', // Default Password for bulk import
        'TEACHER',
        '-', // NIP default
        '-', // Phone default
        t.subject,
        'L', // Gender default (unknown)
        'Active',
        ''
      ]);
      existingEmails.add(email); // Prevent duplicates within the same batch
      count++;
    }
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }

  return { message: 'Bulk import successful', count: count };
}

function createStudent(payload) {
  const sheet = getSheetOrSetup(SHEETS.STUDENTS);
  
  const newId = 'S' + Date.now();
  
  // Columns: id, name, nis, className, gender, parentPhone, address
  sheet.appendRow([
    newId,
    payload.name,
    payload.nis,
    payload.className,
    payload.gender,
    payload.parentPhone,
    payload.address
  ]);
  
  return { message: 'Student created' };
}

function getDashboardStats() {
  const students = getData(SHEETS.STUDENTS);
  const attendance = getData(SHEETS.ATTENDANCE);
  const logs = getData(SHEETS.LOGS);
  
  // --- Calculate Metrics ---
  const today = new Date().toISOString().split('T')[0]; // Simple YYYY-MM-DD check
  
  // 1. Basic Stats
  const totalStudents = students.length;
  const absentToday = attendance.filter(r => r.date.includes(today) && r.status === 'Alpha').length;
  
  // 3. At Risk Students (Count Alphas > 3)
  const studentRiskMap = {};
  attendance.forEach(r => {
    if (r.status === 'Alpha' || r.status === 'Sakit') {
      if (!studentRiskMap[r.studentId]) {
        studentRiskMap[r.studentId] = { alpha: 0, sick: 0, name: r.studentName, class: '' };
      }
      if (r.status === 'Alpha') studentRiskMap[r.studentId].alpha++;
      if (r.status === 'Sakit') studentRiskMap[r.studentId].sick++;
    }
  });
  
  const atRiskStudents = Object.keys(studentRiskMap)
    .filter(id => studentRiskMap[id].alpha >= 3)
    .map(id => ({
      id: id,
      name: studentRiskMap[id].name,
      className: 'Unknown', // Ideally join with student data
      alphaCount: studentRiskMap[id].alpha,
      sickCount: studentRiskMap[id].sick,
      lastAbsent: 'Check Log'
    }));

  return {
    totalStudents,
    attendanceRate: 95, // Simplified
    absentToday,
    atRiskStudents,
    systemLogs: logs.slice(-5).reverse(), // Last 5 logs
    weeklyData: [], // Populate if needed
    classRankings: [],
    absenteeComposition: [
      { name: 'Sakit', value: attendance.filter(r => r.date.includes(today) && r.status === 'Sakit').length, color: '#eab308' },
      { name: 'Izin', value: attendance.filter(r => r.date.includes(today) && r.status === 'Izin').length, color: '#3b82f6' },
      { name: 'Alpha', value: absentToday, color: '#ef4444' }
    ],
    totalApiRequests: logs.length,
    activeUsers: 10
  };
}

// --- HELPERS ---

/**
 * Gets the Sheet, or creates it if it doesn't exist.
 * Applies Headers and Data Validation automatically.
 */
function getSheetOrSetup(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = SHEET_HEADERS[sheetName];
    
    if (headers) {
      // 1. Set Headers
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      
      // 2. Apply Specific Validations
      if (sheetName === SHEETS.USERS) {
        // Validation for ROLE (Column E / 5th)
        // Values: TEACHER, COUNSELOR, PRINCIPAL, ADMIN
        const roleRule = SpreadsheetApp.newDataValidation()
          .requireValueInList(['TEACHER', 'COUNSELOR', 'PRINCIPAL', 'ADMIN'], true)
          .setAllowInvalid(true)
          .build();
        sheet.getRange("E2:E").setDataValidation(roleRule);

        // Validation for GENDER (Column I / 9th)
        const genderRule = SpreadsheetApp.newDataValidation()
          .requireValueInList(['L', 'P'], true)
          .setAllowInvalid(true)
          .build();
        sheet.getRange("I2:I").setDataValidation(genderRule);
        
        // Validation for STATUS (Column J / 10th)
        const statusRule = SpreadsheetApp.newDataValidation()
          .requireValueInList(['Active', 'Inactive'], true)
          .setAllowInvalid(true)
          .build();
        sheet.getRange("J2:J").setDataValidation(statusRule);
      } else if (sheetName === SHEETS.ATTENDANCE) {
        // Validation for STATUS (Column I / 9th)
        const attStatusRule = SpreadsheetApp.newDataValidation()
          .requireValueInList(['Hadir', 'Sakit', 'Izin', 'Alpha'], true)
          .setAllowInvalid(true)
          .build();
        sheet.getRange("I2:I").setDataValidation(attStatusRule);
      }
    }
  }
  return sheet;
}

function getData(sheetName) {
  // Use getSheetOrSetup to ensure db integrity
  const sheet = getSheetOrSetup(sheetName);
  
  // Guard clause if sheet is empty (only header or less)
  if (sheet.getLastRow() < 2) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove header row
  
  return data.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      // camelCase the headers for JSON
      obj[h] = row[i];
    });
    return obj;
  });
}

function logSystem(user, action) {
  const sheet = getSheetOrSetup(SHEETS.LOGS);
  sheet.appendRow([Utilities.getUuid(), user, action, new Date(), 'Success']);
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
