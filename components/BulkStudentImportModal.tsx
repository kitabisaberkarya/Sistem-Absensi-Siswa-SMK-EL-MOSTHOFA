
import React, { useState, useRef } from 'react';
import { X, FileSpreadsheet, Upload, CheckCircle2, Download, FileUp, GraduationCap } from 'lucide-react';
import { Button } from './Button';
import { ImportedStudent } from '../types';
import { ApiService } from '../services/api';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkStudentImportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [parsedData, setParsedData] = useState<ImportedStudent[]>([]);
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // --- CSV HELPER ---
  const generateCSV = (headers: string[], rows: string[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  };

  const parseCSVLine = (text: string) => {
    const re_value = /(?!\s*$)\s*(?:'([^']*)'|"([^"]*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    const a = [];
    text.replace(re_value, function(m0, m1, m2, m3) {
      if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
      else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
      else if (m3 !== undefined) a.push(m3);
      return '';
    });
    if (/,\s*$/.test(text)) a.push('');
    return a;
  };

  const handleDownloadTemplate = () => {
    const headers = ["No", "Nama Siswa", "NIS", "Kelas", "Jenis Kelamin (L/P)", "No HP Ortu", "Alamat"];
    const data = [
      ["1", "Ahmad Dahlan", "2023001", "10-TKJ-1", "L", "081234567890", "Jl. Raya Pamekasan No. 1"],
      ["2", "Siti Aisyah", "2023002", "10-TKJ-1", "P", "081987654321", "Jl. Trunojoyo No. 45"],
    ];

    const url = generateCSV(headers, data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_siswa_sekolah.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');

        if (lines.length < 2) throw new Error("File CSV kosong atau format salah.");

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

        const students = lines.slice(1).map(line => {
            const row = parseCSVLine(line);
            
            const getVal = (keywords: string[]) => {
                const idx = headers.findIndex(h => keywords.some(k => h.includes(k)));
                return idx !== -1 ? (row[idx] || '').trim() : '';
            };

            return {
                no: getVal(['no']),
                name: getVal(['nama', 'name']),
                nis: getVal(['nis', 'induk']),
                className: getVal(['kelas', 'class']),
                gender: getVal(['kelamin', 'gender', 'l/p']).toUpperCase().startsWith('P') ? 'P' : 'L',
                parentPhone: getVal(['hp', 'phone', 'ortu']),
                address: getVal(['alamat', 'address'])
            } as ImportedStudent;
        }).filter(s => s.name && s.nis);

        if (students.length > 0) {
            setParsedData(students);
            setStep('preview');
        } else {
            alert("Data kosong atau format template tidak sesuai (Header: Nama Siswa, NIS, Kelas, ...).");
        }
      } catch (err) {
        console.error(err);
        alert("Gagal membaca file CSV.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      await ApiService.importStudents(parsedData);
      setStep('success');
    } catch (error) {
      alert("Gagal mengimpor data. Periksa koneksi atau format data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setParsedData([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-brand-600 rounded-lg text-white shadow-lg shadow-brand-200">
                <GraduationCap className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">Import Data Siswa (CSV)</h3>
                <p className="text-sm text-gray-500">Upload bulk data siswa via file .csv</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {step === 'input' && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/50">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                 <FileUp className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Upload File Database Siswa</h4>
              <p className="text-gray-500 max-w-md mb-8">
                Gunakan template resmi CSV. Pastikan data Kelas sesuai dengan Data Kelas di sistem.
              </p>
              
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleDownloadTemplate} className="border-gray-300 hover:border-brand-500 hover:text-brand-600">
                   <Download className="w-4 h-4 mr-2" />
                   Download Template CSV
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} isLoading={loading} className="bg-brand-600 hover:bg-brand-700">
                   <Upload className="w-4 h-4 mr-2" />
                   Pilih File CSV
                </Button>
                <input 
                    type="file" 
                    hidden 
                    accept=".csv" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                 />
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="flex-1 p-0 overflow-hidden flex flex-col">
               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                 <h4 className="font-bold text-gray-700">Preview Data ({parsedData.length} siswa)</h4>
                 <Button variant="ghost" onClick={handleReset} className="text-xs h-8">Ulangi Upload</Button>
               </div>
               <div className="flex-1 overflow-auto p-0">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0 shadow-sm z-10">
                     <tr>
                       <th className="px-6 py-3">No</th>
                       <th className="px-6 py-3">NIS</th>
                       <th className="px-6 py-3">Nama Siswa</th>
                       <th className="px-6 py-3">Kelas</th>
                       <th className="px-6 py-3">L/P</th>
                       <th className="px-6 py-3">HP Ortu</th>
                       <th className="px-6 py-3">Alamat</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {parsedData.map((row, idx) => (
                       <tr key={idx} className="hover:bg-gray-50">
                         <td className="px-6 py-3">{row.no || idx + 1}</td>
                         <td className="px-6 py-3 font-mono font-bold text-gray-700">{row.nis}</td>
                         <td className="px-6 py-3 font-medium text-gray-900">{row.name}</td>
                         <td className="px-6 py-3">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold">{row.className}</span>
                         </td>
                         <td className="px-6 py-3">{row.gender}</td>
                         <td className="px-6 py-3 text-gray-500">{row.parentPhone || '-'}</td>
                         <td className="px-6 py-3 text-gray-500 truncate max-w-[150px]">{row.address || '-'}</td>
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
                   {parsedData.length} data siswa telah berhasil dimasukkan ke dalam database sistem.
                 </p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className={clsx("p-6 border-t border-gray-100 bg-white flex items-center gap-3", step === 'input' ? 'justify-end' : 'justify-end')}>
          {step === 'input' && (
             <Button variant="ghost" onClick={onClose}>Batal</Button>
          )}
          {step === 'preview' && (
             <>
               <Button variant="ghost" onClick={handleReset}>Batal</Button>
               <Button onClick={handleImport} isLoading={loading} className="bg-brand-600 hover:bg-brand-700">
                  Simpan ke Database
               </Button>
             </>
          )}
          {step === 'success' && (
             <Button onClick={onClose} className="bg-gray-900 hover:bg-gray-800">
                Tutup Selesai
             </Button>
          )}
        </div>
      </div>
    </div>
  );
};
