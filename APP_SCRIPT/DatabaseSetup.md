
/**
 * MODULE: DATABASE SETUP & FIXER
 * Jalankan fungsi ini SEKALI untuk memperbaiki struktur database
 * agar sesuai dengan aplikasi React.
 */

function fixDatabaseStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. FIX STUDENTS SHEET
  const studentSheet = getSheetOrSetup(SHEETS.STUDENTS);
  const studentHeaders = SHEET_HEADERS[SHEETS.STUDENTS];
  
  // Force update headers in Row 1
  studentSheet.getRange(1, 1, 1, studentHeaders.length)
    .setValues([studentHeaders])
    .setFontWeight("bold")
    .setBackground("#e6f2ff"); // Light blue to indicate system control
    
  // Add Validation for ClassName (Column D / Index 4)
  const classSheet = getSheetOrSetup(SHEETS.CLASSES);
  const classRange = classSheet.getRange("B2:B"); // Asumsi nama kelas di kolom B
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(classRange)
    .setAllowInvalid(true) // Allow existing invalid data but warn
    .setHelpText("Pilih nama kelas yang valid dari menu dropdown.")
    .build();
    
  // Apply validation to Students > className column (Col 4)
  // header is row 1, data starts row 2.
  studentSheet.getRange(2, 4, studentSheet.getMaxRows() - 1).setDataValidation(rule);

  // 2. FIX USERS SHEET
  const userSheet = getSheetOrSetup(SHEETS.USERS);
  const userHeaders = SHEET_HEADERS[SHEETS.USERS];
  userSheet.getRange(1, 1, 1, userHeaders.length)
    .setValues([userHeaders])
    .setFontWeight("bold")
    .setBackground("#e6f2ff");

  // 3. FIX ATTENDANCE SHEET
  const attSheet = getSheetOrSetup(SHEETS.ATTENDANCE);
  const attHeaders = SHEET_HEADERS[SHEETS.ATTENDANCE];
  attSheet.getRange(1, 1, 1, attHeaders.length)
    .setValues([attHeaders])
    .setFontWeight("bold");

  return "Database Structure & Headers have been fixed successfully!";
}
