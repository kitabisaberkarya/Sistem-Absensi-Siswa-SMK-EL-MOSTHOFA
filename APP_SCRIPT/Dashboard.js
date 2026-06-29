
/**
 * MODULE: DASHBOARD ANALYTICS
 * Optimized for Caching
 */

function getDashboardStats() {
  // Cache ditangani oleh getCachedData() di Code.js — jangan double-cache di sini

  const students = getData(SHEETS.STUDENTS);
  const attendance = getData(SHEETS.ATTENDANCE);
  const logs = getData(SHEETS.LOGS);
  const users = getData(SHEETS.USERS);
  const allClasses = getData(SHEETS.CLASSES); // Ambil semua kelas terdaftar

  const today = new Date();
  const todayStr = Utilities.formatDate(today, "GMT+7", "yyyy-MM-dd");

  // 1. Core Metrics
  const totalStudents = students.length;
  const activeUsers = users.filter(u => u.role === 'TEACHER' && u.status === 'Active').length;

  // Buat map studentId → className dari data Students untuk resolusi className
  const studentClassMap = {};
  students.forEach(s => {
    if (s.id) studentClassMap[String(s.id)] = s.className || 'Unknown';
  });

  // Filter absensi hari ini
  const attendanceToday = attendance.filter(r => r.date && String(r.date).indexOf(todayStr) === 0);

  let absentToday = 0;
  let sakitToday = 0;
  let izinToday = 0;
  let presentCount = 0;

  attendanceToday.forEach(r => {
    if (r.status === 'Alpha') absentToday++;
    else if (r.status === 'Sakit') sakitToday++;
    else if (r.status === 'Izin') izinToday++;
    else if (r.status === 'Hadir') presentCount++;
  });

  // 2. Attendance Rate (Today)
  let attendanceRate = 0;
  if (attendanceToday.length > 0) {
    attendanceRate = Math.round((presentCount / attendanceToday.length) * 100);
  }

  // 3. Risk Engine + Class Stats — single pass
  const studentRiskMap = {};
  const classStats = {};

  attendance.forEach(r => {
    // Risk Calc
    if (r.status === 'Alpha' || r.status === 'Sakit') {
      const sid = String(r.studentId || '');
      if (!studentRiskMap[sid]) {
        studentRiskMap[sid] = { alpha: 0, sick: 0, name: r.studentName || '' };
      }
      if (r.status === 'Alpha') studentRiskMap[sid].alpha++;
      if (r.status === 'Sakit') studentRiskMap[sid].sick++;
    }

    // Class Stats Calc
    const cls = r.classId || 'Unknown';
    if (!classStats[cls]) classStats[cls] = { total: 0, present: 0 };
    classStats[cls].total++;
    if (r.status === 'Hadir') classStats[cls].present++;
  });

  // Convert Risk Map — resolusi className dari studentClassMap
  const atRiskStudents = Object.keys(studentRiskMap)
    .filter(id => studentRiskMap[id].alpha >= 3)
    .map(id => ({
      id: id,
      name: studentRiskMap[id].name,
      className: studentClassMap[id] || 'Unknown',
      alphaCount: studentRiskMap[id].alpha,
      sickCount: studentRiskMap[id].sick,
      lastAbsent: 'Check Log'
    }))
    .sort((a, b) => b.alphaCount - a.alphaCount)
    .slice(0, 50);

  // 4. Seed semua kelas terdaftar ke classStats (nilai 0) agar kelas tanpa absensi tampil
  allClasses.forEach(cls => {
    const className = cls.name || '';
    if (className && !classStats[className]) {
      classStats[className] = { total: 0, present: 0 };
    }
  });

  const totalClasses = allClasses.length;

  // Convert Class Stats
  const classRankings = Object.keys(classStats).map(cls => {
    const total = classStats[cls].total;
    const rate = total === 0 ? 0 : Math.round((classStats[cls].present / total) * 100);
    return {
      className: cls,
      attendanceRate: rate,
      label: rate > 90 ? 'Best' : rate < 75 ? 'Warning' : 'Neutral'
    };
  }).sort((a, b) => b.attendanceRate - a.attendanceRate).slice(0, 10);

  // 5. Teacher Submission Rate (hitung real dari Log Absensi hari ini)
  // Guru yang sudah submit = distinct teacherId yang ada di attendance log hari ini
  const teachersWhoSubmittedToday = new Set(
    attendanceToday.map(r => String(r.teacherId || '')).filter(id => id)
  );
  const activeTeachers = users.filter(u => u.role === 'TEACHER' && u.status === 'Active');
  const teacherSubmissionRate = activeTeachers.length > 0
    ? Math.round((teachersWhoSubmittedToday.size / activeTeachers.length) * 100)
    : 0;

  // 6. Weekly Data (Last 7 Days)
  const weeklyData = [];
  const msPerDay = 24 * 60 * 60 * 1000;
  const last7Days = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - (i * msPerDay));
    const dStr = Utilities.formatDate(d, "GMT+7", "yyyy-MM-dd");
    const dayLabel = Utilities.formatDate(d, "GMT+7", "EEE");
    last7Days[dStr] = { day: dayLabel, present: 0, absent: 0, sortIdx: 6 - i };
    weeklyData.push({ day: dayLabel, present: 0, absent: 0 });
  }

  attendance.forEach(r => {
    const dateKey = r.date ? r.date.substring(0, 10) : '';
    if (last7Days[dateKey]) {
      if (r.status === 'Hadir') last7Days[dateKey].present++;
      else last7Days[dateKey].absent++;
    }
  });

  const sortedWeekly = Object.values(last7Days)
    .sort((a, b) => a.sortIdx - b.sortIdx)
    .map(d => ({ day: d.day, present: d.present, absent: d.absent }));

  const result = {
    totalStudents,
    totalClasses,
    attendanceRate,
    absentToday,
    atRiskStudents,
    systemLogs: logs.slice(-5).reverse(),
    weeklyData: sortedWeekly,
    classRankings,
    teacherSubmissionRate,
    absenteeComposition: [
      { name: 'Sakit', value: sakitToday, color: '#eab308' },
      { name: 'Izin', value: izinToday, color: '#3b82f6' },
      { name: 'Alpha', value: absentToday, color: '#ef4444' }
    ],
    totalApiRequests: logs.length,
    activeUsers
  };

  return result;
}
