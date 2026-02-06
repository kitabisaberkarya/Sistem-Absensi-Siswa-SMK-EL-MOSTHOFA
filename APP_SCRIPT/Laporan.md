

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