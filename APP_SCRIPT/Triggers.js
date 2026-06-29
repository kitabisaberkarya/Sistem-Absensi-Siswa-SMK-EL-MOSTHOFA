
/**
 * MODULE: BACKGROUND TRIGGERS (OPTIMIZATION)
 *
 * Cache Warming berjalan setiap 5 menit agar data selalu segar.
 * TTL cache di-set 7 menit (420s) agar overlap dengan interval trigger.
 *
 * CARA PASANG:
 * 1. Simpan file ini.
 * 2. Jalankan fungsi 'setupTriggers' SEKALI saja dari editor Apps Script.
 */

const WARM_CACHE_TTL = 420; // 7 menit — sedikit lebih lama dari interval trigger

function setupTriggers() {
  // Hapus semua trigger lama agar tidak ganda
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Trigger baru: jalankan warmUpCache setiap 5 menit
  ScriptApp.newTrigger('warmUpCache')
    .timeBased()
    .everyMinutes(5)
    .create();

  return "Trigger berhasil dipasang (setiap 5 menit)!";
}

function warmUpCache() {
  console.log("Starting Cache Warming...");

  const cache = CacheService.getScriptCache();

  // 1. Warm Up Dashboard Stats
  try {
    const dashboardData = getDashboardStats();
    cache.put('fetchDashboardStats', JSON.stringify(dashboardData), WARM_CACHE_TTL);
    console.log("Dashboard Cached.");
  } catch (e) {
    console.error("Failed to cache Dashboard: " + e.toString());
  }

  // 2. Warm Up Counseling Data
  try {
    const counselingData = getCounselingReportData();
    cache.put('fetchCounselingData', JSON.stringify(counselingData), WARM_CACHE_TTL);
    console.log("Counseling Data Cached.");
  } catch (e) {
    console.error("Failed to cache Counseling: " + e.toString());
  }

  // 3. Warm Up Students List
  try {
    const allStudents = getAllStudents();
    cache.put('fetchAllStudents', JSON.stringify(allStudents), WARM_CACHE_TTL);
    console.log("Students List Cached.");
  } catch (e) {
    console.error("Failed to cache Students: " + e.toString());
  }

  // 4. Warm Up Attendance Logs
  try {
    const att = getData(SHEETS.ATTENDANCE);
    const grouped = {};
    att.forEach(r => {
      if (!grouped[r.log_id]) {
        grouped[r.log_id] = {
          logId: r.log_id,
          date: r.date,
          className: r.classId,
          subject: r.subject,
          teacherId: r.teacherId,
          topic: r.topic,
          studentCount: 0,
          timestamp: r.timestamp
        };
      }
      grouped[r.log_id].studentCount++;
    });
    const logs = Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
    cache.put('fetchFullAttendanceLogs', JSON.stringify(logs), WARM_CACHE_TTL);
    console.log("Attendance Logs Cached.");
  } catch (e) {
    console.error("Failed to cache Attendance Logs: " + e.toString());
  }

  console.log("Cache Warming Complete.");
}
