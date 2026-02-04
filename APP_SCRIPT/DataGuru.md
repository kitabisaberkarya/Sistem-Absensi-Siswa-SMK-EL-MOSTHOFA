

/**
 * MODULE: MANAJEMEN PENGGUNA & GURU
 * 
 * Script ini menangani CRUD Guru dan fitur Import Massal.
 * Copy paste isi file ini ke file "DataGuru.gs" di Google Apps Script Editor.
 */

function handleLogin(email, password) {
  const users = getData(SHEETS.USERS);
  const user = users.find(u => u.email === email);
  
  if (!user) throw new Error('Email tidak ditemukan.');
  
  // Catatan: Gunakan hashing untuk production level
  if (String(user.password) !== String(password)) {
    throw new Error('Password salah. Silakan coba lagi.');
  }
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
  };
}

function getAllTeachers() {
  const users = getData(SHEETS.USERS);
  // Return user data sanitised (remove password)
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    nip: u.nip,
    phone: u.phone,
    subject: u.subject,
    gender: u.gender,
    status: u.status,
    avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
  }));
}

function createTeacher(payload) {
  const sheet = getSheetOrSetup(SHEETS.USERS);
  const users = getData(SHEETS.USERS);
  
  if (users.find(u => u.email === payload.email)) {
    throw new Error("Email sudah terdaftar.");
  }

  const newId = 'T_' + Math.floor(Math.random() * 10000);
  
  // Urutan: id, name, email, password, role, nip, phone, subject, gender, status, avatar
  sheet.appendRow([
    newId,
    payload.fullName,
    payload.email,
    payload.password || '123456',
    payload.role, 
    payload.nip,
    payload.phone,
    payload.subject,
    payload.gender,
    payload.status,
    ''
  ]);
  
  logSystem('ADMIN', `Created User: ${payload.fullName} as ${payload.role}`);
  return { id: newId, message: 'User created successfully' };
}

function updateTeacher(payload) {
  const sheet = getSheetOrSetup(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  // Headers are at index 0. Data starts at index 1.
  
  // Find ID column index (usually 0)
  const idColIndex = data[0].indexOf('id');
  if (idColIndex === -1) throw new Error("Database error: ID column not found");

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(payload.id)) {
      rowIndex = i + 1; // row is 1-based index
      break;
    }
  }

  if (rowIndex === -1) throw new Error("User ID not found.");

  // Column Mapping based on SHEET_HEADERS in Pengaturan.gs
  // ['id', 'name', 'email', 'password', 'role', 'nip', 'phone', 'subject', 'gender', 'status', 'avatar']
  const headers = data[0];
  
  const setCell = (colName, value) => {
    const colIndex = headers.indexOf(colName);
    if (colIndex > -1 && value !== undefined) {
      sheet.getRange(rowIndex, colIndex + 1).setValue(value);
    }
  };

  // Perform updates
  setCell('name', payload.fullName);
  setCell('email', payload.email);
  if (payload.password) setCell('password', payload.password);
  setCell('role', payload.role);
  setCell('nip', payload.nip);
  setCell('phone', payload.phone);
  setCell('subject', payload.subject);
  setCell('gender', payload.gender);
  setCell('status', payload.status);

  logSystem('ADMIN', `Updated User: ${payload.fullName} (${payload.id})`);
  return { message: 'User updated successfully' };
}

/**
 * BULK IMPORT TEACHERS (OPTIMIZED & ROBUST)
 * Menerima payload: [{no, name, code, subject}, ...]
 */
function importTeachers(teachers) {
  const lock = LockService.getScriptLock();
  // Wait for up to 10 seconds for other processes to finish.
  lock.tryLock(10000);

  try {
    const sheet = getSheetOrSetup(SHEETS.USERS);
    
    // Ambil data yang sudah ada untuk cek duplikasi (berdasarkan email)
    // Kolom: id(0), name(1), email(2)
    const data = sheet.getDataRange().getValues();
    const existingEmails = new Set();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][2]) existingEmails.add(data[i][2].toString().toLowerCase());
    }
    
    const newRows = [];
    let count = 0;

    teachers.forEach(t => {
      // 1. Generate Email Unik dari Kode
      const rawCode = t.code ? String(t.code) : '';
      const cleanCode = rawCode.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Jika kode kosong, skip
      if (!cleanCode) return;

      const email = `guru.${cleanCode}@sekolah.sch.id`;
      
      // 2. Cek apakah email sudah ada di database atau di batch import ini
      if (!existingEmails.has(email)) {
        const newId = 'T_' + cleanCode.toUpperCase() + '_' + Math.floor(Math.random() * 9999);
        
        // 3. Susun Baris (Wajib urut sesuai Header di Pengaturan.gs)
        // ['id', 'name', 'email', 'password', 'role', 'nip', 'phone', 'subject', 'gender', 'status', 'avatar']
        newRows.push([
          newId,                    // id
          String(t.name || 'Guru'), // name
          email,                    // email
          '123456',                 // password (default)
          'TEACHER',                // role (default guru mapel)
          '-',                      // nip
          '-',                      // phone
          String(t.subject || '-'), // subject
          'L',                      // gender (default)
          'Active',                 // status
          ''                        // avatar
        ]);
        
        existingEmails.add(email); // Tandai email ini agar tidak duplikat di loop berikutnya
        count++;
      }
    });

    if (newRows.length > 0) {
      // Tulis ke Sheet sekaligus (Batch Write) agar cepat
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    }

    logSystem('ADMIN', `Bulk Imported ${count} Teachers via Excel`);
    return { success: true, message: 'Bulk import successful', count: count };
    
  } catch (e) {
    throw new Error("Import Failed: " + e.toString());
  } finally {
    lock.releaseLock();
  }
}
