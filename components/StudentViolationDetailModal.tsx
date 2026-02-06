
import React, { useState, useEffect } from 'react';
import { X, Calendar, User, FileText, AlertTriangle, Download, Mail, Phone, MapPin, Hash, CheckCircle2, History } from 'lucide-react';
import { Button } from './Button';
import { ApiService } from '../services/api';
import { ReportService } from '../services/ReportService';
import { Student, StudentHistoryLog, AttendanceStatus } from '../types';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  riskStatus?: 'Aman' | 'Waspada' | 'Bahaya';
}

export const StudentViolationDetailModal: React.FC<Props> = ({ isOpen, onClose, student, riskStatus = 'Aman' }) => {
  const [history, setHistory] = useState<StudentHistoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'actions'>('history');

  useEffect(() => {
    if (isOpen && student) {
      const loadHistory = async () => {
        setLoading(true);
        try {
          const logs = await ApiService.fetchStudentHistory(student.id);
          setHistory(logs);
        } catch (error) {
          console.error("Failed to load student history", error);
        } finally {
          setLoading(false);
        }
      };
      loadHistory();
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  // Calculate stats from history
  const stats = {
    alpha: history.filter(h => h.status === AttendanceStatus.ABSENT).length,
    sick: history.filter(h => h.status === AttendanceStatus.SICK).length,
    permission: history.filter(h => h.status === AttendanceStatus.PERMISSION).length,
    present: history.filter(h => h.status === AttendanceStatus.PRESENT).length,
  };

  const handleGenerateLetter = (type: 'SP1' | 'SP2' | 'SP3') => {
    ReportService.generateCounselingLetter({
        studentName: student.name,
        className: student.className,
        nis: student.nis,
        violationCount: stats.alpha,
        letterType: type,
        date: new Date().toISOString()
    });
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
        case AttendanceStatus.ABSENT: return 'text-red-600 bg-red-50 border-red-100';
        case AttendanceStatus.SICK: return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        case AttendanceStatus.PERMISSION: return 'text-blue-600 bg-blue-50 border-blue-100';
        default: return 'text-green-600 bg-green-50 border-green-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-start">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 text-2xl">
                    {student.gender === 'L' ? '👨‍🎓' : '👩‍🎓'}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            <Hash className="w-3.5 h-3.5" /> {student.nis}
                        </span>
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium">
                            {student.className}
                        </span>
                        <span className={clsx(
                            "flex items-center gap-1 px-2 py-0.5 rounded border font-bold text-xs uppercase tracking-wide",
                            riskStatus === 'Bahaya' ? "bg-red-100 text-red-700 border-red-200" :
                            riskStatus === 'Waspada' ? "bg-orange-100 text-orange-700 border-orange-200" :
                            "bg-green-100 text-green-700 border-green-200"
                        )}>
                            {riskStatus === 'Bahaya' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Status: {riskStatus}
                        </span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* TABS & STATS */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 pt-6 pb-0">
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-3 rounded-xl border border-red-200 shadow-sm">
                    <p className="text-xs text-red-500 font-bold uppercase">Alpha</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.alpha}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-yellow-200 shadow-sm">
                    <p className="text-xs text-yellow-600 font-bold uppercase">Sakit</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.sick}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                    <p className="text-xs text-blue-600 font-bold uppercase">Izin</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.permission}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-green-200 shadow-sm">
                    <p className="text-xs text-green-600 font-bold uppercase">Hadir</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.present}</p>
                </div>
            </div>

            <div className="flex gap-6 border-b border-gray-300">
                <button 
                    onClick={() => setActiveTab('history')}
                    className={clsx(
                        "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                        activeTab === 'history' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    <History className="w-4 h-4" /> Riwayat Absensi
                </button>
                <button 
                    onClick={() => setActiveTab('actions')}
                    className={clsx(
                        "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                        activeTab === 'actions' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    <FileText className="w-4 h-4" /> Tindakan & Surat
                </button>
            </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            
            {/* TAB: HISTORY */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Memuat data...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                            Belum ada riwayat absensi tercatat.
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3">Tanggal</th>
                                        <th className="px-4 py-3">Mata Pelajaran</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map((log) => (
                                        <tr key={log.log_id} className="hover:bg-gray-50/80">
                                            <td className="px-4 py-3 font-mono text-gray-600">
                                                {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {log.subject}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={clsx("px-2 py-1 rounded text-xs font-bold border", getStatusColor(log.status))}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 italic max-w-xs truncate" title={log.note}>
                                                {log.note || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: ACTIONS */}
            {activeTab === 'actions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Contact Info */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-500" /> Kontak Wali Murid
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase">No. Telepon / WA</p>
                                    <p className="font-mono text-gray-800 font-medium">{student.parentPhone || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase">Alamat Rumah</p>
                                    <p className="text-gray-800">{student.address || '-'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <Button fullWidth variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200">
                                <Phone className="w-4 h-4 mr-2" /> Hubungi via WhatsApp
                            </Button>
                        </div>
                    </div>

                    {/* Letter Generator */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-brand-600" /> Generator Surat Panggilan
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Buat surat resmi otomatis berdasarkan tingkat pelanggaran siswa.
                        </p>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <p className="font-bold text-gray-700 text-sm">Surat Peringatan 1 (SP1)</p>
                                    <p className="text-xs text-gray-400">Rekomendasi: 3+ Alpha</p>
                                </div>
                                <Button size="sm" onClick={() => handleGenerateLetter('SP1')} className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100">
                                    <Download className="w-4 h-4 mr-2" /> PDF
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <div>
                                    <p className="font-bold text-orange-800 text-sm">Surat Peringatan 2 (SP2)</p>
                                    <p className="text-xs text-orange-600/70">Rekomendasi: 5+ Alpha</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={() => handleGenerateLetter('SP2')}
                                    disabled={stats.alpha < 3}
                                    className="bg-white text-orange-700 border border-orange-200 hover:bg-orange-50"
                                >
                                    <Download className="w-4 h-4 mr-2" /> PDF
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                <div>
                                    <p className="font-bold text-red-800 text-sm">Surat Panggilan Orang Tua (SP3)</p>
                                    <p className="text-xs text-red-600/70">Rekomendasi: 7+ Alpha / Kasus Berat</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={() => handleGenerateLetter('SP3')}
                                    disabled={stats.alpha < 5}
                                    className="bg-white text-red-700 border border-red-200 hover:bg-red-50"
                                >
                                    <Download className="w-4 h-4 mr-2" /> PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            )}

        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
            <Button onClick={onClose} className="px-8">
                Tutup Panel
            </Button>
        </div>

      </div>
    </div>
  );
};
