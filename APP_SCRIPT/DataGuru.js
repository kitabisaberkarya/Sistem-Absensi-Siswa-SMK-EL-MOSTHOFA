
/**
 * MODULE: MANAJEMEN PENGGUNA & GURU
 */

function handleLogin(identifier, password) {
  const users = getData(SHEETS.USERS);
  const cleanId = String(identifier).trim().toLowerCase();
  
  const user = users.find(u => {
    const uEmail = String(u.email || '').trim().toLowerCase();
    const uNip = String(u.nip || '').trim().toLowerCase();
    return uEmail === cleanId || uNip === cleanId;
  });
  
  if (!user) throw new Error('ID Pengguna atau NIP tidak ditemukan.');
  
  if (String(user.password) !== String(password)) {
    throw new Error('Kata sandi salah. Silakan coba lagi.');
  }
  
  if (user.status === 'Inactive') {
    throw new Error('Akun ini telah dinonaktifkan.');
  }
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    nip: user.nip,
    avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
  };
}

function getAllTeachers() {
  const users = getData(SHEETS.USERS);
  // Filter out completely empty rows, but allow users without email since admin might bulk import names only
  return users
    .filter(u => u.name) 
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email || '-',
      role: u.role,
      nip: u.nip || '-',
      phone: u.phone || '-',
      subject: u.subject || '-',
      gender: u.gender || 'L',
      status: u.status || 'Active',
      avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
    }));
}

function createTeacher(payload) {
  const sheet = getSheetOrSetup(SHEETS.USERS);
  const users = getData(SHEETS.USERS);
  
  if (users.find(u => u.email === payload.email)) {
    throw new Error("Email sudah terdaftar.");
  }
  
  if (payload.nip && payload.nip !== '-' && users.find(u => u.nip === payload.nip)) {
    throw new Error("NIP sudah digunakan.");
  }

  const newId = 'T_' + Math.floor(Math.random() * 100000);
  
  sheet.appendRow([
    newId,
    payload.fullName,
    payload.email,
    payload.password || '123456',
    payload.role, 
    payload.nip || '-',
    payload.phone,
    payload.subject,
    payload.gender,
    payload.status,
    ''
  ]);
  
  invalidateCaches([SHEETS.USERS]);
  return { id: newId, message: 'User created successfully' };
}

function updateTeacher(payload) {
  const sheet = getSheetOrSetup(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const idColIndex = data[0].indexOf('id');
  
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(payload.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error("User ID not found.");

  const headers = data[0];
  const setCell = (colName, value) => {
    const colIndex = headers.indexOf(colName);
    if (colIndex > -1 && value !== undefined) {
      sheet.getRange(rowIndex, colIndex + 1).setValue(value);
    }
  };

  setCell('name', payload.fullName);
  setCell('email', payload.email);
  if (payload.password) setCell('password', payload.password);
  setCell('role', payload.role);
  setCell('nip', payload.nip);
  setCell('phone', payload.phone);
  setCell('subject', payload.subject);
  setCell('gender', payload.gender);
  setCell('status', payload.status);

  invalidateCaches([SHEETS.USERS]);
  return { message: 'User updated successfully' };
}

function changePassword(payload) {
  const sheet = getSheetOrSetup(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const pwIdx = headers.indexOf('password');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(payload.userId)) {
      if (String(data[i][pwIdx]) !== String(payload.currentPassword)) {
        throw new Error('Kata sandi saat ini tidak sesuai.');
      }
      if (!payload.newPassword || payload.newPassword.length < 6) {
        throw new Error('Kata sandi baru minimal 6 karakter.');
      }
      sheet.getRange(i + 1, pwIdx + 1).setValue(payload.newPassword);
      invalidateCaches([SHEETS.USERS]);
      return { message: 'Kata sandi berhasil diubah.' };
    }
  }
  throw new Error('User tidak ditemukan.');
}

/**
 * IMPORT TEACHERS (Legacy/Specific)
 */
function importTeachers(teachers) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheet = getSheetOrSetup(SHEETS.USERS);
    const existingUsers = getData(SHEETS.USERS);
    
    const registeredEmails = new Set(existingUsers.map(u => String(u.email).toLowerCase()));
    const registeredNames = new Set(existingUsers.map(u => String(u.name).toLowerCase()));

    const newRows = [];
    let count = 0;

    teachers.forEach(t => {
      const rawCode = t.code ? String(t.code) : '';
      const cleanCode = rawCode.toLowerCase().replace(/[^a-z0-9]/g, '');
      const name = String(t.name || '').trim();

      if (!cleanCode && !name) return;

      const email = `guru.${cleanCode || Math.floor(Math.random()*1000)}@sekolah.sch.id`;
      
      if (!registeredEmails.has(email) && !registeredNames.has(name.toLowerCase())) {
        const newId = 'T_' + (cleanCode || 'IMP') + '_' + Math.floor(Math.random() * 99999);
        
        newRows.push([
          newId,                    // id
          name,                     // name
          email,                    // email
          '123456',                 // password
          'TEACHER',                // role
          '-',                      // nip
          '-',                      // phone
          String(t.subject || '-'), // subject
          'L',                      // gender
          'Active',                 // status
          ''                        // avatar
        ]);
        
        registeredEmails.add(email);
        registeredNames.add(name.toLowerCase());
        count++;
      }
    });

    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
      invalidateCaches([SHEETS.USERS]);
    }

    return { success: true, message: `Berhasil import ${count} guru baru. Data ganda diabaikan.`, count: count };
    
  } catch (e) {
    throw new Error("Import Failed: " + e.toString());
  } finally {
    lock.releaseLock();
  }
}

/**
 * IMPORT GLOBAL USERS (NEW ENTERPRISE FEATURE)
 * Handles Teachers, Counselors, Principals, Admins in one go.
 */
function importGlobalUsers(usersList) {
  const lock = LockService.getScriptLock();
  lock.tryLock(20000); // Increased lock time for larger payloads

  try {
    const sheet = getSheetOrSetup(SHEETS.USERS);
    const existingUsers = getData(SHEETS.USERS);
    
    // Create lookup sets for fast duplicate checking
    const registeredEmails = new Set(existingUsers.map(u => String(u.email || '').toLowerCase().trim()));
    const registeredNIPs = new Set(existingUsers.map(u => String(u.nip || '').trim()));
    const registeredNames = new Set(existingUsers.map(u => String(u.name || '').toLowerCase().trim()));

    const newRows = [];
    let count = 0;
    
    // Allowed Roles Enum
    const ALLOWED_ROLES = ['TEACHER', 'COUNSELOR', 'PRINCIPAL', 'ADMIN'];

    usersList.forEach(u => {
      const rawEmail = String(u.email || '').toLowerCase().trim();
      const nip = String(u.nip || '-').trim();
      const name = String(u.name).trim();
      const nameLower = name.toLowerCase();
      
      // Basic Validation
      if (!name) return; // Skip invalid rows (Name is mandatory)
      
      // Generate email if none provided
      const email = rawEmail || `user.${Math.floor(Math.random()*99999)}@sekolah.sch.id`;

      // Duplicate Check
      if (rawEmail && registeredEmails.has(email)) return; // Skip duplicate email if explicitly provided
      if (nip !== '-' && registeredNIPs.has(nip)) return; // Skip duplicate NIP
      if (registeredNames.has(nameLower)) return; // Skip duplicate Name

      // Role Validation & Defaulting
      let role = String(u.role || 'TEACHER').toUpperCase().trim();
      if (!ALLOWED_ROLES.includes(role)) role = 'TEACHER'; // Default fallback

      // ID Generation
      const newId = 'U_' + role.substring(0,3) + '_' + Math.floor(Math.random() * 999999);
      
      // Data Preparation
      newRows.push([
        newId,                      // id
        name,                       // name
        email,                      // email
        u.password || '123456',     // password (secure default)
        role,                       // role
        nip,                        // nip
        u.phone || '-',             // phone
        u.subject || '-',           // subject
        u.gender || 'L',            // gender
        'Active',                   // status
        ''                          // avatar
      ]);
      
      // Update local sets to prevent duplicates within the upload file itself
      registeredEmails.add(email);
      if (nip !== '-') registeredNIPs.add(nip);
      registeredNames.add(nameLower);
      count++;
    });

    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
      invalidateCaches([SHEETS.USERS]);
    }

    logSystem('ADMIN', `Bulk Imported ${count} Users Globally`);
    return { success: true, message: `Berhasil import ${count} pengguna baru. Data ganda/invalid diabaikan.`, count: count };
    
  } catch (e) {
    throw new Error("Global Import Failed: " + e.toString());
  } finally {
    lock.releaseLock();
  }
}
