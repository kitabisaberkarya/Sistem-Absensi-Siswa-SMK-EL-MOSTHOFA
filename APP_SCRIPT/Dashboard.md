
/**
 * MODULE: DASHBOARD ANALYTICS
 * Optimized for Caching
 */

function getDashboardStats() {
  const students = getData(SHEETS.STUDENTS);
  const attendance = getData(SHEETS.ATTENDANCE);
  const logs = getData(SHEETS.LOGS);
  const users = getData(SHEETS.USERS);
  
  const today = new Date();
  const todayStr = Utilities.formatDate(today, "GMT+7", "yyyy-MM-dd");
  
  // 1. Core Metrics
  const totalStudents = students.length;
  // Count Active Teachers
  const activeUsers = users.filter(u => u.role === 'TEACHER' && u.status === 'Active').length;

  // Filter Attendance for Today (Optimized: Filter first, then map)
  // Check if date column exists and matches
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

  // 3. Risk Engine (Students with >= 3 Alphas all time)
  // Optimization: Single Pass Loop
  const studentRiskMap = {};
  const classStats = {};

  attendance.forEach(r => {
    // Risk Calc
    if (r.status === 'Alpha' || r.status === 'Sakit') {
      if (!studentRiskMap[r.studentId]) {
        studentRiskMap[r.studentId] = { alpha: 0, sick: 0, name: r.studentName, class: '' };
      }
      if (r.status === 'Alpha') studentRiskMap[r.studentId].alpha++;
      if (r.status === 'Sakit') studentRiskMap[r.studentId].sick++;
    }

    // Class Stats Calc
    const cls = r.classId || 'Unknown';
    if (!classStats[cls]) classStats[cls] = { total: 0, present: 0 };
    classStats[cls].total++;
    if (r.status === 'Hadir') classStats[cls].present++;
  });
  
  // Convert Risk Map
  const atRiskStudents = Object.keys(studentRiskMap)
    .filter(id => studentRiskMap[id].alpha >= 3)
    .map(id => ({
      id: id,
      name: studentRiskMap[id].name,
      className: 'Unknown', // Optimization: Don't look up class for speed, UI can fetch detail if needed or map later
      alphaCount: studentRiskMap[id].alpha,
      sickCount: studentRiskMap[id].sick,
      lastAbsent: 'Check Log'
    }))
    .slice(0, 50); // Limit return size for cache safety

  // Convert Class Stats
  const classRankings = Object.keys(classStats).map(cls => {
    const total = classStats[cls].total;
    const rate = total === 0 ? 0 : Math.round((classStats[cls].present / total) * 100);
    return {
      className: cls,
      attendanceRate: rate,
      label: rate > 90 ? 'Best' : rate < 75 ? 'Warning' : 'Neutral'
    };
  }).sort((a, b) => b.attendanceRate - a.attendanceRate).slice(0, 5);

  // 5. Weekly Data (Last 7 Days)
  const weeklyData = [];
  const msPerDay = 24 * 60 * 60 * 1000;
  
  // Pre-calculate date strings for O(1) lookup
  const last7Days = {};
  for (let i = 6; i >= 0; i--) {
     const d = new Date(today.getTime() - (i * msPerDay));
     const dStr = Utilities.formatDate(d, "GMT+7", "yyyy-MM-dd");
     const dayLabel = Utilities.formatDate(d, "GMT+7", "EEE");
     last7Days[dStr] = { day: dayLabel, present: 0, absent: 0, sortIdx: 6-i };
     weeklyData.push({ day: dayLabel, present: 0, absent: 0 }); // Init array order
  }

  // Single pass on attendance for weekly stats
  attendance.forEach(r => {
      const dateKey = r.date ? r.date.substring(0, 10) : '';
      if (last7Days[dateKey]) {
          if (r.status === 'Hadir') last7Days[dateKey].present++;
          else last7Days[dateKey].absent++;
      }
  });

  // Re-map object to array based on sorted index
  const sortedWeekly = Object.values(last7Days).sort((a,b) => a.sortIdx - b.sortIdx).map(d => ({
      day: d.day, present: d.present, absent: d.absent
  }));

  return {
    totalStudents,
    attendanceRate,
    absentToday,
    atRiskStudents,
    systemLogs: logs.slice(-5).reverse(),
    weeklyData: sortedWeekly,
    classRankings,
    teacherSubmissionRate: 85, 
    absenteeComposition: [
      { name: 'Sakit', value: sakitToday, color: '#eab308' },
      { name: 'Izin', value: izinToday, color: '#3b82f6' },
      { name: 'Alpha', value: absentToday, color: '#ef4444' }
    ],
    totalApiRequests: logs.length,
    activeUsers
  };
}
