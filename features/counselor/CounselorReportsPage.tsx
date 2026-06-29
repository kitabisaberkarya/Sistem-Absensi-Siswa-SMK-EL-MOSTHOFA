
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService, CounselingData } from '../../services/api';
import { ReportService } from '../../services/ReportService';
import { Student } from '../../types';
import { Button } from '../../components/Button';
import { StudentViolationDetailModal } from '../../components/StudentViolationDetailModal';
import { useToast } from '../../context/ToastContext';
import {
  FileText, 
  Search, 
  UserX,
  AlertTriangle,
  Mail,
  Download,
  Eye,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

type Tab = 'risk-monitor' | 'letters';

export const CounselorReportsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('risk-monitor');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CounselingData[]>([]); // Use the correct interface
  const [searchTerm, setSearchTerm] = useState('');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<CounselingData | null>(null);
  
  // Load data on mount
  const fetchData = async () => {
    setLoading(true);
    try {
      // Calls the new specific endpoint that aggregates ALL data correctly
      const counselingData = await ApiService.fetchCounselingData();
      
      // Sort by Alpha descending (Problem cases first)
      setData(counselingData.sort((a, b) => b.alpha - a.alpha));

    } catch (e) {
      console.error(e);
      showToast('error', 'Gagal mengambil data konseling');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateLetter = (v: CounselingData, type: 'SP1' | 'SP2' | 'SP3') => {
    ReportService.generateCounselingLetter({
        studentName: v.student.name,
        className: v.student.className,
        nis: v.student.nis,
        violationCount: v.alpha,
        letterType: type,
        date: letterDate
    });
  };

  const handleViewDetail = (violation: CounselingData) => {
    setSelectedViolation(violation);
    setIsDetailOpen(true);
  };

  const filteredData = data.filter(d => 
    d.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.student.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-7 h-7 text-brand-600" />
                Laporan & Administrasi BK
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
                Pusat data kedisiplinan dan generator surat otomatis.
            </p>
        </div>
        
        <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
                onClick={() => setActiveTab('risk-monitor')}
                className={clsx(
                    "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    activeTab === 'risk-monitor' 
                        ? "bg-white text-brand-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
            >
                <AlertTriangle className="w-4 h-4" /> Monitoring Pelanggaran
            </button>
            <button
                onClick={() => setActiveTab('letters')}
                className={clsx(
                    "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    activeTab === 'letters' 
                        ? "bg-white text-brand-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
            >
                <Mail className="w-4 h-4" /> Generator Surat (SP)
            </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 flex-1">
           <Search className="w-5 h-5 text-gray-400" />
           <input 
              type="text" 
              placeholder="Cari nama siswa atau kelas..." 
              className="flex-1 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <Button variant="outline" onClick={fetchData} className="border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
            <RefreshCcw className={clsx("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* CONTENT: RISK MONITOR */}
      {activeTab === 'risk-monitor' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">Siswa</th>
                        <th className="px-6 py-4">Kelas</th>
                        <th className="px-6 py-4 text-center text-red-600 bg-red-50">Alpha</th>
                        <th className="px-6 py-4 text-center">Sakit</th>
                        <th className="px-6 py-4 text-center">Izin</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Tindakan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={7} className="p-8 text-center text-gray-400">Memuat data terbaru...</td></tr>
                    ) : filteredData.length === 0 ? (
                        <tr><td colSpan={7} className="p-8 text-center text-gray-400">Tidak ada data siswa ditemukan.</td></tr>
                    ) : (
                        filteredData.map((d) => (
                            <tr key={d.student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold text-gray-900">{d.student.name}</td>
                                <td className="px-6 py-4 text-gray-600">{d.student.className}</td>
                                <td className="px-6 py-4 text-center font-bold text-red-600 bg-red-50/30">{d.alpha}</td>
                                <td className="px-6 py-4 text-center text-yellow-600">{d.sick}</td>
                                <td className="px-6 py-4 text-center text-blue-600">{d.permission}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={clsx(
                                        "px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1",
                                        d.status === 'Bahaya' ? 'bg-red-100 text-red-700' :
                                        d.status === 'Waspada' ? 'bg-orange-100 text-orange-700' :
                                        'bg-green-100 text-green-700'
                                    )}>
                                        {d.status === 'Bahaya' && <AlertTriangle className="w-3 h-3" />}
                                        {d.status === 'Aman' && <CheckCircle2 className="w-3 h-3" />}
                                        {d.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs h-8 text-brand-600 border-brand-200 hover:bg-brand-50"
                                        onClick={() => handleViewDetail(d)}
                                    >
                                        <Eye className="w-3 h-3 mr-1.5" /> Detail
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>
        </div>
      )}

      {/* CONTENT: LETTERS GENERATOR */}
      {activeTab === 'letters' && (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <span className="text-sm font-bold text-gray-700">Set Tanggal Surat & Pemanggilan:</span>
                <input 
                    type="date"
                    className="border border-gray-300 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.filter(d => d.alpha > 0).map((d) => (
                <div key={d.student.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-gray-900">{d.student.name}</h3>
                            <p className="text-sm text-gray-500">{d.student.className}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold border border-red-100">
                            {d.alpha}
                        </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Kategori:</span>
                            <span className={clsx(
                                "font-bold",
                                d.status === 'Bahaya' ? "text-red-600" : "text-orange-500"
                            )}>{d.status}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                            Rekomendasi: {d.alpha >= 5 ? 'Panggilan Orang Tua (SP2)' : 'Pembinaan Wali Kelas'}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => handleGenerateLetter(d, 'SP1')}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 hover:text-brand-600 transition-colors flex flex-col items-center gap-1"
                        >
                            <Download className="w-3 h-3" /> SP 1
                        </button>
                        <button 
                            onClick={() => handleGenerateLetter(d, 'SP2')}
                            disabled={d.alpha < 3}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 hover:text-brand-600 transition-colors flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-3 h-3" /> SP 2
                        </button>
                        <button 
                            onClick={() => handleGenerateLetter(d, 'SP3')}
                            disabled={d.alpha < 5} // Adjusted logic
                            className="px-3 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-3 h-3" /> SP 3
                        </button>
                    </div>
                </div>
            ))}
            
            {filteredData.filter(d => d.alpha > 0).length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
                    <UserX className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    Belum ada siswa dengan catatan pelanggaran absensi (Alpha).
                </div>
            )}
            </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      <StudentViolationDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        student={selectedViolation?.student || null}
        riskStatus={selectedViolation?.status}
      />

    </div>
  );
};
