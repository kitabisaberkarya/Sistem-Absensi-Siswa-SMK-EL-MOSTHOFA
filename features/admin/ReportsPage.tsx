
import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, Filter, FileSpreadsheet, Printer, ChevronDown, 
  Search, School, User, LayoutList, Grid3X3, BookOpen, Clock, Users 
} from 'lucide-react';
import { Button } from '../../components/Button';
import clsx from 'clsx';
import { ReportService } from '../../services/ReportService';
import { ApiService, FullAttendanceLog } from '../../services/api';
import { SemesterRecapEntry, ClassRoom, User as UserType } from '../../types';

type ReportType = 'logs' | 'monthly' | 'student' | 'semester';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('logs');
  const [classList, setClassList] = useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = useState<UserType[]>([]);
  
  // Log State
  const [logs, setLogs] = useState<FullAttendanceLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<FullAttendanceLog[]>([]);
  const [logFilterDate, setLogFilterDate] = useState('');
  const [logFilterClass, setLogFilterClass] = useState('');

  // Semester State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil');
  const [selectedYear, setSelectedYear] = useState('2024/2025');
  const [semesterData, setSemesterData] = useState<SemesterRecapEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
            if (classes.length > 0) setSelectedClass(classes[0].name);
        } catch (e) {}
    };
    init();
  }, []);

  // Fetch Logs (Realtime Activity)
  useEffect(() => {
      if (activeTab === 'logs') {
          const fetchLogs = async () => {
              setIsLoading(true);
              try {
                  const data = await ApiService.fetchFullAttendanceLogs();
                  // Map Teacher Names
                  const mapped = data.map(log => ({
                      ...log,
                      teacherName: teachers.find(t => t.id === log.teacherId)?.name || 'Unknown'
                  }));
                  setLogs(mapped);
                  setFilteredLogs(mapped);
              } catch(e) { console.error(e); }
              finally { setIsLoading(false); }
          };
          fetchLogs();
      }
  }, [activeTab, teachers]);

  // Filter Logs
  useEffect(() => {
      if (activeTab === 'logs') {
          let res = logs;
          if (logFilterDate) res = res.filter(l => l.date.includes(logFilterDate));
          if (logFilterClass) res = res.filter(l => l.className === logFilterClass);
          setFilteredLogs(res);
      }
  }, [logFilterDate, logFilterClass, logs]);

  const handleGenerateSemester = async () => {
    setIsLoading(true);
    try {
        const data = await ApiService.fetchSemesterRecap(selectedClass, selectedSemester, selectedYear);
        setSemesterData(data);
    } catch (e) { alert("Gagal memuat."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pb-6">
         <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <School className="w-6 h-6 text-gray-700" />
                    Pusat Laporan & Arsip
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Monitoring aktivitas belajar mengajar secara realtime.
                </p>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
         <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
                onClick={() => setActiveTab('logs')}
                className={clsx(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                    activeTab === 'logs' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
                )}
            >
                <Clock className="w-4 h-4" /> Log Aktivitas Belajar
            </button>
            <button
                onClick={() => setActiveTab('semester')}
                className={clsx(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                    activeTab === 'semester' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
                )}
            >
                <BookOpen className="w-4 h-4" /> Rekap Semester
            </button>
         </nav>
      </div>

      {/* CONTENT: LOGS (PERGANTIAN JAM) */}
      {activeTab === 'logs' && (
          <div className="space-y-4">
              {/* Filter */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                  <input 
                    type="date" 
                    className="border p-2 rounded-lg text-sm" 
                    value={logFilterDate}
                    onChange={(e) => setLogFilterDate(e.target.value)}
                  />
                  <select 
                    className="border p-2 rounded-lg text-sm"
                    value={logFilterClass}
                    onChange={(e) => setLogFilterClass(e.target.value)}
                  >
                      <option value="">Semua Kelas</option>
                      {classList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                          <tr>
                              <th className="px-6 py-3">Waktu Input</th>
                              <th className="px-6 py-3">Tanggal KBM</th>
                              <th className="px-6 py-3">Guru</th>
                              <th className="px-6 py-3">Kelas / Mapel</th>
                              <th className="px-6 py-3">Materi</th>
                              <th className="px-6 py-3 text-center">Jml Siswa</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {isLoading ? (
                              <tr><td colSpan={6} className="p-8 text-center">Memuat log...</td></tr>
                          ) : filteredLogs.length === 0 ? (
                              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Tidak ada data.</td></tr>
                          ) : (
                              filteredLogs.map(log => (
                                  <tr key={log.logId} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-500 text-xs">
                                          {new Date(log.timestamp).toLocaleString('id-ID')}
                                      </td>
                                      <td className="px-6 py-4 font-medium">
                                          {new Date(log.date).toLocaleDateString('id-ID', {day: 'numeric', month:'long'})}
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-gray-800">{log.teacherName}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold mr-2">{log.className}</span>
                                          <span className="text-gray-600">{log.subject}</span>
                                      </td>
                                      <td className="px-6 py-4 text-gray-600 truncate max-w-xs" title={log.topic}>
                                          {log.topic}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold text-xs">{log.studentCount}</span>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* CONTENT: SEMESTER RECAP */}
      {activeTab === 'semester' && (
          <div className="space-y-4">
               {/* Same Filter UI as before */}
               <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Kelas</label>
                        <select className="w-full border p-2 rounded-lg" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            {classList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    {/* ... other filters ... */}
                    <Button onClick={handleGenerateSemester} isLoading={isLoading}>Tampilkan</Button>
               </div>

               {/* Table Result */}
               {semesterData.length > 0 && (
                   <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                       <table className="w-full text-sm">
                           <thead className="bg-gray-100">
                               <tr>
                                   <th className="p-3 text-left">Nama</th>
                                   <th className="p-3 text-center">H</th>
                                   <th className="p-3 text-center">S</th>
                                   <th className="p-3 text-center">I</th>
                                   <th className="p-3 text-center">A</th>
                                   <th className="p-3 text-center">%</th>
                               </tr>
                           </thead>
                           <tbody>
                               {semesterData.map(row => (
                                   <tr key={row.studentId} className="border-t hover:bg-gray-50">
                                       <td className="p-3 font-medium">{row.name}</td>
                                       <td className="p-3 text-center bg-green-50">{row.present}</td>
                                       <td className="p-3 text-center bg-yellow-50">{row.sick}</td>
                                       <td className="p-3 text-center bg-blue-50">{row.permission}</td>
                                       <td className="p-3 text-center bg-red-50 text-red-600 font-bold">{row.alpha}</td>
                                       <td className="p-3 text-center font-bold">{row.percentage}%</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               )}
          </div>
      )}
    </div>
  );
};
