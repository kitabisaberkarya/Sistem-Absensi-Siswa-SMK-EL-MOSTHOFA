
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { ReportService } from '../../services/ReportService';
import { FileText, Calendar, BookOpen, Clock, Users, Search, Download, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { ClassRoom, SemesterRecapEntry } from '../../types';
import { Button } from '../../components/Button';
import clsx from 'clsx';

export const TeacherReportsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history'|'recap'>('history');
  
  // History Tab State
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Recap Tab State
  const [classList, setClassList] = useState<ClassRoom[]>([]);
  const [recapData, setRecapData] = useState<SemesterRecapEntry[]>([]);
  const [loadingRecap, setLoadingRecap] = useState(false);
  const [filters, setFilters] = useState({
      classId: '',
      semester: 'Ganjil',
      year: new Date().getFullYear().toString()
  });
  
  // Initial Data Load
  useEffect(() => {
    const init = async () => {
        try {
            // Load Class List for Filters
            const classes = await ApiService.fetchClasses();
            setClassList(classes.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (e) { console.error(e); }
    };
    init();
  }, []);

  // Fetch History on Tab Change
  useEffect(() => {
    if (activeTab === 'history' && user?.id) {
        setLoadingHistory(true);
        const fetch = async () => {
            try {
                const data = await ApiService.fetchTeacherHistory(user.id);
                setHistoryLogs(data);
            } catch(e) {
                console.error(e);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetch();
    }
  }, [activeTab, user]);

  // Handler: Fetch Recap
  const handleFetchRecap = async () => {
      if (!filters.classId) {
          alert("Mohon pilih kelas terlebih dahulu.");
          return;
      }
      setLoadingRecap(true);
      try {
          // Format Academic Year standard: "2024/2025"
          const academicYearStr = `${filters.year}/${parseInt(filters.year) + 1}`;
          const data = await ApiService.fetchSemesterRecap(filters.classId, filters.semester, academicYearStr);
          setRecapData(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e) {
          console.error(e);
          alert("Gagal mengambil data rekap.");
      } finally {
          setLoadingRecap(false);
      }
  };

  // Handler: Export
  const handleExport = (type: 'pdf' | 'excel') => {
      if (recapData.length === 0) return;
      
      const meta = {
          title: `REKAP ABSENSI ${filters.classId} - SEMESTER ${filters.semester.toUpperCase()}`,
          subtitle: `TAHUN AJARAN ${filters.year}/${parseInt(filters.year) + 1}`,
          date: new Date().toLocaleDateString('id-ID'),
          teacher: user?.name || 'Guru Mapel'
      };

      if (type === 'pdf') {
          ReportService.generateSemesterPDF(meta, recapData);
      } else {
          ReportService.generateSemesterExcel(meta, recapData);
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              Laporan & Jurnal Mengajar
          </h2>
          <p className="text-gray-500 text-sm mt-1 ml-14">
              Rekapitulasi aktivitas mengajar dan catatan perilaku siswa.
          </p>
          
          {/* TABS */}
          <div className="flex gap-2 mt-6 border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('history')}
                className={clsx(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                    activeTab === 'history' 
                        ? "border-brand-600 text-brand-600 bg-brand-50/50 rounded-t-lg" 
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
                )}
              >
                 <Clock className="w-4 h-4" /> Riwayat Jurnal (Per Jam)
              </button>
              <button 
                onClick={() => setActiveTab('recap')}
                className={clsx(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                    activeTab === 'recap' 
                        ? "border-brand-600 text-brand-600 bg-brand-50/50 rounded-t-lg" 
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
                )}
              >
                 <Users className="w-4 h-4" /> Rekap Kehadiran Siswa
              </button>
          </div>
      </div>

      {/* --- CONTENT: HISTORY --- */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
            {loadingHistory ? (
                <div className="text-center py-12 text-gray-400">Memuat jurnal...</div>
            ) : historyLogs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    Belum ada riwayat mengajar yang tercatat.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {historyLogs.map((log) => (
                            <div key={log.logId} className="p-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex flex-col sm:flex-row gap-5">
                                    {/* Date Badge */}
                                    <div className="w-full sm:w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex flex-col items-center justify-center border border-blue-100 flex-shrink-0 shadow-sm">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(log.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                        <span className="text-2xl font-black leading-none">{new Date(log.date).getDate()}</span>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                    {log.className}
                                                    <span className="text-gray-300 font-normal text-sm">|</span>
                                                    <span className="text-brand-600 font-medium text-sm flex items-center gap-1">
                                                        <BookOpen className="w-3.5 h-3.5" /> {log.subject}
                                                    </span>
                                                </h4>
                                            </div>
                                            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                                                {log.studentCount} Siswa
                                            </span>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Materi / Topik Pembahasan</p>
                                            <p className="text-sm text-gray-700 leading-relaxed font-medium">{log.topic}</p>
                                        </div>
                                        
                                        {/* Notes Display */}
                                        {log.notesSample && log.notesSample.length > 0 && (
                                            <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800">
                                                <div className="font-bold flex items-center gap-1.5 mb-1.5 text-yellow-900">
                                                    <FileText className="w-3.5 h-3.5" /> Catatan Kejadian / Siswa
                                                </div>
                                                <ul className="space-y-1 ml-1">
                                                    {log.notesSample.map((n: string, i: number) => (
                                                        <li key={i} className="pl-2 border-l-2 border-yellow-300">{n}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        <div className="mt-2 text-right">
                                            <span className="text-[10px] text-gray-400">
                                                Diinput pada: {new Date(log.timestamp).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}
      
      {/* --- CONTENT: RECAP --- */}
      {activeTab === 'recap' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              
              {/* Filter Bar */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Pilih Kelas</label>
                          <div className="relative">
                            <select 
                                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                                value={filters.classId}
                                onChange={(e) => setFilters({...filters, classId: e.target.value})}
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {classList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                          </div>
                      </div>
                      
                      <div className="w-full md:w-40">
                          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Semester</label>
                          <select 
                            className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                            value={filters.semester}
                            onChange={(e) => setFilters({...filters, semester: e.target.value})}
                          >
                              <option value="Ganjil">Ganjil</option>
                              <option value="Genap">Genap</option>
                          </select>
                      </div>

                      <div className="w-full md:w-40">
                          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Tahun Mulai</label>
                          <select 
                            className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                            value={filters.year}
                            onChange={(e) => setFilters({...filters, year: e.target.value})}
                          >
                              <option value="2023">2023/2024</option>
                              <option value="2024">2024/2025</option>
                              <option value="2025">2025/2026</option>
                          </select>
                      </div>

                      <Button onClick={handleFetchRecap} isLoading={loadingRecap} className="w-full md:w-auto h-[42px]">
                          <Search className="w-4 h-4 mr-2" /> Tampilkan
                      </Button>
                  </div>
              </div>

              {/* Empty State */}
              {!loadingRecap && recapData.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-gray-500">
                      <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Users className="w-8 h-8 text-brand-200" />
                      </div>
                      <p className="font-medium text-gray-900">Belum ada data ditampilkan</p>
                      <p className="text-sm mt-1">Silakan pilih filter Kelas dan Semester di atas lalu klik "Tampilkan".</p>
                  </div>
              )}

              {/* Data Table */}
              {recapData.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
                      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div>
                              <h3 className="font-bold text-gray-800">Hasil Rekapitulasi</h3>
                              <p className="text-xs text-gray-500">
                                  Kelas {filters.classId} • {filters.semester} {filters.year}/{parseInt(filters.year)+1}
                              </p>
                          </div>
                          <div className="flex gap-2">
                              <Button size="sm" variant="secondary" onClick={() => handleExport('excel')} className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => handleExport('pdf')} className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                  <Printer className="w-4 h-4 mr-2" /> PDF
                              </Button>
                          </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                                  <tr>
                                      <th className="px-4 py-3 text-center w-12 border-r border-gray-200">No</th>
                                      <th className="px-4 py-3 border-r border-gray-200">Nama Siswa</th>
                                      <th className="px-4 py-3 text-center w-16 border-r border-gray-200">L/P</th>
                                      <th className="px-4 py-3 text-center bg-green-50 text-green-700 border-r border-green-100">Hadir</th>
                                      <th className="px-4 py-3 text-center text-yellow-600 border-r border-gray-200">Sakit</th>
                                      <th className="px-4 py-3 text-center text-blue-600 border-r border-gray-200">Izin</th>
                                      <th className="px-4 py-3 text-center bg-red-50 text-red-600 border-r border-red-100">Alpha</th>
                                      <th className="px-4 py-3 text-center w-24">% Hadir</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {recapData.map((row, idx) => (
                                      <tr key={row.studentId} className="hover:bg-gray-50">
                                          <td className="px-4 py-3 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                                          <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-100">
                                              {row.name}
                                              <div className="text-[10px] text-gray-400 font-mono">{row.nis}</div>
                                          </td>
                                          <td className="px-4 py-3 text-center border-r border-gray-100">{row.gender}</td>
                                          <td className="px-4 py-3 text-center font-bold bg-green-50/30 text-green-700 border-r border-green-50">{row.present}</td>
                                          <td className="px-4 py-3 text-center text-yellow-600 border-r border-gray-100">{row.sick}</td>
                                          <td className="px-4 py-3 text-center text-blue-600 border-r border-gray-100">{row.permission}</td>
                                          <td className="px-4 py-3 text-center font-bold bg-red-50/30 text-red-600 border-r border-red-50">{row.alpha}</td>
                                          <td className="px-4 py-3 text-center">
                                              <span className={clsx(
                                                  "px-2 py-1 rounded-md text-xs font-bold",
                                                  row.percentage >= 90 ? "bg-green-100 text-green-700" :
                                                  row.percentage >= 75 ? "bg-yellow-100 text-yellow-700" :
                                                  "bg-red-100 text-red-700"
                                              )}>
                                                  {row.percentage}%
                                              </span>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                      <div className="bg-gray-50 p-3 text-xs text-center text-gray-400 border-t border-gray-200">
                          Data berdasarkan input harian guru pada periode semester terkait.
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};
