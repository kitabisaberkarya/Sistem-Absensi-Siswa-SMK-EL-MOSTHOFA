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

// TODO: Tambahkan fungsi exportToPDF atau generateWeeklyReport di sini kedepannya