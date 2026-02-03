import React from 'react';
import { X, FileDown, FileSpreadsheet, Printer } from 'lucide-react';
import { ReportMeta, ReportRow, ReportService } from '../services/ReportService';
import { AttendanceStatus } from '../types';
import clsx from 'clsx';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  meta: ReportMeta;
  data: ReportRow[];
}

export const ReportPreviewModal: React.FC<Props> = ({ isOpen, onClose, meta, data }) => {
  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    ReportService.generatePDF(meta, data);
  };

  const handleDownloadExcel = () => {
    ReportService.generateExcel(meta, data);
  };

  const getRowStyle = (status: string) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return "bg-green-50 text-green-800 border-green-100";
      case AttendanceStatus.SICK: return "bg-yellow-50 text-yellow-800 border-yellow-100";
      case AttendanceStatus.PERMISSION: return "bg-blue-50 text-blue-800 border-blue-100";
      case AttendanceStatus.ABSENT: return "bg-red-50 text-red-800 border-red-100";
      default: return "bg-white text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-brand-50 rounded-lg text-brand-600">
                <Printer className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">Pratinjau Laporan</h3>
                <p className="text-sm text-gray-500">Silakan tinjau data sebelum mengunduh.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
           {/* A4 Paper Simulation */}
           <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] p-[15mm] text-sm relative">
              
              {/* Report Header */}
              <div className="border-b-2 border-brand-600 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{meta.title}</h1>
                    <h2 className="text-lg text-brand-600 font-medium">{meta.subtitle}</h2>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>SMK EL MOSTHOFA</p>
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="block font-semibold text-gray-400 text-xs uppercase">Tanggal Data</span>
                    {meta.date}
                  </div>
                  <div className="text-right">
                    <span className="block font-semibold text-gray-400 text-xs uppercase">Validator</span>
                    {meta.teacher || 'Administrator'}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-brand-600 text-white text-xs uppercase tracking-wider">
                    <th className="p-3 text-center w-12 border border-brand-700">No</th>
                    <th className="p-3 text-left w-24 border border-brand-700">NIS</th>
                    <th className="p-3 text-left border border-brand-700">Nama Siswa</th>
                    <th className="p-3 text-left w-24 border border-brand-700">Kelas</th>
                    <th className="p-3 text-center w-28 border border-brand-700">Status</th>
                    <th className="p-3 text-left border border-brand-700">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {data.map((row) => (
                    <tr key={row.no} className="border-b border-gray-200">
                      <td className="p-3 text-center font-mono text-gray-500 border-x border-gray-100">{row.no}</td>
                      <td className="p-3 font-mono text-gray-600 border-x border-gray-100">{row.nis}</td>
                      <td className="p-3 font-semibold text-gray-900 border-x border-gray-100">{row.name}</td>
                      <td className="p-3 text-gray-600 border-x border-gray-100">{row.className}</td>
                      <td className="p-3 text-center border-x border-gray-100">
                        <span className={clsx(
                          "px-2 py-1 rounded font-bold uppercase text-[10px] border",
                          getRowStyle(row.status)
                        )}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 border-x border-gray-100 italic">{row.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-8 pt-8 border-t border-gray-200 flex justify-between text-xs text-gray-400">
                 <p>Dokumen ini dicetak secara otomatis oleh sistem.</p>
                 <p>Hal. 1/1</p>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4 sticky bottom-0 z-20">
          <Button variant="ghost" onClick={onClose}>
             Batal
          </Button>
          <Button onClick={handleDownloadExcel} variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border border-green-200">
             <FileSpreadsheet className="w-4 h-4 mr-2" />
             Download Excel (.xlsx)
          </Button>
          <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200">
             <FileDown className="w-4 h-4 mr-2" />
             Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};