
/**
 * MODULE: BACKGROUND TRIGGERS (OPTIMIZATION)
 * 
 * Script ini digunakan untuk melakukan "Pemanasan Cache" (Cache Warming).
 * Daripada menunggu User membuka Dashboard dan loading lama,
 * sistem akan menghitung statistik di background setiap 30 menit
 * dan menyimpannya di CacheService.
 * 
 * CARA PASANG:
 * 1. Simpan file ini.
 * 2. Jalankan fungsi 'setupTriggers' SEKALI saja dari editor.
 */

function setupTriggers() {
  // Hapus trigger lama agar tidak double
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  // Buat Trigger baru: Jalankan 'warmUpCache' setiap 30 menit
  ScriptApp.newTrigger('warmUpCache')
    .timeBased()
    .everyMinutes(30)
    .create();
    
  return "Trigger berhasil dipasang!";
}

function warmUpCache() {
  console.log("Starting Cache Warming...");
  
  const cache = CacheService.getScriptCache();
  
  // 1. Warm Up Dashboard Stats
  try {
    const dashboardData = getDashboardStats(); // Fungsi dari Dashboard.gs
    cache.put('fetchDashboardStats', JSON.stringify(dashboardData), 2100); // 35 Mins (sedikit lebih lama dari interval trigger)
    console.log("Dashboard Cached.");
  } catch (e) {
    console.error("Failed to cache Dashboard: " + e.toString());
  }
  
  // 2. Warm Up Counseling Data
  try {
    const counselingData = getCounselingReportData(); // Fungsi dari Konseling.gs
    cache.put('fetchCounselingData', JSON.stringify(counselingData), 2100);
    console.log("Counseling Data Cached.");
  } catch (e) {
    console.error("Failed to cache Counseling: " + e.toString());
  }
  
  // 3. Warm Up Students List (Optional, if heavy)
  try {
    const allStudents = getAllStudents(); // Fungsi dari DataSiswa.gs
    cache.put('fetchAllStudents', JSON.stringify(allStudents), 2100);
    console.log("Students List Cached.");
  } catch (e) {
    console.error("Failed to cache Students: " + e.toString());
  }
  
  console.log("Cache Warming Complete.");
}
