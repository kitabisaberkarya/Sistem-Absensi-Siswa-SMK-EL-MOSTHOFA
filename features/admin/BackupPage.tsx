
import React, { useState, useRef } from 'react';
import { Database, Download, Upload, AlertTriangle, CheckCircle2, History, FileJson, RefreshCw } from 'lucide-react';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';
import { BackupData } from '../../types';

export const BackupPage = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastBackupLink, setLastBackupLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setErrorMsg('');
    setSuccessMsg('');
    setLastBackupLink('');

    try {
      const response = await ApiService.createBackup();
      
      // 1. Trigger Download to Client
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup_sekolah_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 2. Show Success
      setSuccessMsg(`Backup berhasil dibuat! File terunduh otomatis dan tersimpan di Google Drive.`);
      if (response.driveLink) setLastBackupLink(response.driveLink);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat backup.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Warning confirmation
    if (!window.confirm("PERINGATAN: Tindakan ini akan menimpa seluruh data database saat ini dengan data dari file backup. Apakah Anda yakin ingin melanjutkan?")) {
        if(fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
        setIsRestoring(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const jsonContent = evt.target?.result as string;
            const backupData: BackupData = JSON.parse(jsonContent);
            
            // Basic Validation
            if (!backupData.users || !backupData.students || !backupData.attendance) {
                throw new Error("Format file backup tidak valid.");
            }

            await ApiService.restoreDatabase(backupData);
            setSuccessMsg("Database berhasil dipulihkan dari file backup.");
        } catch (err: any) {
            setErrorMsg(err.message || "Gagal memulihkan database. File korup atau koneksi terputus.");
        } finally {
            setIsRestoring(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="w-7 h-7 text-brand-600" />
            Backup & Restore
        </h2>
        <p className="text-gray-500 text-sm mt-1">Amankan data sekolah secara berkala atau pulihkan data dari file simpanan.</p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in zoom-in">
            <CheckCircle2 className="w-5 h-5" />
            <div className="flex-1">
                <p className="font-semibold">{successMsg}</p>
                {lastBackupLink && (
                    <a href={lastBackupLink} target="_blank" rel="noreferrer" className="text-xs underline hover:text-green-800 mt-1 block">
                        Lihat di Google Drive
                    </a>
                )}
            </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-in zoom-in">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Backup Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Download className="w-10 h-10 text-brand-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Buat Backup Baru</h3>
            <p className="text-gray-500 text-sm mb-8">
                Sistem akan membuat snapshot dari Users, Students, Attendance Log, dan System Logs. 
                File JSON akan diunduh ke perangkat Anda dan salinan disimpan ke Google Drive.
            </p>
            <Button 
                onClick={handleCreateBackup} 
                isLoading={isBackingUp} 
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-lg"
            >
                {isBackingUp ? 'Memproses...' : 'Download Backup Database'}
            </Button>
        </div>

        {/* Restore Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow relative overflow-hidden">
            {isRestoring && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-orange-500 animate-spin mb-3" />
                    <p className="font-bold text-gray-800">Sedang Memulihkan Data...</p>
                    <p className="text-xs text-gray-500">Jangan tutup halaman ini.</p>
                </div>
            )}
            
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <Upload className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Restore Database</h3>
            <p className="text-gray-500 text-sm mb-8">
                Pulihkan data dari file <strong>.json</strong> yang sebelumnya Anda unduh. 
                <br/>
                <span className="text-red-500 font-bold text-xs bg-red-50 px-2 py-0.5 rounded mt-2 inline-block">
                    PERHATIAN: Data saat ini akan ditimpa!
                </span>
            </p>
            
            <input 
                type="file" 
                ref={fileInputRef}
                accept=".json"
                hidden
                onChange={handleRestoreUpload}
            />
            
            <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()} 
                disabled={isRestoring}
                className="w-full py-3 border-orange-200 text-orange-700 hover:bg-orange-50 text-lg"
            >
                Upload File Backup
            </Button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mt-4">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            Informasi Teknis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
                <FileJson className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                    <span className="font-semibold block text-gray-700">Format Data JSON</span>
                    File backup menggunakan format JSON standar yang dapat dibaca mesin. Jangan memodifikasi isi file secara manual untuk mencegah kerusakan struktur data.
                </div>
            </div>
            <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                    <span className="font-semibold block text-gray-700">Google Drive Sync</span>
                    Setiap kali Anda melakukan backup, salinan file juga tersimpan otomatis di folder "ElMosthofa_Backups" pada Google Drive akun Admin.
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};
