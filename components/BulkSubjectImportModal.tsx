
import React, { useState, useRef } from 'react';
import { X, FileSpreadsheet, Upload, CheckCircle2, Download, FileUp, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { ApiService } from '../services/api';
import * as XLSX from 'xlsx';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkSubjectImportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = ["Kode", "Nama Mata Pelajaran", "Kategori"];
    const data = [
      ["MTK", "Matematika", "Umum"],
      ["BIN", "Bahasa Indonesia", "Umum"],
      ["PROD", "Produktif TKJ", "Kejuruan"]
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Mapel");
    XLSX.writeFile(wb, "Template_Mapel.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const subjects = jsonData.map((row: any) => ({
            code: row['Kode'] || row['Code'] || '',
            name: row['Nama Mata Pelajaran'] || row['Nama'] || row['Name'] || '',
            category: row['Kategori'] || row['Category'] || 'Umum'
        })).filter(s => s.code && s.name);

        if (subjects.length > 0) {
            setParsedData(subjects);
            setStep('preview');
        } else {
            alert("Data kosong atau format salah. Pastikan header: Kode, Nama Mata Pelajaran, Kategori.");
        }
      } catch (err) {
        console.error(err);
        alert("Gagal membaca file.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      await ApiService.importSubjects(parsedData);
      setStep('success');
    } catch (error) {
      alert("Gagal import mapel.");
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 border border-gray-200">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-purple-600 rounded-lg text-white shadow-lg shadow-purple-200">
                <FileSpreadsheet className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">Import Mata Pelajaran</h3>
                <p className="text-sm text-gray-500">Upload bulk data mapel.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-6 min-h-[300px]">
          {step === 'input' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <FileUp className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-6 max-w-sm">Upload file Excel (.xlsx) berisi daftar mata pelajaran.</p>
              <div className="flex gap-3">
                 <Button variant="outline" onClick={handleDownloadTemplate}><Download className="w-4 h-4 mr-2" /> Template</Button>
                 <Button onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Upload Excel</Button>
                 <input type="file" hidden accept=".xlsx" ref={fileInputRef} onChange={handleFileUpload} />
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="flex-1 flex flex-col">
               <h4 className="font-bold mb-4">Preview ({parsedData.length} mapel)</h4>
               <div className="flex-1 overflow-auto border rounded-lg">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-gray-100">
                     <tr><th className="p-2">Kode</th><th className="p-2">Nama Mapel</th><th className="p-2">Kategori</th></tr>
                   </thead>
                   <tbody>
                     {parsedData.map((s, idx) => (
                       <tr key={idx} className="border-t">
                         <td className="p-2 font-mono text-purple-600">{s.code}</td>
                         <td className="p-2">{s.name}</td>
                         <td className="p-2 text-gray-500">{s.category}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               <div className="mt-4 flex justify-end gap-2">
                 <Button variant="ghost" onClick={handleReset}>Batal</Button>
                 <Button onClick={handleImport} isLoading={loading}>Proses Import</Button>
               </div>
            </div>
          )}

          {step === 'success' && (
             <div className="flex-1 flex flex-col items-center justify-center text-center">
                 <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                 <h3 className="text-xl font-bold">Import Berhasil!</h3>
                 <p className="text-gray-500 mt-2 mb-6">Data mapel telah tersimpan.</p>
                 <Button onClick={onClose}>Selesai</Button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
