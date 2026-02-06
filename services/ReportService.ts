

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AttendanceStatus, SemesterRecapEntry } from '../types';

// Declare jsPDF with autoTable extension
type jsPDFWithAutoTable = any;

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

  // --- PDF Generation (Generic Daily/Student) ---
  generatePDF: (meta: ReportMeta, data: ReportRow[]) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    // Header Design
    doc.setFillColor(37, 99, 235); // Brand Blue
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(meta.title, 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(meta.subtitle, 14, 30);

    // Meta Info Block
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Tanggal: ${meta.date}`, 14, 50);
    if(meta.teacher) doc.text(`Guru/Staff: ${meta.teacher}`, 14, 55);

    // Table
    const tableColumn = ["No", "NIS", "Nama Siswa", "Kelas", "Status Kehadiran", "Keterangan"];
    const tableRows = data.map(row => [row.no, row.nis, row.name, row.className, row.status, row.note]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        lineColor: [229, 231, 235], // gray-200
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [37, 99, 235], // brand-600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // No
        1: { cellWidth: 25 }, // NIS
        4: { cellWidth: 35, fontStyle: 'bold' }, // Status
      },
      // Styling logic to match Preview
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
    doc.setTextColor(150, 150, 150);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()} oleh Sistem SMK EL MOSTHOFA`, 14, 285);

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

    // Header Design
    doc.setFillColor(37, 99, 235); // Brand Blue
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(meta.title, 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(meta.subtitle, 14, 30);

    // Meta Info Block
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Periode: ${meta.date}`, 14, 50);
    doc.text(`Wali Kelas/Admin: ${meta.teacher || '-'}`, 14, 55);

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
      startY: 65,
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

    // Footer
    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Simple Signature Area
    if (finalY < 250) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Mengetahui,", 140, finalY);
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
    
    // 1. KOP SURAT (Simple Text Version)
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("PEMERINTAH PROVINSI JAWA TIMUR", 105, 15, { align: "center" });
    doc.setFontSize(16);
    doc.text("DINAS PENDIDIKAN", 105, 22, { align: "center" });
    doc.setFontSize(18);
    doc.text("SMK EL MOSTHOFA", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text("Jalan Raya Pamekasan - Sumenep KM. 15, Pamekasan, Jawa Timur", 105, 36, { align: "center" });
    doc.text("Telp: (0324) 123456 | Email: admin@elmosthofa.sch.id", 105, 41, { align: "center" });
    
    // Line Separator
    doc.setLineWidth(0.5);
    doc.line(margin, 45, 190, 45);
    doc.setLineWidth(0.2);
    doc.line(margin, 46, 190, 46);

    // 2. HEADER SURAT
    let letterCode = "001";
    if (data.letterType === 'SP2') letterCode = "002";
    if (data.letterType === 'SP3') letterCode = "003";

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    
    // Tanggal
    const today = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
    doc.text(`Pamekasan, ${today}`, 140, 55);

    // Detail
    doc.text("Nomor", margin, 60); doc.text(`: 421/${letterCode}/BK/SMK-EM/${new Date().getFullYear()}`, 50, 60);
    doc.text("Lampiran", margin, 66); doc.text(": -", 50, 66);
    doc.text("Perihal", margin, 72); 
    doc.setFont("times", "bold");
    doc.text(`: PANGGILAN ORANG TUA (${data.letterType})`, 50, 72);
    doc.setFont("times", "normal");

    // Penerima
    doc.text("Yth. Bapak/Ibu Wali Murid", margin, 85);
    doc.text(`dari Siswa: ${data.studentName}`, margin, 91);
    doc.text("di Tempat", margin, 97);

    // 3. ISI SURAT
    doc.text("Dengan hormat,", margin, 110);
    
    const paragraph1 = `Sehubungan dengan ketidakhadiran dan pelanggaran tata tertib sekolah yang telah dilakukan oleh putra/putri Bapak/Ibu:`;
    const splitText1 = doc.splitTextToSize(paragraph1, 170);
    doc.text(splitText1, margin, 116);

    // Student Details
    doc.text("Nama", 30, 130); doc.text(`: ${data.studentName}`, 60, 130);
    doc.text("Kelas", 30, 136); doc.text(`: ${data.className}`, 60, 136);
    doc.text("NIS", 30, 142); doc.text(`: ${data.nis}`, 60, 142);
    doc.text("Pelanggaran", 30, 148); doc.text(`: Ketidakhadiran (Alpha) sebanyak ${data.violationCount} kali`, 60, 148);

    const paragraph2 = `Maka dengan ini kami mengharap kehadiran Bapak/Ibu Wali Murid di sekolah untuk berkonsultasi dengan Guru Bimbingan Konseling (BK) pada:`;
    const splitText2 = doc.splitTextToSize(paragraph2, 170);
    doc.text(splitText2, margin, 160);

    // Schedule
    doc.text("Hari / Tanggal", 30, 172); doc.text(`: Senin, ${today}`, 65, 172); // Default to "Next Monday" logic or Today for prototype
    doc.text("Waktu", 30, 178); doc.text(": 08.00 WIB - Selesai", 65, 178);
    doc.text("Tempat", 30, 184); doc.text(": Ruang BK SMK El Mosthofa", 65, 184);
    doc.text("Keperluan", 30, 190); doc.text(": Pembinaan dan Konsultasi Belajar", 65, 190);

    const paragraph3 = "Mengingat pentingnya hal tersebut demi kelancaran belajar putra/putri Bapak/Ibu, kami sangat mengharapkan kehadirannya tepat waktu. Atas perhatian dan kerjasamanya kami sampaikan terima kasih.";
    const splitText3 = doc.splitTextToSize(paragraph3, 170);
    doc.text(splitText3, margin, 205);

    // 4. SIGNATURE
    doc.text("Mengetahui,", margin, 230);
    doc.text("Kepala Sekolah", margin, 236);
    
    doc.text("Guru Bimbingan Konseling", 130, 236);

    // Space for signature
    doc.setFont("times", "bold");
    doc.text("( ................................... )", margin, 265);
    doc.text("( ................................... )", 130, 265);
    
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.text("NIP.", margin, 270);
    doc.text("NIP.", 130, 270);

    doc.save(`Surat_Panggilan_${data.letterType}_${data.studentName.replace(/\s+/g, '_')}.pdf`);
  }
};