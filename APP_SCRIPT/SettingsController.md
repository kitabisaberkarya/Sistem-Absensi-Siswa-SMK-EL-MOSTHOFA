
/**
 * MODULE: SETTINGS & FILE CONTROLLER
 * Menangani penyimpanan konfigurasi sekolah dan upload file ke Google Drive.
 */

const ASSETS_FOLDER_NAME = "ElMosthofa_Assets";

/**
 * FETCH ALL SETTINGS
 * Mengembalikan object key-value dari sheet Settings
 */
function getSystemSettings() {
  const data = getData(SHEETS.SETTINGS);
  const settings = {};
  
  // Default Values (Enterprise Best Practice)
  const defaults = {
    schoolName: "SMK EL MOSTHOFA",
    schoolAddress: "Jalan Raya Pamekasan - Sumenep KM. 15, Pamekasan, Jawa Timur",
    schoolPhone: "(0324) 123456",
    schoolEmail: "admin@elmosthofa.sch.id",
    schoolWebsite: "www.elmosthofa.sch.id",
    foundationName: "YAYASAN PENDIDIKAN ISLAM AT-TOHIRI",
    schoolLogo: "https://res.cloudinary.com/dt1nrarpq/image/upload/v1770105471/LOGO_SEKOLAH_ourgxr.png",
    foundationLogo: "https://res.cloudinary.com/dt1nrarpq/image/upload/v1770438319/logo_yayan_at_tohiri_gg8vkq.png"
  };

  // Merge DB values
  data.forEach(item => {
    if (item.key) settings[item.key] = item.value;
  });

  return { ...defaults, ...settings };
}

/**
 * SAVE SETTINGS
 * Menyimpan/Update konfigurasi ke database
 * Payload: { schoolName: "...", ... }
 */
function saveSystemSettings(payload) {
  const sheet = getSheetOrSetup(SHEETS.SETTINGS);
  const allData = sheet.getDataRange().getValues();
  // Map existing keys to row index
  const keyMap = {};
  
  // Skip header
  for (let i = 1; i < allData.length; i++) {
    keyMap[allData[i][0]] = i + 1; // 1-based index
  }

  const keys = Object.keys(payload);
  
  keys.forEach(key => {
    if (keyMap[key]) {
      // Update existing
      sheet.getRange(keyMap[key], 2).setValue(payload[key]);
    } else {
      // Create new
      sheet.appendRow([key, payload[key], 'System Config']);
    }
  });
  
  // Clear cache related to reports/settings if any
  try {
    const cache = CacheService.getScriptCache();
    cache.remove('systemSettings'); 
  } catch(e) {}

  return { success: true, message: 'Pengaturan berhasil disimpan.' };
}

/**
 * UPLOAD FILE TO DRIVE
 * Menerima Base64 string, decode, dan simpan ke folder khusus.
 * Mengembalikan Public View URL.
 */
function uploadFileToDrive(payload) {
  try {
    const { data, filename, mimeType } = payload;
    
    // 1. Get or Create Folder
    let folder;
    const folders = DriveApp.getFoldersByName(ASSETS_FOLDER_NAME);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(ASSETS_FOLDER_NAME);
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    // 2. Decode Base64
    // Data biasanya format: "data:image/png;base64,iVBORw0KGgoAAA..."
    const cleanBase64 = data.split(',')[1] || data;
    const blob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), mimeType, filename);
    
    // 3. Create File
    const file = folder.createFile(blob);
    
    // 4. Ensure Public Access (Critical for displaying in <img> tag)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 5. Generate Direct Link
    // file.getDownloadUrl() kadang memaksa download. 
    // file.getUrl() adalah preview link.
    // Hack untuk image: Gunakan ID untuk construct thumbnail link
    const fileId = file.getId();
    // URL ini lebih bersahabat untuk tag <img>
    const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return { 
      success: true, 
      url: publicUrl, 
      fileId: fileId 
    };

  } catch (e) {
    throw new Error("Upload Failed: " + e.toString());
  }
}
