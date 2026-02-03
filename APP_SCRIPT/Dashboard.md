
/**
 * MODULE: DASHBOARD ANALYTICS
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

  // Filter Attendance for Today
  const attendanceToday = attendance.filter(r => r.date && r.date.indexOf(todayStr) === 0);
  const absentToday = attendanceToday.filter(r => r.status === 'Alpha').length;
  const sakitToday = attendanceToday.filter(r => r.status === 'Sakit').length;
  const izinToday = attendanceToday.filter(r => r.status === 'Izin').length;
  
  // 2. Attendance Rate (Today)
  let attendanceRate = 0;
  if (attendanceToday.length > 0) {
    const presentCount = attendanceToday.filter(r => r.status === 'Hadir').length;
    attendanceRate = Math.round((presentCount / attendanceToday.length) * 100);
  }

  // 3. Risk Engine (Students with >= 3 Alphas all time)
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
      className: 'Unknown', 
      alphaCount: studentRiskMap[id].alpha,
      sickCount: studentRiskMap[id].sick,
      lastAbsent: 'Check Log'
    }));

  // 4. Class Rankings (All Time Performance)
  const classStats = {};
  attendance.forEach(r => {
    const cls = r.classId || 'Unknown';
    if (!classStats[cls]) classStats[cls] = { total: 0, present: 0 };
    classStats[cls].total++;
    if (r.status === 'Hadir') classStats[cls].present++;
  });

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
  
  // Iterate last 7 days including today
  for (let i = 6; i >= 0; i--) {
     const d = new Date(today.getTime() - (i * msPerDay));
     const dStr = Utilities.formatDate(d, "GMT+7", "yyyy-MM-dd");
     const dayLabel = Utilities.formatDate(d, "GMT+7", "EEE"); // Mon, Tue, etc.
     
     let p = 0; 
     let a = 0;
     
     // Count attendance for specific day
     attendance.forEach(r => {
        if (r.date && r.date.indexOf(dStr) === 0) {
           if (r.status === 'Hadir') p++;
           else a++;
        }
     });
     
     weeklyData.push({ day: dayLabel, present: p, absent: a });
  }

  return {
    totalStudents,
    attendanceRate,
    absentToday,
    atRiskStudents,
    systemLogs: logs.slice(-5).reverse(),
    weeklyData,
    classRankings,
    teacherSubmissionRate: 85, // Placeholder: can implement based on active teachers vs submissions
    absenteeComposition: [
      { name: 'Sakit', value: sakitToday, color: '#eab308' },
      { name: 'Izin', value: izinToday, color: '#3b82f6' },
      { name: 'Alpha', value: absentToday, color: '#ef4444' }
    ],
    totalApiRequests: logs.length,
    activeUsers
  };
}
