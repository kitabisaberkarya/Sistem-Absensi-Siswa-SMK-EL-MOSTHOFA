
/**
 * MODULE: KONSELING & DISIPLIN (Baru)
 * Menangani logika khusus untuk Guru BK dan Laporan Pelanggaran
 */

/**
 * MENGAMBIL DATA AGREGAT UNTUK TABEL BK
 * Menghitung jumlah Alpha, Sakit, Izin untuk SETIAP siswa tanpa batasan threshold.
 */
function getCounselingReportData() {
  const students = getData(SHEETS.STUDENTS);
  const attendance = getData(SHEETS.ATTENDANCE);
  
  // 1. Inisialisasi Map berdasarkan Student ID untuk O(1) access
  const studentMap = {};
  
  // Masukkan data dasar siswa
  students.forEach(s => {
    studentMap[s.id] = {
      id: s.id,
      name: s.name,
      nis: s.nis,
      className: s.className, // Fallback ke s.Kelas jika perlu ditangani di getData
      gender: s.gender,
      parentPhone: s.parentPhone,
      alpha: 0,
      sick: 0,
      permission: 0,
      present: 0,
      lastOffense: null
    };
  });

  // 2. Iterasi Log Absensi (Full Scan)
  attendance.forEach(log => {
    // Pastikan siswa masih ada di database (handle kasus siswa keluar/dihapus)
    if (studentMap[log.studentId]) {
      const record = studentMap[log.studentId];
      
      if (log.status === 'Alpha') {
        record.alpha++;
        // Update tanggal pelanggaran terakhir (asumsi log terurut atau kita ambil max date)
        if (!record.lastOffense || new Date(log.date) > new Date(record.lastOffense)) {
          record.lastOffense = log.date;
        }
      } else if (log.status === 'Sakit') {
        record.sick++;
      } else if (log.status === 'Izin') {
        record.permission++;
      } else if (log.status === 'Hadir') {
        record.present++;
      }
    }
  });

  // 3. Konversi ke Array dan Hitung Status Resiko
  return Object.values(studentMap).map(s => {
    let status = 'Aman';
    if (s.alpha >= 3 && s.alpha < 5) status = 'Waspada';
    if (s.alpha >= 5) status = 'Bahaya';
    
    return {
      student: {
        id: s.id,
        name: s.name,
        nis: s.nis,
        className: s.className,
        gender: s.gender,
        parentPhone: s.parentPhone,
        address: '' // Optional, fetch if needed to save bandwidth
      },
      alpha: s.alpha,
      sick: s.sick,
      permission: s.permission,
      present: s.present,
      total: s.alpha + s.sick + s.permission, // Total ketidakhadiran
      status: status,
      lastOffense: s.lastOffense
    };
  });
}
