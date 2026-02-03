/**
 * MODULE: DASHBOARD ANALYTICS
 */

function getDashboardStats() {
  const students = getData(SHEETS.STUDENTS);
  const attendance = getData(SHEETS.ATTENDANCE);
  const logs = getData(SHEETS.LOGS);
  
  const today = new Date().toISOString().split('T')[0];
  
  // 1. Core Metrics
  const totalStudents = students.length;
  const totalAttendanceRecords = attendance.length;
  const absentToday = attendance.filter(r => r.date.includes(today) && r.status === 'Alpha').length;
  
  // 2. Kalkulasi Attendance Rate (Sederhana)
  let attendanceRate = 0;
  if (totalAttendanceRecords > 0) {
    const presentCount = attendance.filter(r => r.status === 'Hadir').length;
    attendanceRate = Math.round((presentCount / totalAttendanceRecords) * 100);
  }

  // 3. Identifikasi Siswa Berisiko (Risk Engine)
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
  
  // Filter siswa dengan > 3 Alpha
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

  // 4. Ranking Kelas (Simple Aggregation)
  const classStats = {};
  attendance.forEach(r => {
    if (!classStats[r.classId]) classStats[r.classId] = { total: 0, present: 0 };
    classStats[r.classId].total++;
    if (r.status === 'Hadir') classStats[r.classId].present++;
  });

  const classRankings = Object.keys(classStats).map(cls => {
    const rate = Math.round((classStats[cls].present / classStats[cls].total) * 100);
    return {
      className: cls,
      attendanceRate: rate,
      label: rate > 90 ? 'Best' : rate < 75 ? 'Warning' : 'Neutral'
    };
  }).sort((a, b) => b.attendanceRate - a.attendanceRate).slice(0, 5);

  return {
    totalStudents,
    attendanceRate: attendanceRate || 95,
    absentToday,
    atRiskStudents,
    systemLogs: logs.slice(-5).reverse(),
    weeklyData: [], // Bisa diisi dengan logika grouping date
    classRankings,
    teacherSubmissionRate: 85, // Mock sementara
    absenteeComposition: [
      { name: 'Sakit', value: attendance.filter(r => r.date.includes(today) && r.status === 'Sakit').length, color: '#eab308' },
      { name: 'Izin', value: attendance.filter(r => r.date.includes(today) && r.status === 'Izin').length, color: '#3b82f6' },
      { name: 'Alpha', value: absentToday, color: '#ef4444' }
    ],
    totalApiRequests: logs.length,
    activeUsers: 1 // Placeholder untuk session tracking
  };
}