
import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { ImportedTeacher } from '../types';
import { ApiService } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkImportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [csvContent, setCsvContent] = useState('');
  const [parsedData, setParsedData] = useState<ImportedTeacher[]>([]);
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!csvContent) return;

    const lines = csvContent.split('\n');
    const detectedTeachers: ImportedTeacher[] = [];
    
    // Regex Logic to find: ;NO;NAME;;;;CODE;SUBJECT
    // Matches patterns like: ;1;ABDUL WAHED,M.Pd;;;;A;Pendidikan Agama...
    const teacherRegex = /;(\d+);([^;]+);;;;([^;]+);([^;]+)/;

    lines.forEach(line => {
      const match = line.match(teacherRegex);
      if (match) {
        detectedTeachers.push({
          no: match[1].trim(),
          name: match[2].trim(),
          code: match[3].trim(),
          subject: match[4].trim()
        });
      }
    });

    if (detectedTeachers.length > 0) {
      setParsedData(detectedTeachers);
      setStep('preview');
    } else {
      alert("Tidak ada data guru yang terdeteksi. Pastikan format CSV sesuai (Jadwal Pelajaran).");
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      await ApiService.importTeachers(parsedData);
      setStep('success');
    } catch (error) {
      alert("Gagal mengimpor data. Periksa koneksi atau format data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setCsvContent('');
    setParsedData([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-green-600 rounded-lg text-white shadow-lg shadow-green-200">
                <FileSpreadsheet className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">Import Data Jadwal (CSV)</h3>
                <p className="text-sm text-gray-500">Ekstrak data Guru & Mapel dari format CSV Jadwal.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {step === 'input' && (
            <div className="flex-1 p-6 flex flex-col">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex gap-3 text-blue-800 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>
                  Salin seluruh isi file CSV (separator titik koma) dan tempel di bawah ini. Sistem akan otomatis mendeteksi kolom: 
                  <strong> No, Nama Guru, Kode, dan Mata Pelajaran</strong>.
                </p>
              </div>
              <textarea
                className="flex-1 w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-mono text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="Paste CSV content here..."
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
              />
            </div>
          )}

          {step === 'preview' && (
            <div className="flex-1 p-0 overflow-hidden flex flex-col">
               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                 <h4 className="font-bold text-gray-700">Preview Data ({parsedData.length} entries)</h4>
                 <Button variant="ghost" onClick={handleReset} className="text-xs h-8">Ulangi</Button>
               </div>
               <div className="flex-1 overflow-auto p-0">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0">
                     <tr>
                       <th className="px-6 py-3">No</th>
                       <th className="px-6 py-3">Kode</th>
                       <th className="px-6 py-3">Nama Guru</th>
                       <th className="px-6 py-3">Mata Pelajaran</th>
                       <th className="px-6 py-3">Generated Email (Preview)</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {parsedData.map((row, idx) => (
                       <tr key={idx} className="hover:bg-gray-50">
                         <td className="px-6 py-3">{row.no}</td>
                         <td className="px-6 py-3 font-mono font-bold text-brand-600">{row.code}</td>
                         <td className="px-6 py-3 font-medium text-gray-900">{row.name}</td>
                         <td className="px-6 py-3 text-gray-600">{row.subject}</td>
                         <td className="px-6 py-3 text-gray-400 italic text-xs">guru.{row.code.toLowerCase()}@sekolah.sch.id</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {step === 'success' && (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                 <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
                     <CheckCircle2 className="w-12 h-12 text-green-600" />
                 </div>
                 <h3 className="text-3xl font-bold text-gray-900 mb-2">Import Berhasil!</h3>
                 <p className="text-gray-500 max-w-md">
                   {parsedData.length} data guru telah berhasil dimasukkan ke dalam database sistem. Akun pengguna telah dibuat secara otomatis.
                 </p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
          {step === 'input' && (
             <>
               <Button variant="ghost" onClick={onClose}>Batal</Button>
               <Button onClick={handleParse} disabled={!csvContent} className="bg-green-600 hover:bg-green-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Analisis File
               </Button>
             </>
          )}
          {step === 'preview' && (
             <>
               <Button variant="ghost" onClick={handleReset}>Kembali</Button>
               <Button onClick={handleImport} isLoading={loading} className="bg-brand-600 hover:bg-brand-700">
                  Proses Import
               </Button>
             </>
          )}
          {step === 'success' && (
             <Button onClick={onClose} className="bg-gray-900 hover:bg-gray-800">
                Tutup
             </Button>
          )}
        </div>
      </div>
    </div>
  );
};
