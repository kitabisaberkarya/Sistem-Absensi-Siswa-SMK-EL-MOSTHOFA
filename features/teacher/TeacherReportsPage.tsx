
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { ReportService } from '../../services/ReportService';
import { TeacherHistoryLog, SemesterRecapEntry, ClassRoom } from '../../types';
import { Button } from '../../components/Button';
import { 
  FileText, 
  History, 
  Calendar, 
  BookOpen, 
  Download, 
  Printer, 
  Search, 
  Filter,
  ArrowRight,
  School,
  FileSpreadsheet
} from 'lucide-react';
import clsx from 'clsx';

type Tab = 'history' | 'recap';

export const TeacherReportsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [loading, setLoading] = useState(false);

  // Data States
  const [historyLogs, setHistoryLogs] = useState<TeacherHistoryLog[]>([]);
  const [semesterData, setSemesterData] = useState<SemesterRecapEntry[]>([]);
  const [classList, setClassList] = useState<ClassRoom[]>([]);

  // Filter States (Recap)
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil');
  const [selectedYear, setSelectedYear] = useState('2024/2025');

  // Initial Load
  useEffect(() => {
    const loadMetadata = async () => {
        try {
            const classes = await ApiService.fetchClasses();
            setClassList(classes.sort((a, b) => a.name.localeCompare(b.name)));
            if (classes.length > 0) setSelectedClass(classes[0].name);
        } catch (e) { console.error(e); }
    };
    loadMetadata();
  }, []);

  // Fetch History on Tab Change
  useEffect(() => {
    if (activeTab === 'history' && user?.id) {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const logs = await ApiService.fetchTeacherHistory(user.id);
                setHistoryLogs(logs);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }
  }, [activeTab, user?.id]);

  // Handle Fetch Recap
  const handleFetchRecap = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
        const data = await ApiService.fetchSemesterRecap(selectedClass, selectedSemester, selectedYear);
        setSemesterData(data);
    } catch (e) {
        console.error(e);
        alert("Gagal memuat rekap data.");
    } finally {
        setLoading(false);
    }
  };

  // Export Logic
  const handleExportHistory = () => {
    // Convert history to ReportRow format for generic exporter
    const rows = historyLogs.map((log, idx) => ({
        no: idx + 1,
        name: log.topic, // Abuse name field for Topic
        nis: log.date.split('T')[0], // Abuse NIS for Date
        className: log.className,
        status: log.subject, // Abuse Status for Subject
        note: `${log.studentCount} Siswa` // Abuse Note
    }));

    ReportService.generateExcel({
        title: 'JURNAL MENGAJAR GURU',
        subtitle: `Riwayat Aktivitas - ${user?.name}`,
        date: new Date().toLocaleDateString(),
        teacher: user?.name
    }, rows);
  };

  const handleExportRecap = (type: 'pdf' | 'excel') => {
    const meta = {
        title: 'REKAPITULASI KEHADIRAN SISWA',
        subtitle: `Kelas ${selectedClass} - Semester ${selectedSemester} ${selectedYear}`,
        date: new Date().toLocaleDateString(),
        teacher: user?.name
    };

    if (type === 'pdf') {
        ReportService.generateSemesterPDF(meta, semesterData);
    } else {
        ReportService.generateSemesterExcel(meta, semesterData);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-7 h-7 text-brand-600" />
                Laporan & Jurnal Guru
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
                Kelola arsip jurnal mengajar dan cetak rekapitulasi kehadiran siswa.
            </p>
        </div>
        
        {/* Navigation Tabs (Pill Style) */}
        <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
                onClick={() => setActiveTab('history')}
                className={clsx(
                    "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    activeTab === 'history' 
                        ? "bg-white text-brand-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
            >
                <History className="w-4 h-4" /> Riwayat Mengajar
            </button>
            <button
                onClick={() => setActiveTab('recap')}
                className={clsx(
                    "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    activeTab === 'recap' 
                        ? "bg-white text-brand-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
            >
                <Printer className="w-4 h-4" /> Rekap Kehadiran
            </button>
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      
      {/* TAB: HISTORY (JURNAL) */}
      {activeTab === 'history' && (
        <div className="space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-brand-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Pertemuan</p>
                    <h3 className="text-3xl font-bold mt-1">{historyLogs.length}x</h3>
                    <p className="text-xs text-blue-200 mt-2">Sepanjang masa</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Terakhir Mengajar</p>
                    <h3 className="text-xl font-bold mt-1 text-gray-800">
                        {historyLogs.length > 0 
                            ? new Date(historyLogs[0].date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })
                            : '-'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">
                        {historyLogs.length > 0 ? historyLogs[0].className : ''}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-start">
                    <Button variant="outline" onClick={handleExportHistory} className="w-full border-green-200 text-green-700 hover:bg-green-50">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Download Jurnal (.xlsx)
                    </Button>
                </div>
            </div>

            {/* Timeline / List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Log Aktivitas Terbaru</h3>
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full">{historyLogs.length} Data</span>
                </div>
                
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Memuat riwayat...</div>
                ) : historyLogs.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">Belum ada riwayat mengajar.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {historyLogs.map((log) => (
                            <div key={log.logId} className="p-5 hover:bg-gray-50 transition-colors group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center border border-blue-100 flex-shrink-0">
                                            <span className="text-xs font-bold uppercase">{new Date(log.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                            <span className="text-lg font-bold leading-none">{new Date(log.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900">{log.className}</h4>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-sm font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{log.subject}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-1">{log.topic}</p>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <History className="w-3 h-3" /> 
                                                Diinput pada: {new Date(log.timestamp).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right pl-16 md:pl-0">
                                        <span className="block text-xl font-bold text-gray-800">{log.studentCount}</span>
                                        <span className="text-xs text-gray-500 uppercase font-medium">Siswa Hadir/Absen</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* TAB: RECAP (REKAP NILAI/ABSEN) */}
      {activeTab === 'recap' && (
        <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-brand-600" />
                    Filter Laporan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Kelas</label>
                        <select 
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                        >
                            {classList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Semester</label>
                        <select 
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                        >
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Tahun Ajaran</label>
                        <select 
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                        >
                            <option value="2023/2024">2023/2024</option>
                            <option value="2024/2025">2024/2025</option>
                            <option value="2025/2026">2025/2026</option>
                        </select>
                    </div>
                    <Button onClick={handleFetchRecap} isLoading={loading} className="w-full bg-brand-600 hover:bg-brand-700">
                        <Search className="w-4 h-4 mr-2" /> Tampilkan Data
                    </Button>
                </div>
            </div>

            {/* Results */}
            {semesterData.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">Hasil Rekapitulasi</h3>
                            <p className="text-sm text-gray-500">
                                Kelas {selectedClass} &bull; {selectedSemester} {selectedYear}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => handleExportRecap('excel')} className="text-green-700 border-green-200 hover:bg-green-50 text-xs h-9">
                                <FileSpreadsheet className="w-3.5 h-3.5 mr-2" /> Excel
                            </Button>
                            <Button variant="outline" onClick={() => handleExportRecap('pdf')} className="text-red-700 border-red-200 hover:bg-red-50 text-xs h-9">
                                <Download className="w-3.5 h-3.5 mr-2" /> PDF
                            </Button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-center w-12">No</th>
                                    <th className="px-6 py-3 w-24">NIS</th>
                                    <th className="px-6 py-3">Nama Siswa</th>
                                    <th className="px-6 py-3 text-center">Hadir</th>
                                    <th className="px-6 py-3 text-center">Sakit</th>
                                    <th className="px-6 py-3 text-center">Izin</th>
                                    <th className="px-6 py-3 text-center text-red-600">Alpha</th>
                                    <th className="px-6 py-3 text-center font-bold">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {semesterData.map((row, idx) => (
                                    <tr key={row.studentId} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-center text-gray-400">{idx + 1}</td>
                                        <td className="px-6 py-3 font-mono text-gray-500">{row.nis}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900">{row.name}</td>
                                        <td className="px-6 py-3 text-center font-bold text-green-600 bg-green-50/30">{row.present}</td>
                                        <td className="px-6 py-3 text-center text-yellow-600">{row.sick}</td>
                                        <td className="px-6 py-3 text-center text-blue-600">{row.permission}</td>
                                        <td className="px-6 py-3 text-center text-red-600 font-bold bg-red-50/30">{row.alpha}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-xs font-bold",
                                                row.percentage >= 90 ? "bg-green-100 text-green-700" :
                                                row.percentage >= 75 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {row.percentage}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && semesterData.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Pilih filter di atas untuk melihat data.</p>
                </div>
            )}
        </div>
      )}

    </div>
  );
};
