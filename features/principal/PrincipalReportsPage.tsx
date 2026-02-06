
import React, { useState, useEffect } from 'react';
import { ApiService, PrincipalReportData } from '../../services/api';
import { ReportService } from '../../services/ReportService';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  FileText, Download, Calendar, Activity, Users, Award, TrendingUp, ShieldCheck 
} from 'lucide-react';
import clsx from 'clsx';

export const PrincipalReportsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<PrincipalReportData | null>(null);
  
  // Filter State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await ApiService.fetchPrincipalReportData(selectedMonth, selectedYear);
      setReportData(data);
    } catch (e) {
      console.error(e);
      alert("Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const handleDownloadOfficial = () => {
    if (!reportData) return;
    ReportService.generateOfficialMinistryReport(
        reportData, 
        selectedMonth, 
        selectedYear, 
        user?.name || 'Kepala Sekolah'
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-gray-200 pb-6">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase rounded border border-blue-200 tracking-wider">
                    Standar Kemendikbud 2026
                </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-brand-600" />
                Laporan Eksekutif
            </h1>
            <p className="text-gray-500 mt-2 text-sm max-w-xl">
                Analisis makro performa sekolah dan generator dokumen resmi untuk pelaporan dinas.
            </p>
        </div>

        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="relative">
                <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm font-medium outline-none"
                >
                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm font-medium outline-none"
            >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
            </select>
            <Button onClick={fetchReport} isLoading={loading} className="h-10">
                Refresh
            </Button>
        </div>
      </div>

      {/* 2. Executive Summary Cards */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Siswa</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{reportData.summary.totalStudents}</h3>
                <p className="text-xs text-gray-500 mt-1">Aktif terdaftar bulan ini</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className={clsx("p-3 rounded-xl", 
                        reportData.summary.avgAttendance >= 90 ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                    )}>
                        <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kehadiran</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{reportData.summary.avgAttendance}%</h3>
                <p className="text-xs text-gray-500 mt-1">Rata-rata sekolah</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-50 rounded-xl text-red-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pelanggaran (Alpha)</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{reportData.summary.totalAlpha}</h3>
                <p className="text-xs text-gray-500 mt-1">Kejadian tanpa keterangan</p>
            </div>

            <div className="bg-gradient-to-br from-brand-900 to-blue-900 p-6 rounded-2xl text-white shadow-lg flex flex-col justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg mb-2">Cetak Laporan Resmi</h4>
                    <p className="text-blue-200 text-xs leading-relaxed mb-4">
                        Unduh dokumen PDF standar dinas pendidikan lengkap dengan tanda tangan elektronik.
                    </p>
                </div>
                <Button onClick={handleDownloadOfficial} className="w-full bg-white text-brand-900 hover:bg-blue-50 border-none font-bold">
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
            </div>
        </div>
      )}

      {/* 3. Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart: Class Performance */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Peringkat Performa Kelas
              </h3>
              <div className="overflow-y-auto max-h-[300px] pr-2 space-y-4">
                  {reportData?.classPerformance.map((item, idx) => (
                      <div key={item.className} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                          <div className={clsx(
                              "w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm",
                              idx === 0 ? "bg-yellow-100 text-yellow-700" :
                              idx === 1 ? "bg-gray-200 text-gray-700" :
                              idx === 2 ? "bg-orange-100 text-orange-700" : "bg-white border border-gray-200 text-gray-500"
                          )}>
                              {idx + 1}
                          </div>
                          <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                  <span className="font-semibold text-gray-800">{item.className}</span>
                                  <span className="font-mono text-sm font-bold text-brand-600">{item.percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div 
                                    className={clsx("h-2 rounded-full", item.percentage >= 90 ? "bg-green-500" : item.percentage >= 75 ? "bg-yellow-500" : "bg-red-500")} 
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Chart: Grade Comparison */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6">Komparasi Tingkat (Grade Level)</h3>
              <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData?.gradeComparison} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis dataKey="grade" type="category" width={80} tick={{fontSize: 12, fontWeight: 600}} />
                          <Tooltip 
                            cursor={{fill: '#f3f4f6'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          />
                          <Bar dataKey="attendance" name="Kehadiran (%)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40}>
                            {reportData?.gradeComparison.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.attendance >= 90 ? '#22c55e' : entry.attendance >= 80 ? '#3b82f6' : '#ef4444'} />
                            ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

      </div>
    </div>
  );
};
