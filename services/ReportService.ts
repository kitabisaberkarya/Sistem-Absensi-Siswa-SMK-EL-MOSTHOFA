import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AttendanceStatus } from '../types';

// Declare jsPDF with autoTable extension
// Using any to prevent type errors with jsPDF properties and autotable extension
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

  // --- PDF Generation ---
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

  // --- Excel Generation ---
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
  }
};