
/**
 * MODULE: BACKUP & RESTORE
 * Utilitas untuk mengamankan data sekolah dengan integrasi Google Drive
 */

const BACKUP_FOLDER_NAME = "ElMosthofa_Backups";

/**
 * 1. CREATE BACKUP
 * Mengambil semua data, membuat JSON, menyimpannya di Drive, dan mengembalikannya ke UI.
 */
function backupDatabase() {
  const lock = LockService.getScriptLock();
  lock.tryLock(30000); // Wait up to 30 seconds

  try {
    // 1. Gather Data
    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      users: getData(SHEETS.USERS),
      students: getData(SHEETS.STUDENTS),
      attendance: getData(SHEETS.ATTENDANCE),
      logs: getData(SHEETS.LOGS)
    };

    const fileName = `Backup_SMK_ElMosthofa_${Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd_HH-mm")}.json`;
    const jsonString = JSON.stringify(backupData, null, 2);

    // 2. Save to Drive
    let folder;
    const folders = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(BACKUP_FOLDER_NAME);
    }

    const file = folder.createFile(fileName, jsonString, MimeType.PLAIN_TEXT);

    logSystem('ADMIN', `Created Backup: ${fileName}`);
    
    return { 
      success: true,
      message: 'Backup generated successfully', 
      timestamp: backupData.timestamp,
      driveLink: file.getUrl(),
      data: backupData // Return data so frontend can trigger download
    };

  } catch (e) {
    throw new Error("Backup Failed: " + e.toString());
  } finally {
    lock.releaseLock();
  }
}

/**
 * 2. RESTORE DATABASE
 * Menimpa data Sheet dengan data dari JSON payload.
 * PERINGATAN: Ini menghapus data lama (kecuali header).
 */
function restoreDatabase(payload) {
  const lock = LockService.getScriptLock();
  // Critical operation, wait longer
  const hasLock = lock.tryLock(60000); 

  if (!hasLock) {
    throw new Error("System is busy. Please try again later.");
  }

  try {
    const data = payload.data;
    if (!data || !data.users || !data.students) {
      throw new Error("Invalid Backup Data format.");
    }

    // Helper to Restore a single sheet
    const restoreSheet = (sheetName, rowsData) => {
      const sheet = getSheetOrSetup(sheetName);
      
      // Clear content starting from Row 2 (preserve headers)
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      }
      
      if (rowsData && rowsData.length > 0) {
        // Convert array of objects back to array of arrays based on headers
        // Note: This relies on SHEET_HEADERS defined in Pengaturan.gs
        const headers = SHEET_HEADERS[sheetName];
        if (!headers) throw new Error(`Headers not defined for ${sheetName}`);

        const newRows = rowsData.map(obj => {
          return headers.map(key => {
            // Handle dates specifically if needed, but usually string is safe for JSON
            return obj[key] === undefined ? "" : obj[key];
          });
        });

        if (newRows.length > 0) {
          sheet.getRange(2, 1, newRows.length, newRows[0].length).setValues(newRows);
        }
      }
    };

    // Execute Restores Sequentially
    restoreSheet(SHEETS.USERS, data.users);
    restoreSheet(SHEETS.STUDENTS, data.students);
    restoreSheet(SHEETS.ATTENDANCE, data.attendance);
    // restoreSheet(SHEETS.LOGS, data.logs); // Optional: Do we want to overwrite logs? Maybe append instead? Let's overwrite for full state restore.

    logSystem('ADMIN', `Restored Database from Backup Version ${data.timestamp}`);
    
    return { success: true, message: 'Database restored successfully.' };

  } catch (e) {
    throw new Error("Restore Failed: " + e.toString());
  } finally {
    lock.releaseLock();
  }
}
