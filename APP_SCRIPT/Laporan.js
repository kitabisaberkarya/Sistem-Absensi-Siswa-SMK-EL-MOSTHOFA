
/**
 * MODULE: LAPORAN & TRANSAKSI
 */

/**
 * SAVE ATTENDANCE (UPSERT MODE)
 * Cek apakah data sudah ada untuk siswa tsb di tanggal & mapel yang sama.
 * Jika ada -> Update. Jika tidak -> Append.
 */
function saveAttendance(payload) {
  const sheet = getSheetOrSetup(SHEETS.ATTENDANCE);
  const data = sheet.getDataRange().getValues(); // Ambil semua data untuk pengecekan
  const timestamp = new Date();
  
  // Payload Data
  const targetDate = payload.date.substring(0, 10); // YYYY-MM-DD
  const targetClass = String(payload.classId).trim();
  const targetSubject = String(payload.subject).trim();
  const records = payload.records;

  // 1. Map Existing Data Index (Untuk performa pencarian cepat)
  // Key: Date_Class_Subject_StudentId -> Value: Row Index (1-based)
  const existingMap = new Map();
  
  // Skip header (i=1)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rDate = row[1] ? String(row[1]).substring(0, 10) : '';
    const rClass = String(row[2]).trim();
    const rSubject = String(row[3]).trim();
    const rStudentId = String(row[6]).trim(); // Index 6 is studentId based on header
    
    // Buat Unique Key
    const key = `${rDate}_${rClass}_${rSubject}_${rStudentId}`;
    existingMap.set(key, i + 1); // Simpan nomor baris
  }

  const newRows = [];
  const updates = [];

  // 2. Process Records
  records.forEach(record => {
    const key = `${targetDate}_${targetClass}_${targetSubject}_${String(record.studentId).trim()}`;
    
    if (existingMap.has(key)) {
      // UPDATE: Jika data sudah ada, simpan info untuk batch update nanti
      const rowIndex = existingMap.get(key);
      updates.push({
        rowIndex: rowIndex,
        status: record.status,
        note: record.note,
        topic: payload.topic,
        timestamp: timestamp
      });
    } else {
      // INSERT: Jika belum ada, masukkan ke antrian baris baru
      // Generate Log ID baru jika perlu, atau gunakan yang sama untuk satu batch
      const logId = Utilities.getUuid(); 
      newRows.push([
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
    }
  });

  // 3. Execute Updates (Batch writing is hard for scattered rows, so we loop setValue for updates)
  // Note: setValue per row is slower, but acceptable for delta updates (auto-save usually updates 1-5 rows or inserts all)
  updates.forEach(u => {
    // Kolom Status (Index 9 / Col I), Note (Index 10 / Col J), Topic (Index 6 / Col F), Timestamp (Index 11 / Col K)
    // Sesuaikan dengan urutan Header di Pengaturan.js: 
    // ['log_id', 'date', 'classId', 'subject', 'teacherId', 'topic', 'studentId', 'studentName', 'status', 'note', 'timestamp']
    // 1-based index: Topic=6, Status=9, Note=10, Timestamp=11
    
    sheet.getRange(u.rowIndex, 6).setValue(u.topic);
    sheet.getRange(u.rowIndex, 9).setValue(u.status);
    sheet.getRange(u.rowIndex, 10).setValue(u.note);
    sheet.getRange(u.rowIndex, 11).setValue(u.timestamp);
  });

  // 4. Execute Inserts (Batch Append is fast)
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }

  return { message: 'Data synced successfully', updated: updates.length, inserted: newRows.length };
}

// ... (Sisa fungsi lainnya tetap sama: fetchPrincipalReportData, getTeacherHistory, dll)
function fetchPrincipalReportData(payload) {
  const attendance = getData(SHEETS.ATTENDANCE);
  const students = getData(SHEETS.STUDENTS);
  
  const targetMonth = parseInt(payload.month);
  const targetYear = parseInt(payload.year);
  
  const monthlyLogs = attendance.filter(log => {
    if (!log.date) return false;
    const d = new Date(log.date);
    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
  });
  
  let totalPresence = 0, totalAlpha = 0, totalSick = 0, totalPermission = 0, totalRecords = 0;
  
  monthlyLogs.forEach(log => {
    totalRecords++;
    const s = String(log.status).toLowerCase(); 
    if (s === 'hadir') totalPresence++;
    else if (s === 'alpha') totalAlpha++;
    else if (s === 'sakit') totalSick++;
    else if (s === 'izin') totalPermission++;
  });
  
  const avgAttendance = totalRecords > 0 ? (totalPresence / totalRecords) * 100 : 0;
  
  const classMap = {};
  monthlyLogs.forEach(log => {
    const cls = log.classId || 'Unknown';
    if (!classMap[cls]) classMap[cls] = { total: 0, present: 0 };
    classMap[cls].total++;
    if (String(log.status).toLowerCase() === 'hadir') classMap[cls].present++;
  });
  
  const classPerformance = Object.keys(classMap).map(cls => {
    const stats = classMap[cls];
    const pct = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    return {
      className: cls,
      percentage: parseFloat(pct.toFixed(1)),
      predicate: pct >= 90 ? 'Sangat Baik' : pct >= 80 ? 'Baik' : 'Kurang'
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const gradeMap = { '10': {t:0, p:0}, '11': {t:0, p:0}, '12': {t:0, p:0} };
  monthlyLogs.forEach(log => {
    let grade = '10'; 
    if (log.classId.includes('11') || log.classId.includes('XI')) grade = '11';
    if (log.classId.includes('12') || log.classId.includes('XII')) grade = '12';
    
    if (gradeMap[grade]) {
      gradeMap[grade].t++;
      if (String(log.status).toLowerCase() === 'hadir') gradeMap[grade].p++;
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

function getTeacherHistory(teacherId) {
  const attendance = getData(SHEETS.ATTENDANCE);
  const myLogs = attendance.filter(r => r.teacherId === teacherId);
  
  const groupedLogs = {};
  myLogs.forEach(row => {
    // Gunakan composite key untuk grouping jika log_id tidak konsisten saat manual insert
    // Tapi idealnya log_id konsisten. Fallback ke date+class
    const key = row.log_id || `${row.date}_${row.classId}_${row.subject}`;
    
    if (!groupedLogs[key]) {
      groupedLogs[key] = {
        logId: key,
        date: row.date,
        className: row.classId,
        subject: row.subject,
        topic: row.topic,
        studentCount: 0,
        notesSample: [], 
        timestamp: row.timestamp
      };
    }
    groupedLogs[key].studentCount++;
    if (row.note && row.note !== '-') {
       groupedLogs[key].notesSample.push(`${row.studentName}: ${row.note}`);
    }
  });
  
  return Object.values(groupedLogs).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function fetchSemesterRecap(payload) {
    const { classId, semester, year } = payload;
    const students = getData(SHEETS.STUDENTS).filter(s => s.className === classId);
    if (students.length === 0) return [];
    const attendance = getData(SHEETS.ATTENDANCE);
    
    const recapMap = {};
    students.forEach(s => recapMap[s.id] = { ...s, sick:0, permission:0, alpha:0, present:0, totalMeetings:0 });
    
    attendance.forEach(log => {
        if (recapMap[log.studentId] && log.classId === classId) { 
             const stats = recapMap[log.studentId];
             stats.totalMeetings++;
             const s = String(log.status).toLowerCase();
             if (s === 'hadir') stats.present++;
             else if (s === 'sakit') stats.sick++;
             else if (s === 'izin') stats.permission++;
             else if (s === 'alpha') stats.alpha++;
        }
    });
    
    return Object.values(recapMap).map(stat => {
        const total = stat.totalMeetings > 0 ? stat.totalMeetings : 1;
        return { ...stat, percentage: parseFloat(((stat.present / total) * 100).toFixed(1)) };
    });
}

function getStudentAttendanceHistory(studentId) {
  const attendance = getData(SHEETS.ATTENDANCE);
  return attendance.filter(r => String(r.studentId) === String(studentId)).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getCounselingReportData() {
  return []; 
}
