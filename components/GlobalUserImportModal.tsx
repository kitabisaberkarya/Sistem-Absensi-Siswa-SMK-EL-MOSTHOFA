
import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Download, FileUp, Users, FileText } from 'lucide-react';
import { Button } from './Button';
import { ImportedUser, Role } from '../types';
import { ApiService } from '../services/api';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalUserImportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [parsedData, setParsedData] = useState<ImportedUser[]>([]);
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // --- CSV UTILITIES ---

  const generateCSV = (headers: string[], rows: string[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(cell => `"${cell}"`).join(',')) // Quote cells to handle commas
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  };

  const parseCSVLine = (text: string) => {
    // Robust regex to handle quoted commas (e.g. "Jakarta, Indonesia")
    const re_value = /(?!\s*$)\s*(?:'([^']*)'|"([^"]*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    const a = [];
    text.replace(re_value, function(m0, m1, m2, m3) {
      if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
      else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
      else if (m3 !== undefined) a.push(m3);
      return '';
    });
    // Handle special case of empty last value
    if (/,\s*$/.test(text)) a.push('');
    return a;
  };

  // --- HANDLERS ---

  const handleDownloadTemplate = () => {
    const headers = ["Nama Lengkap", "Email", "Role", "NIP", "No HP", "Mapel", "Jenis Kelamin", "Password"];
    const data = [
      ["Budi Santoso", "budi@sekolah.sch.id", "TEACHER", "19850101", "08123456789", "Matematika", "L", "123456"],
      ["Siti Aminah", "siti@sekolah.sch.id", "COUNSELOR", "19900202", "08129876543", "-", "P", ""],
      ["Kepala Sekolah", "kepsek@sekolah.sch.id", "PRINCIPAL", "19800303", "08130000000", "-", "L", "securepass"],
      ["Staff Admin", "admin@sekolah.sch.id", "ADMIN", "19950404", "08140000000", "-", "L", ""]
    ];

    const url = generateCSV(headers, data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_users_global.csv");
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

        // Detect Header Index
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
        
        const mapData = lines.slice(1).map(line => {
            const row = parseCSVLine(line);
            
            // Safe Index Access Helper
            const getVal = (keywords: string[]) => {
                const idx = headers.findIndex(h => keywords.some(k => h.includes(k)));
                return idx !== -1 ? (row[idx] || '').trim() : '';
            };

            const roleRaw = getVal(['role', 'jabatan', 'posisi']).toUpperCase();
            // Validate Role
            let role = 'TEACHER';
            if (['ADMIN', 'COUNSELOR', 'PRINCIPAL'].includes(roleRaw)) role = roleRaw;

            return {
                name: getVal(['nama', 'name']),
                email: getVal(['email', 'surel']),
                role: role,
                nip: getVal(['nip', 'nomor induk']),
                phone: getVal(['hp', 'phone', 'telp']),
                subject: getVal(['mapel', 'subject', 'pelajaran']),
                gender: getVal(['kelamin', 'gender', 'l/p']).toUpperCase().startsWith('P') ? 'P' : 'L',
                password: getVal(['pass', 'kata sandi', 'sandi']) || '123456'
            } as ImportedUser;
        });

        const validData = mapData.filter(u => u.name && u.email && u.email.includes('@'));

        if (validData.length > 0) {
            setParsedData(validData);
            setStep('preview');
        } else {
            alert("Tidak ada data valid yang ditemukan. Pastikan format CSV benar (Nama, Email wajib diisi).");
        }

      } catch (err) {
        console.error(err);
        alert("Gagal membaca file CSV. Pastikan file tidak rusak dan menggunakan pemisah koma.");
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
      if (parsedData.length === 0) throw new Error("Tidak ada data untuk diimport.");
      
      const response = await ApiService.importGlobalUsers(parsedData);
      
      if (response && response.success) {
          setStep('success');
      } else {
          throw new Error(response?.message || "Gagal import data.");
      }
    } catch (error: any) {
      alert(`Gagal: ${error.message}`);
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
             <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
                <Users className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-900">Import Pengguna Global (CSV)</h3>
                <p className="text-sm text-gray-500">Upload Guru, Admin, Kepala Sekolah, dan Staff via CSV.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {step === 'input' && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border-2 border-blue-100">
                 <FileText className="w-10 h-10 text-blue-500" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex gap-3 text-blue-800 text-sm max-w-2xl text-left">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Format Standar Enterprise (CSV):</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Gunakan <strong>Template CSV</strong> yang disediakan.</li>
                    <li>Pastikan pemisah kolom adalah <strong>Koma (,)</strong>.</li>
                    <li>Kolom <strong>Role</strong> wajib diisi: <code>TEACHER</code>, <code>COUNSELOR</code>, <code>PRINCIPAL</code>, atau <code>ADMIN</code>.</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleDownloadTemplate} className="border-gray-300 hover:border-blue-500 hover:text-blue-600">
                   <Download className="w-4 h-4 mr-2" />
                   Download Template CSV
                </Button>
                <input 
                    type="file" 
                    hidden 
                    accept=".csv" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                 />
                 
                 <Button onClick={() => fileInputRef.current?.click()} isLoading={loading} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Pilih File CSV
                 </Button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="flex-1 p-0 overflow-hidden flex flex-col">
               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                 <h4 className="font-bold text-gray-700">Preview Data ({parsedData.length} users)</h4>
                 <Button variant="ghost" onClick={handleReset} className="text-xs h-8">Ulangi Upload</Button>
               </div>
               <div className="flex-1 overflow-auto p-0">
                 <table className="w-full text-sm text-left border-collapse">
                   <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0 shadow-sm z-10">
                     <tr>
                       <th className="px-6 py-3 border-b">Nama</th>
                       <th className="px-6 py-3 border-b">Email</th>
                       <th className="px-6 py-3 border-b">Role</th>
                       <th className="px-6 py-3 border-b">NIP</th>
                       <th className="px-6 py-3 border-b">Mapel</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {parsedData.map((row, idx) => (
                       <tr key={idx} className="hover:bg-gray-50">
                         <td className="px-6 py-3 font-medium text-gray-900">{row.name}</td>
                         <td className="px-6 py-3 text-gray-600">{row.email}</td>
                         <td className="px-6 py-3">
                            <span className={clsx(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                row.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                                row.role === 'PRINCIPAL' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                row.role === 'COUNSELOR' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                            )}>
                                {row.role}
                            </span>
                         </td>
                         <td className="px-6 py-3 font-mono text-xs text-gray-500">{row.nip}</td>
                         <td className="px-6 py-3 text-gray-500">{row.subject}</td>
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
                   {parsedData.length} data pengguna telah masuk ke database sistem.
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
               <Button onClick={handleImport} isLoading={loading} className="bg-blue-600 hover:bg-blue-700">
                  Proses Import Database
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
