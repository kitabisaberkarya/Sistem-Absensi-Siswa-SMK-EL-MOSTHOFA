
import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, BookOpen, School, Filter, RefreshCw, Download, Printer, FileSpreadsheet
} from 'lucide-react';
import { Button } from '../../components/Button';
import clsx from 'clsx';
import { ApiService, FullAttendanceLog } from '../../services/api';
import { ReportService } from '../../services/ReportService';
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

  // Semester Recap State
  const [recapType, setRecapType] = useState<'daily' | 'weekly' | 'monthly' | 'semester'>('semester');
  const [recapDate, setRecapDate] = useState(new Date().toISOString().split('T')[0]);
  const [recapMonth, setRecapMonth] = useState(new Date().getMonth().toString());
  const [semClass, setSemClass] = useState('');
  const [semPeriod, setSemPeriod] = useState<'Ganjil'|'Genap'>('Ganjil');
  const [semYear, setSemYear] = useState(new Date().getFullYear().toString());
  const [recapData, setRecapData] = useState<SemesterRecapEntry[]>([]);
  const [isRecapLoading, setIsRecapLoading] = useState(false);

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

  const fetchRecap = async () => {
      if (!semClass) {
          alert("Mohon pilih kelas terlebih dahulu.");
          return;
      }
      setIsRecapLoading(true);
      try {
          const payload: any = {
              classId: semClass,
              type: recapType,
              year: semYear
          };

          if (recapType === 'daily' || recapType === 'weekly') {
              payload.date = recapDate;
          } else if (recapType === 'monthly') {
              payload.month = parseInt(recapMonth);
          } else if (recapType === 'semester') {
              payload.semester = semPeriod;
          }

          const data = await ApiService.fetchRecap(payload);
          setRecapData(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e) {
          console.error(e);
          alert("Gagal mengambil data rekap.");
      } finally {
          setIsRecapLoading(false);
      }
  };

  const filterLogs = (data: FullAttendanceLog[], date: string, className: string) => {
      let res = data;
      if (date) res = res.filter(l => l.date.startsWith(date));
      if (className) res = res.filter(l => l.className === className);
      setFilteredLogs(res);
  };

  const handleExportPDF = () => {
      if (recapData.length === 0) return;
      const titleMap = {
          daily: 'LAPORAN PRESENSI HARIAN',
          weekly: 'LAPORAN PRESENSI MINGGUAN',
          monthly: 'LAPORAN PRESENSI BULANAN',
          semester: 'LAPORAN PRESENSI SEMESTER'
      };
      ReportService.generateSemesterPDF({
          title: `${titleMap[recapType]} ${recapType === 'semester' ? semPeriod.toUpperCase() : ''}`,
          subtitle: `TAHUN AJARAN ${semYear}/${parseInt(semYear) + 1} - KELAS ${semClass}`,
          date: new Date().toLocaleDateString('id-ID'),
          teacher: 'Administrator'
      }, recapData);
  };

  const handleExportExcel = () => {
      if (recapData.length === 0) return;
      ReportService.generateSemesterExcel({
          title: `REKAP_ABSENSI_${semClass}_${recapType}_${semYear}`,
          subtitle: `TAHUN AJARAN ${semYear}/${parseInt(semYear) + 1}`,
          date: new Date().toLocaleDateString('id-ID'),
          teacher: 'Administrator'
      }, recapData);
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
                Monitoring aktivitas belajar mengajar dan rekapitulasi nilai kehadiran.
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
                <BookOpen className="w-4 h-4" /> Rekapitulasi Presensi
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

              {/* Log Table */}
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

      {/* CONTENT: RECAP */}
      {activeTab === 'semester' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              
              {/* Filter Bar */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="w-full">
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Pilih Kelas</label>
                          <select 
                            className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            value={semClass}
                            onChange={(e) => setSemClass(e.target.value)}
                          >
                              <option value="">-- Pilih Kelas --</option>
                              {classList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                      </div>

                      <div className="w-full">
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tipe Rekap</label>
                          <select 
                            className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                            value={recapType}
                            onChange={(e) => setRecapType(e.target.value as any)}
                          >
                              <option value="daily">Harian</option>
                              <option value="weekly">Mingguan</option>
                              <option value="monthly">Bulanan</option>
                              <option value="semester">Semester</option>
                          </select>
                      </div>
                      
                      {recapType === 'daily' || recapType === 'weekly' ? (
                        <div className="w-full">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                {recapType === 'daily' ? 'Pilih Tanggal' : 'Tanggal Mulai'}
                            </label>
                            <input 
                                type="date"
                                className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                                value={recapDate}
                                onChange={(e) => setRecapDate(e.target.value)}
                            />
                        </div>
                      ) : recapType === 'monthly' ? (
                        <div className="w-full">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Pilih Bulan</label>
                            <select 
                                className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                                value={recapMonth}
                                onChange={(e) => setRecapMonth(e.target.value)}
                            >
                                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, idx) => (
                                    <option key={idx} value={idx}>{m}</option>
                                ))}
                            </select>
                        </div>
                      ) : (
                        <div className="w-full">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Semester</label>
                            <select 
                                className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                                value={semPeriod}
                                onChange={(e) => setSemPeriod(e.target.value as any)}
                            >
                                <option value="Ganjil">Ganjil (Juli - Des)</option>
                                <option value="Genap">Genap (Jan - Jun)</option>
                            </select>
                        </div>
                      )}

                      <div className="w-full">
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tahun</label>
                          <select 
                            className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                            value={semYear}
                            onChange={(e) => setSemYear(e.target.value)}
                          >
                              <option value="2024">2024</option>
                              <option value="2025">2025</option>
                              <option value="2026">2026</option>
                          </select>
                      </div>

                      <div className="md:col-span-4 flex justify-end mt-2">
                        <Button onClick={fetchRecap} isLoading={isRecapLoading} className="w-full md:w-auto h-[42px]">
                            Tampilkan Data Rekap
                        </Button>
                      </div>
                  </div>
              </div>

              {/* Data Table */}
              {recapData.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
                      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                          <div>
                              <h3 className="font-bold text-gray-800">Hasil Rekapitulasi {recapType.toUpperCase()}</h3>
                              <p className="text-xs text-gray-500">
                                  Kelas {semClass} • {recapType === 'semester' ? `Semester ${semPeriod}` : recapType === 'monthly' ? `Bulan ${parseInt(recapMonth)+1}` : recapDate}
                              </p>
                          </div>
                          <div className="flex gap-2">
                              <Button size="sm" variant="secondary" onClick={handleExportExcel} className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                              </Button>
                              <Button size="sm" variant="secondary" onClick={handleExportPDF} className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                  <Printer className="w-4 h-4 mr-2" /> Cetak PDF
                              </Button>
                          </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                                  <tr>
                                      <th className="px-4 py-3 text-center w-12">No</th>
                                      <th className="px-4 py-3">Nama Siswa</th>
                                      <th className="px-4 py-3 text-center">L/P</th>
                                      <th className="px-4 py-3 text-center bg-green-50 text-green-700">Hadir</th>
                                      <th className="px-4 py-3 text-center text-yellow-600">Sakit</th>
                                      <th className="px-4 py-3 text-center text-blue-600">Izin</th>
                                      <th className="px-4 py-3 text-center bg-red-50 text-red-600">Alpha</th>
                                      <th className="px-4 py-3 text-center">% Kehadiran</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {recapData.map((row, idx) => (
                                      <tr key={row.studentId} className="hover:bg-gray-50">
                                          <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                                          <td className="px-4 py-3 font-medium text-gray-900">
                                              {row.name}
                                              <div className="text-[10px] text-gray-400 font-mono">{row.nis}</div>
                                          </td>
                                          <td className="px-4 py-3 text-center">{row.gender}</td>
                                          <td className="px-4 py-3 text-center font-bold bg-green-50/30 text-green-700">{row.present}</td>
                                          <td className="px-4 py-3 text-center text-yellow-600">{row.sick}</td>
                                          <td className="px-4 py-3 text-center text-blue-600">{row.permission}</td>
                                          <td className="px-4 py-3 text-center font-bold bg-red-50/30 text-red-600">{row.alpha}</td>
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
                  </div>
              )}

              {!isRecapLoading && recapData.length === 0 && semClass && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>Belum ada data untuk ditampilkan. Silakan pilih filter dan klik "Tampilkan Data Rekap".</p>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};
