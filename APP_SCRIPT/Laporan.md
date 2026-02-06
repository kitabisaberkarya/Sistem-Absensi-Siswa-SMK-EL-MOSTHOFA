



/**
 * MODULE: LAPORAN & TRANSAKSI ABSENSI
 */

function saveAttendance(payload) {
  const sheet = getSheetOrSetup(SHEETS.ATTENDANCE);
  
  const records = payload.records;
  const timestamp = new Date();
  const logId = Utilities.getUuid();
  
  // Optimasi batch insert untuk performa
  const rows = records.map(record => [
    logId,
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
  
  logSystem(payload.teacherId, `Submitted Attendance for ${payload.classId} (${rows.length} students)`);
  return { message: 'Data absensi berhasil disimpan' };
}

/**
 * FETCH SEMESTER RECAP (AGGREGATE)
 * Menghitung rekapitulasi absensi untuk satu semester per siswa
 */
function fetchSemesterRecap(payload) {
  const { classId, semester, year } = payload;
  
  // 1. Get Students of Class
  const students = getData(SHEETS.STUDENTS).filter(s => s.className === classId);
  if (students.length === 0) return [];
  
  // 2. Get All Attendance Logs
  const attendance = getData(SHEETS.ATTENDANCE);
  
  // 3. Filter Attendance by Class & Date Range (Approximation for Semester)
  // Logic Semester: Ganjil (July - Dec), Genap (Jan - June)
  // Logic Year: 2024/2025 -> Ganjil 2024, Genap 2025
  const isGanjil = semester === 'Ganjil';
  const startYear = parseInt(year.split('/')[0]);
  const endYear = parseInt(year.split('/')[1]);
  
  const startMonth = isGanjil ? 6 : 0; // 6 = July, 0 = Jan (Index 0-11)
  const endMonth = isGanjil ? 11 : 5;  // 11 = Dec, 5 = June
  const targetYear = isGanjil ? startYear : endYear;

  const relevantLogs = attendance.filter(log => {
    if (log.classId !== classId) return false;
    
    // Parse Date (Assuming ISO string or YYYY-MM-DD)
    const logDate = new Date(log.date);
    const logMonth = logDate.getMonth();
    const logY = logDate.getFullYear();
    
    return logY === targetYear && logMonth >= startMonth && logMonth <= endMonth;
  });

  // 4. Aggregate Data per Student
  const recapMap = {};
  
  // Initialize map
  students.forEach(s => {
    recapMap[s.id] = {
      studentId: s.id,
      name: s.name,
      nis: s.nis,
      className: s.className,
      gender: s.gender,
      sick: 0,
      permission: 0,
      alpha: 0,
      present: 0,
      totalMeetings: 0
    };
  });

  // Calculate totals
  relevantLogs.forEach(log => {
    if (recapMap[log.studentId]) {
      const stats = recapMap[log.studentId];
      stats.totalMeetings++;
      
      if (log.status === 'Hadir') stats.present++;
      else if (log.status === 'Sakit') stats.sick++;
      else if (log.status === 'Izin') stats.permission++;
      else if (log.status === 'Alpha') stats.alpha++;
    }
  });

  // 5. Format Output & Calculate Percentage
  return Object.values(recapMap).map(stat => {
    const total = stat.totalMeetings > 0 ? stat.totalMeetings : 1; // Prevent division by zero
    const percentage = ((stat.present / total) * 100).toFixed(1);
    
    return {
      ...stat,
      percentage: parseFloat(percentage)
    };
  });
}

/**
 * FETCH TEACHER HISTORY (NEW)
 * Mengambil riwayat pengajaran guru berdasarkan jurnal
 */
function getTeacherHistory(teacherId) {
  const attendance = getData(SHEETS.ATTENDANCE);
  
  // Filter by teacherId
  const myLogs = attendance.filter(r => r.teacherId === teacherId);
  
  // Group by LogID (karena satu submit absensi = banyak baris siswa, tapi satu LogID)
  const groupedLogs = {};
  
  myLogs.forEach(row => {
    if (!groupedLogs[row.log_id]) {
      groupedLogs[row.log_id] = {
        logId: row.log_id,
        date: row.date,
        className: row.classId,
        subject: row.subject,
        topic: row.topic,
        studentCount: 0,
        timestamp: row.timestamp
      };
    }
    groupedLogs[row.log_id].studentCount++;
  });
  
  // Convert to array and sort descending by date
  return Object.values(groupedLogs).sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * FETCH COUNSELING AGGREGATES (NEW for BK)
 * Mengembalikan data siswa dengan tingkat ketidakhadiran tinggi
 */
function fetchCounselingAggregates() {
  const students = getData(SHEETS.STUDENTS);
  const attendance = getData(SHEETS.ATTENDANCE);
  const aggregates = {};

  // Initialize
  students.forEach(s => {
    aggregates[s.id] = { ...s, alpha: 0, sick: 0, permission: 0 };
  });

  // Count
  attendance.forEach(log => {
    if (aggregates[log.studentId]) {
      if (log.status === 'Alpha') aggregates[log.studentId].alpha++;
      else if (log.status === 'Sakit') aggregates[log.studentId].sick++;
      else if (log.status === 'Izin') aggregates[log.studentId].permission++;
    }
  });

  // Filter only those with issues (e.g. > 0 Alpha)
  return Object.values(aggregates).filter(s => s.alpha > 0 || s.sick > 5);
}

/**
 * GET STUDENT ATTENDANCE HISTORY (Detail)
 * Detail riwayat absensi per siswa untuk keperluan BK/Wali Kelas
 */
function getStudentAttendanceHistory(studentId) {
  const attendance = getData(SHEETS.ATTENDANCE);
  // Filter strict type match for ID
  const logs = attendance.filter(r => String(r.studentId) === String(studentId));
  // Sort descending by date (Newest first)
  return logs.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * FETCH PRINCIPAL REPORT DATA (EXECUTIVE SUMMARY 2026)
 * Mengembalikan data agregat untuk laporan bulanan standar kedinasan
 * Payload: { month: '0'..'11', year: '2024' }
 */
function fetchPrincipalReportData(payload) {
  const attendance = getData(SHEETS.ATTENDANCE);
  const students = getData(SHEETS.STUDENTS);
  
  const targetMonth = parseInt(payload.month);
  const targetYear = parseInt(payload.year);
  
  // 1. Filter Logs by Period
  const monthlyLogs = attendance.filter(log => {
    const d = new Date(log.date);
    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
  });
  
  // 2. Calculate Overall Summary
  let totalPresence = 0, totalAlpha = 0, totalSick = 0, totalPermission = 0, totalRecords = 0;
  
  monthlyLogs.forEach(log => {
    totalRecords++;
    if (log.status === 'Hadir') totalPresence++;
    if (log.status === 'Alpha') totalAlpha++;
    if (log.status === 'Sakit') totalSick++;
    if (log.status === 'Izin') totalPermission++;
  });
  
  const avgAttendance = totalRecords > 0 ? (totalPresence / totalRecords) * 100 : 0;
  
  // 3. Aggregate by Class
  const classMap = {};
  
  monthlyLogs.forEach(log => {
    const cls = log.classId || 'Unknown';
    if (!classMap[cls]) classMap[cls] = { total: 0, present: 0 };
    classMap[cls].total++;
    if (log.status === 'Hadir') classMap[cls].present++;
  });
  
  const classPerformance = Object.keys(classMap).map(cls => {
    const stats = classMap[cls];
    const pct = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    
    let predicate = 'Kurang';
    if (pct >= 90) predicate = 'Sangat Baik';
    else if (pct >= 80) predicate = 'Baik';
    else if (pct >= 70) predicate = 'Cukup';
    
    return {
      className: cls,
      percentage: parseFloat(pct.toFixed(1)),
      predicate: predicate
    };
  }).sort((a, b) => b.percentage - a.percentage); // Rank best to worst
  
  // 4. Aggregate by Grade (Level 10, 11, 12)
  const gradeMap = { '10': {t:0, p:0}, '11': {t:0, p:0}, '12': {t:0, p:0} };
  
  monthlyLogs.forEach(log => {
    // Attempt to extract grade from class name (e.g., "10-TKJ-1" -> "10")
    // Fallback: Check standard formats like "X", "XI", "XII" if needed, assuming numeric "10-" prefix for now
    let grade = 'Other';
    if (log.classId.startsWith('10') || log.classId.startsWith('X ')) grade = '10';
    else if (log.classId.startsWith('11') || log.classId.startsWith('XI ')) grade = '11';
    else if (log.classId.startsWith('12') || log.classId.startsWith('XII ')) grade = '12';
    
    if (gradeMap[grade]) {
      gradeMap[grade].t++;
      if (log.status === 'Hadir') gradeMap[grade].p++;
    }
  });
  
  const gradeComparison = Object.keys(gradeMap).map(g => ({
    grade: `Kelas ${g}`,
    attendance: gradeMap[g].t > 0 ? parseFloat(((gradeMap[g].p / gradeMap[g].t) * 100).toFixed(1)) : 0
  }));

  return {
    summary: {
      totalStudents: students.length,
      avgAttendance: parseFloat(avgAttendance.toFixed(1)),
      totalAlpha,
      totalSick,
      totalPermission
    },
    gradeComparison,
    classPerformance
  };
}