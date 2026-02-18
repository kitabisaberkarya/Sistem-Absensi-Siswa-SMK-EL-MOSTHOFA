
import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, BookOpen, School, Filter, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/Button';
import clsx from 'clsx';
import { ApiService, FullAttendanceLog } from '../../services/api';
import { SemesterRecapEntry, ClassRoom, User as UserType } from '../../types';

type ReportType = 'logs' | 'semester';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('logs');
  const [classList, setClassList] = useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = useState<UserType[]>([]);
  
  // Log State
  const [logs, setLogs] = useState<FullAttendanceLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<FullAttendanceLog[]>([]);
  const [logFilterDate, setLogFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default Today
  const [logFilterClass, setLogFilterClass] = useState('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Semester State
  // ... (Existing semester state logic)

  // Init Data
  useEffect(() => {
    const init = async () => {
        try {
            const [classes, teachersData] = await Promise.all([
                ApiService.fetchClasses(),
                ApiService.fetchTeachers()
            ]);
            setClassList(classes.sort((a, b) => a.name.localeCompare(b.name)));
            setTeachers(teachersData);
        } catch (e) {}
    };
    init();
  }, []);

  const fetchLogs = async () => {
      setIsLoadingLogs(true);
      try {
          const data = await ApiService.fetchFullAttendanceLogs();
          const mapped = data.map(log => ({
              ...log,
              teacherName: teachers.find(t => t.id === log.teacherId)?.name || 'Unknown'
          }));
          setLogs(mapped);
          filterLogs(mapped, logFilterDate, logFilterClass);
      } catch(e) { console.error(e); }
      finally { setIsLoadingLogs(false); }
  };

  const filterLogs = (data: FullAttendanceLog[], date: string, className: string) => {
      let res = data;
      if (date) res = res.filter(l => l.date.startsWith(date));
      if (className) res = res.filter(l => l.className === className);
      setFilteredLogs(res);
  };

  useEffect(() => {
      if (activeTab === 'logs') {
          fetchLogs();
      }
  }, [activeTab]);

  useEffect(() => {
      filterLogs(logs, logFilterDate, logFilterClass);
  }, [logFilterDate, logFilterClass]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <School className="w-6 h-6 text-gray-700" />
                Pusat Laporan Absensi
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                Monitoring aktivitas belajar mengajar per sesi (pergantian jam).
            </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
                onClick={() => setActiveTab('logs')}
                className={clsx(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                    activeTab === 'logs' ? "bg-white text-brand-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
            >
                <Clock className="w-4 h-4" /> Log Harian (Per Jam)
            </button>
            <button
                onClick={() => setActiveTab('semester')}
                className={clsx(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                    activeTab === 'semester' ? "bg-white text-brand-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
            >
                <BookOpen className="w-4 h-4" /> Rekap Semester
            </button>
        </div>
      </div>

      {/* CONTENT: LOGS (PERGANTIAN JAM) */}
      {activeTab === 'logs' && (
          <div className="space-y-4">
              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                  <div className="w-full md:w-auto">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Tanggal</label>
                      <input 
                        type="date" 
                        className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                        value={logFilterDate}
                        onChange={(e) => setLogFilterDate(e.target.value)}
                      />
                  </div>
                  <div className="w-full md:w-auto">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Kelas</label>
                      <select 
                        className="w-full border p-2 rounded-lg text-sm min-w-[150px] focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        value={logFilterClass}
                        onChange={(e) => setLogFilterClass(e.target.value)}
                      >
                          <option value="">Semua Kelas</option>
                          {classList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                  </div>
                  <div className="flex-1 text-right">
                      <Button variant="ghost" onClick={fetchLogs} isLoading={isLoadingLogs}>
                          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
                      </Button>
                  </div>
              </div>

              {/* Enhanced Log Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold border-b border-gray-200">
                          <tr>
                              <th className="px-6 py-4">Waktu & Jam</th>
                              <th className="px-6 py-4">Kelas & Mapel</th>
                              <th className="px-6 py-4">Guru Pengajar</th>
                              <th className="px-6 py-4">Materi Jurnal</th>
                              <th className="px-6 py-4 text-center">Kehadiran</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {isLoadingLogs ? (
                              <tr><td colSpan={5} className="p-12 text-center text-gray-400">Sedang memuat data log...</td></tr>
                          ) : filteredLogs.length === 0 ? (
                              <tr><td colSpan={5} className="p-12 text-center text-gray-400 bg-gray-50/30">
                                  Tidak ada aktivitas absensi pada tanggal/kelas ini.
                              </td></tr>
                          ) : (
                              filteredLogs.map(log => (
                                  <tr key={log.logId} className="hover:bg-blue-50/30 transition-colors group">
                                      <td className="px-6 py-4 align-top">
                                          <div className="font-mono text-gray-800 font-bold">
                                              {new Date(log.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                          </div>
                                          <div className="text-xs text-gray-400">
                                              {new Date(log.date).toLocaleDateString('id-ID', { day:'numeric', month:'short' })}
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 align-top">
                                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold mr-2 border border-blue-200">
                                              {log.className}
                                          </span>
                                          <div className="mt-1 font-medium text-gray-700">{log.subject}</div>
                                      </td>
                                      <td className="px-6 py-4 align-top">
                                          <div className="font-bold text-gray-800">{log.teacherName}</div>
                                          <div className="text-xs text-gray-400">NIP Logged</div>
                                      </td>
                                      <td className="px-6 py-4 align-top text-gray-600 max-w-xs">
                                          <p className="line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                                              {log.topic}
                                          </p>
                                      </td>
                                      <td className="px-6 py-4 align-top text-center">
                                          <div className="flex flex-col items-center justify-center">
                                              <span className="text-xl font-bold text-green-600">{log.studentCount}</span>
                                              <span className="text-[10px] text-gray-400 uppercase">Siswa</span>
                                          </div>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Placeholder for Semester Tab */}
      {activeTab === 'semester' && (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
              Fitur Rekap Semester tersedia di menu terpisah (Coming Soon).
          </div>
      )}
    </div>
  );
};
