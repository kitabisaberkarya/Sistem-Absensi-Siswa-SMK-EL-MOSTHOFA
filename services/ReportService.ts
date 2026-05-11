
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AttendanceStatus, SemesterRecapEntry } from '../types';
import { PrincipalReportData } from './api';

// Declare jsPDF with autoTable extension
type jsPDFWithAutoTable = any;

const ASSETS = {
  YAYASAN_LOGO: 'https://res.cloudinary.com/dt1nrarpq/image/upload/v1770438319/logo_yayan_at_tohiri_gg8vkq.png',
  SCHOOL_LOGO: 'https://res.cloudinary.com/dt1nrarpq/image/upload/v1770105471/LOGO_SEKOLAH_ourgxr.png'
};

export interface ReportRow {
  no: number;
  name: string;
  nis: string;
  className: string;
  status: string;
  note: string;
}

export interface ReportMeta {
  title: string;
  subtitle: string;
  date: string;
  teacher?: string;
}

// Letter Data Interface for BK
export interface LetterData {
  studentName: string;
  className: string;
  nis: string;
  parentName?: string;
  address?: string;
  violationCount: number;
  letterType: 'SP1' | 'SP2' | 'SP3';
  date: string;
}

export const ReportService = {
  // --- Helper: Get RGB Color for Status ---
  getStatusColor: (status: string): [number, number, number] => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return [220, 252, 231]; // green-100 (RGB)
      case AttendanceStatus.SICK:
        return [254, 249, 195]; // yellow-100
      case AttendanceStatus.PERMISSION:
        return [219, 234, 254]; // blue-100
      case AttendanceStatus.ABSENT:
        return [254, 226, 226]; // red-100
      default:
        return [255, 255, 255]; // white
    }
  },

  getStatusTextColor: (status: string): [number, number, number] => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return [21, 128, 61]; // green-700
      case AttendanceStatus.SICK:
        return [161, 98, 7]; // yellow-700
      case AttendanceStatus.PERMISSION:
        return [29, 78, 216]; // blue-700
      case AttendanceStatus.ABSENT:
        return [185, 28, 28]; // red-700
      default:
        return [55, 65, 81]; // gray-700
    }
  },

  // --- Helper: Draw Standard KOP Surat (Enterprise) ---
  drawKopSurat: (doc: any) => {
    const pageWidth = doc.internal.pageSize.width;
    const centerX = pageWidth / 2;

    // 1. Logos
    // Note: In real production, ensure these URLs allow CORS or convert to Base64 beforehand.
    try {
        doc.addImage(ASSETS.YAYASAN_LOGO, 'PNG', 15, 10, 25, 25); // Left Logo (Yayasan)
        doc.addImage(ASSETS.SCHOOL_LOGO, 'PNG', pageWidth - 40, 10, 25, 25); // Right Logo (School)
    } catch (e) {
        console.warn("Images could not be loaded in PDF", e);
    }

    // 2. Text Header
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "bold");
    
    doc.setFontSize(14);
    doc.text("YAYASAN PENDIDIKAN ISLAM AT-TOHIRI", centerX, 18, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("SMK EL MOSTHOFA", centerX, 25, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text("Jalan Raya Pamekasan - Sumenep KM. 15, Pamekasan, Jawa Timur", centerX, 30, { align: "center" });
    doc.setFontSize(9);
    doc.text("Telp: (0324) 123456 | Email: admin@elmosthofa.sch.id | Website: www.elmosthofa.sch.id", centerX, 35, { align: "center" });

    // 3. Double Line Separator
    doc.setLineWidth(0.5);
    doc.line(10, 39, pageWidth - 10, 39);
    doc.setLineWidth(0.2);
    doc.line(10, 40, pageWidth - 10, 40); // Thin line below
  },

  // --- PDF Generation (Generic Daily/Student) ---
  generatePDF: (meta: ReportMeta, data: ReportRow[]) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    // Use New KOP
    ReportService.drawKopSurat(doc);

    // Title Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(meta.title.toUpperCase(), 105, 55, { align: "center" });
    doc.setLineWidth(0.3);
    // Underline title
    const textWidth = doc.getTextWidth(meta.title.toUpperCase());
    doc.line(105 - (textWidth/2), 56, 105 + (textWidth/2), 56);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(meta.subtitle, 105, 62, { align: "center" });

    // Meta Info Block (Left Aligned below header)
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak : ${meta.date}`, 14, 72);
    if(meta.teacher) doc.text(`Validator     : ${meta.teacher}`, 14, 77);

    // Table
    const tableColumn = ["No", "NIS", "Nama Siswa", "Kelas", "Status", "Keterangan"];
    const tableRows = data.map(row => [row.no, row.nis, row.name, row.className, row.status, row.note]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 82,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [37, 99, 235], // brand-600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // No
        1: { cellWidth: 25 }, // NIS
        4: { cellWidth: 30, fontStyle: 'bold', halign: 'center' }, // Status
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 4) {
          const status = data.cell.raw;
          const bgColor = ReportService.getStatusColor(status);
          const textColor = ReportService.getStatusTextColor(status);
          
          data.cell.styles.fillColor = bgColor;
          data.cell.styles.textColor = textColor;
        }
      }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 285);
    doc.text("Sistem Informasi SMK El Mosthofa", 200, 285, { align: "right" });

    doc.save(`${meta.title.replace(/\s+/g, '_')}_${meta.date}.pdf`);
  },

  // --- Excel Generation (Generic) ---
  generateExcel: (meta: ReportMeta, data: ReportRow[]) => {
    // 1. Prepare Data with proper headers
    const excelData = data.map(row => ({
      'No': row.no,
      'NIS': row.nis,
      'Nama Siswa': row.name,
      'Kelas': row.className,
      'Status': row.status,
      'Keterangan': row.note
    }));

    // 2. Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 3. Add formatting (Column Widths)
    const wscols = [
      { wch: 5 },  // No
      { wch: 15 }, // NIS
      { wch: 30 }, // Name
      { wch: 15 }, // Class
      { wch: 15 }, // Status
      { wch: 40 }, // Note
    ];
    worksheet['!cols'] = wscols;

    // 4. Create Workbook and Append
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");

    // 5. Download
    XLSX.writeFile(workbook,(`${meta.title.replace(/\s+/g, '_')}_${meta.date}.xlsx`));
  },

  // --- PDF Generation (Semester Recap) ---
  generateSemesterPDF: (meta: ReportMeta, data: SemesterRecapEntry[]) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    // Use New KOP
    ReportService.drawKopSurat(doc);

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(meta.title, 105, 55, { align: "center" });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(meta.subtitle, 105, 62, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Periode Laporan : ${meta.date}`, 14, 75);

    // Table
    const tableColumn = ["No", "NIS", "Nama Siswa", "Hadir", "Sakit", "Izin", "Alpha", "% Kehadiran"];
    
    const tableRows = data.map((row, idx) => [
      idx + 1,
      row.nis,
      row.name,
      row.present,
      row.sick,
      row.permission,
      row.alpha,
      `${row.percentage}%`
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25 },
        3: { halign: 'center', fontStyle: 'bold' }, // Present
        4: { halign: 'center' }, // Sick
        5: { halign: 'center' }, // Permission
        6: { halign: 'center', textColor: [220, 38, 38] }, // Alpha (Red)
        7: { halign: 'center', fontStyle: 'bold' }, // %
      },
      didParseCell: (data: any) => {
         // Highlight low attendance
         if (data.section === 'body' && data.column.index === 7) {
            const val = parseFloat(data.cell.raw.replace('%', ''));
            if (val < 75) {
                data.cell.styles.textColor = [220, 38, 38]; // Red
            } else if (val >= 90) {
                data.cell.styles.textColor = [22, 163, 74]; // Green
            }
         }
      }
    });

    // Footer Signature
    const finalY = doc.lastAutoTable.finalY + 15;
    
    if (finalY < 250) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const today = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
        
        doc.text(`Pamekasan, ${today}`, 140, finalY);
        doc.text("Kepala Sekolah", 140, finalY + 5);
        doc.text("( ................................... )", 140, finalY + 25);
    }

    doc.save(`Rekap_Semester_${meta.subtitle.replace(/\s+/g, '_')}.pdf`);
  },

  // --- Excel Generation (Semester Recap) ---
  generateSemesterExcel: (meta: ReportMeta, data: SemesterRecapEntry[]) => {
    const excelData = data.map((row, idx) => ({
      'No': idx + 1,
      'NIS': row.nis,
      'Nama Siswa': row.name,
      'L/P': row.gender,
      'Hadir (H)': row.present,
      'Sakit (S)': row.sick,
      'Izin (I)': row.permission,
      'Alpha (A)': row.alpha,
      'Total Pertemuan': row.totalMeetings,
      'Persentase (%)': row.percentage
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const wscols = [
      { wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 5 }, 
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
      { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Semester");
    XLSX.writeFile(workbook, `Rekap_Semester_${meta.subtitle.replace(/\s+/g, '_')}.xlsx`);
  },

  // --- Counseling Letters Generator (NEW 2026 STANDARD) ---
  generateCounselingLetter: (data: LetterData) => {
    const doc = new jsPDF();
    const margin = 20;
    
    // 1. KOP SURAT (Uses Helper)
    ReportService.drawKopSurat(doc);

    // 2. HEADER SURAT
    let letterCode = "001";
    if (data.letterType === 'SP2') letterCode = "002";
    if (data.letterType === 'SP3') letterCode = "003";

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    
    // Tanggal
    const dateObj = data.date ? new Date(data.date) : new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
    doc.text(`Pamekasan, ${formattedDate}`, 140, 60);

    // Detail
    doc.text("Nomor", margin, 65); doc.text(`: 421/${letterCode}/BK/SMK-EM/${dateObj.getFullYear()}`, 50, 65);
    doc.text("Lampiran", margin, 71); doc.text(": -", 50, 71);
    doc.text("Perihal", margin, 77); 
    doc.setFont("times", "bold");
    doc.text(`: PANGGILAN ORANG TUA (${data.letterType})`, 50, 77);
    doc.setFont("times", "normal");

    // Penerima
    doc.text("Yth. Bapak/Ibu Wali Murid", margin, 90);
    doc.text(`dari Siswa: ${data.studentName}`, margin, 96);
    doc.text("di Tempat", margin, 102);

    // 3. ISI SURAT
    doc.text("Dengan hormat,", margin, 115);
    
    const paragraph1 = `Sehubungan dengan ketidakhadiran dan pelanggaran tata tertib sekolah yang telah dilakukan oleh putra/putri Bapak/Ibu:`;
    const splitText1 = doc.splitTextToSize(paragraph1, 170);
    doc.text(splitText1, margin, 121);

    // Student Details
    doc.text("Nama", 30, 135); doc.text(`: ${data.studentName}`, 60, 135);
    doc.text("Kelas", 30, 141); doc.text(`: ${data.className}`, 60, 141);
    doc.text("NIS", 30, 147); doc.text(`: ${data.nis}`, 60, 147);
    doc.text("Pelanggaran", 30, 153); doc.text(`: Ketidakhadiran (Alpha) sebanyak ${data.violationCount} kali`, 60, 153);

    const paragraph2 = `Maka dengan ini kami mengharap kehadiran Bapak/Ibu Wali Murid di sekolah untuk berkonsultasi dengan Guru Bimbingan Konseling (BK) pada:`;
    const splitText2 = doc.splitTextToSize(paragraph2, 170);
    doc.text(splitText2, margin, 165);

    // get day name for dateObj
    const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });

    // Schedule
    doc.text("Hari / Tanggal", 30, 177); doc.text(`: ${dayName}, ${formattedDate}`, 65, 177); // Used provided date for meeting
    doc.text("Waktu", 30, 183); doc.text(": 08.00 WIB - Selesai", 65, 183);
    doc.text("Tempat", 30, 189); doc.text(": Ruang BK SMK El Mosthofa", 65, 189);
    doc.text("Keperluan", 30, 195); doc.text(": Pembinaan dan Konsultasi Belajar", 65, 195);

    const paragraph3 = "Mengingat pentingnya hal tersebut demi kelancaran belajar putra/putri Bapak/Ibu, kami sangat mengharapkan kehadirannya tepat waktu. Atas perhatian dan kerjasamanya kami sampaikan terima kasih.";
    const splitText3 = doc.splitTextToSize(paragraph3, 170);
    doc.text(splitText3, margin, 210);

    // 4. SIGNATURE
    doc.text("Mengetahui,", margin, 235);
    doc.text("Kepala Sekolah", margin, 241);
    
    doc.text("Guru Bimbingan Konseling", 130, 241);

    // Space for signature
    doc.setFont("times", "bold");
    doc.text("( H. BUDI SANTOSO, S.Pd )", margin, 270);
    doc.text("( ................................... )", 130, 270);
    
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.text("NIP. 19850101 201001 1 001", margin, 275);
    doc.text("NIP.", 130, 275);

    doc.save(`Surat_Panggilan_${data.letterType}_${data.studentName.replace(/\s+/g, '_')}.pdf`);
  },

  // --- Official Ministry Report Generator (2026 Standard) ---
  generateOfficialMinistryReport: (data: PrincipalReportData, month: string, year: string, signerName: string) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const margin = 15;

    // 1. KOP SURAT RESMI (DINAS)
    ReportService.drawKopSurat(doc);

    // 2. HEADER LAPORAN
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("LAPORAN BULANAN SATUAN PENDIDIKAN", 105, 58, { align: "center" });
    doc.setFontSize(12);
    doc.text(`PERIODE: ${new Date(parseInt(year), parseInt(month)).toLocaleString('id-ID', { month: 'long' }).toUpperCase()} ${year}`, 105, 64, { align: "center" });

    // 3. TABLE 1: SUMMARY EKSEKUTIF
    doc.setFontSize(11);
    doc.text("A. RINGKASAN EKSEKUTIF", margin, 75);
    
    const summaryData = [
      ["Total Siswa Terdaftar", `${data.summary.totalStudents} Siswa`],
      ["Rata-rata Kehadiran", `${data.summary.avgAttendance}%`],
      ["Total Ketidakhadiran (Alpha)", `${data.summary.totalAlpha} Kejadian`],
      ["Total Sakit / Izin", `${data.summary.totalSick + data.summary.totalPermission} Kejadian`],
    ];

    doc.autoTable({
      startY: 80,
      head: [],
      body: summaryData,
      theme: 'grid',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
      },
      margin: { left: margin, right: margin }
    });

    // 4. TABLE 2: PERFORMA PER KELAS
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("times", "bold");
    doc.text("B. DATA KEHADIRAN PER ROMBONGAN BELAJAR", margin, finalY);

    const classHeaders = ["No", "Kelas", "Persentase Kehadiran", "Predikat"];
    const classRows = data.classPerformance.map((item, index) => [
      index + 1,
      item.className,
      `${item.percentage}%`,
      item.predicate
    ]);

    doc.autoTable({
      startY: finalY + 5,
      head: [classHeaders],
      body: classRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }, // Ministry Green
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        2: { halign: 'center' },
        3: { halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data: any) => {
        // Color coding for predicate
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw === 'Sangat Baik') data.cell.styles.textColor = [22, 163, 74];
          if (data.cell.raw === 'Kurang') data.cell.styles.textColor = [220, 38, 38];
        }
      },
      margin: { left: margin, right: margin }
    });

    // 5. SIGNATURE BLOCK
    let signY = doc.lastAutoTable.finalY + 20;
    if (signY > 250) {
      doc.addPage();
      signY = 40;
    }

    const todayDate = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});

    doc.setFont("times", "normal");
    doc.text(`Pamekasan, ${todayDate}`, 140, signY);
    doc.text("Kepala Sekolah,", 140, signY + 6);
    
    // Space for signature
    doc.setFont("times", "bold");
    doc.text(`H. BUDI SANTOSO, S.Pd`, 140, signY + 30);
    doc.setLineWidth(0.2);
    doc.line(140, signY + 31, 190, signY + 31); // Underline
    doc.setFont("times", "normal");
    doc.text("NIP. 19850101 201001 1 001", 140, signY + 36);

    doc.save(`Laporan_Bulanan_Kepsek_${month}_${year}.pdf`);
  }
};
