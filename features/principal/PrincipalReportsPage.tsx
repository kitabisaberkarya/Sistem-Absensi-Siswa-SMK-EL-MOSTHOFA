import React, { useState, useEffect } from 'react';
import { ApiService, PrincipalReportData } from '../../services/api';
import { ReportService } from '../../services/ReportService';
import { 
  FileText, Download, TrendingUp, Users, AlertCircle, CheckCircle2, Clock 
} from 'lucide-react';
import { Button } from '../../components/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import clsx from 'clsx';

export const PrincipalReportsPage = () => {
  const [reportData, setReportData] = useState<PrincipalReportData | null>(null);
  const [month, setMonth] = useState(new Date().getMonth().toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await ApiService.fetchPrincipalReportData(month, year);
      setReportData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const handleDownloadPDF = () => {
    if (!reportData) return;
    ReportService.generateOfficialMinistryReport(reportData, month, year, 'Kepala Sekolah');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-7 h-7 text-brand-600" />
                Laporan Bulanan Sekolah
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                Rekapitulasi resmi kehadiran siswa untuk evaluasi bulanan.
            </p>
        </div>
        
        <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-200">
            <select 
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
            >
                {Array.from({length: 12}, (_, i) => (
                    <option key={i} value={i}>{new Date(0, i).toLocaleString('id-ID', {month: 'long'})}</option>
                ))}
            </select>
            <select 
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                value={year}
                onChange={(e) => setYear(e.target.value)}
            >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
            </select>
            <Button onClick={handleDownloadPDF} disabled={!reportData} className="ml-2">
                <Download className="w-4 h-4 mr-2" /> Cetak PDF
            </Button>
        </div>
      </div>

      {loading ? (
          <div className="text-center py-20 text-gray-400">Sedang menghitung statistik...</div>
      ) : reportData && (
        <>
            {/* 2. Executive Summary Cards (Fixed to show all statuses) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Total Siswa */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Siswa</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{reportData.summary.totalStudents}</h3>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><Users className="w-5 h-5" /></div>
                    </div>
                    <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gray-800 h-full w-full"></div>
                    </div>
                </div>
                
                {/* Kehadiran (Hadir) */}
                <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Rata-rata Hadir</p>
                            <h3 className="text-3xl font-bold text-green-700 mt-1">{reportData.summary.avgAttendance}%</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                    </div>
                    <div className="mt-4 w-full bg-green-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full transition-all duration-1000" style={{width: `${reportData.summary.avgAttendance}%`}}></div>
                    </div>
                </div>

                {/* Ketidakhadiran (Sakit & Izin) */}
                <div className="bg-white p-6 rounded-2xl border border-yellow-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Sakit & Izin</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <h3 className="text-3xl font-bold text-yellow-700">
                                    {reportData.summary.totalSick + reportData.summary.totalPermission}
                                </h3>
                                <span className="text-xs text-gray-400">Kejadian</span>
                            </div>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Clock className="w-5 h-5" /></div>
                    </div>
                    <div className="mt-4 flex text-xs text-gray-500 gap-3">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Sakit: {reportData.summary.totalSick}</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Izin: {reportData.summary.totalPermission}</span>
                    </div>
                </div>

                {/* Pelanggaran (Alpha) */}
                <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Tanpa Keterangan</p>
                            <h3 className="text-3xl font-bold text-red-700 mt-1">{reportData.summary.totalAlpha}</h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertCircle className="w-5 h-5" /></div>
                    </div>
                    <p className="mt-4 text-xs text-red-400">Perlu tindak lanjut BK</p>
                </div>
            </div>

            {/* 3. Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performa Kelas */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-500" />
                        Performa Kehadiran Per Kelas
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {reportData.classPerformance.map((cls) => (
                            <div key={cls.className}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{cls.className}</span>
                                    <span className={clsx(
                                        "font-bold",
                                        cls.percentage >= 90 ? "text-green-600" :
                                        cls.percentage >= 75 ? "text-yellow-600" : "text-red-600"
                                    )}>{cls.percentage}% ({cls.predicate})</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                        className={clsx(
                                            "h-2 rounded-full transition-all duration-1000",
                                            cls.percentage >= 90 ? "bg-green-500" :
                                            cls.percentage >= 75 ? "bg-yellow-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${cls.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Komparasi Tingkat */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-6">Komparasi Tingkat (Grade)</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.gradeComparison} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="grade" type="category" width={80} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px'}} />
                                <Bar dataKey="attendance" name="Kehadiran %" radius={[0, 4, 4, 0]} barSize={40}>
                                    {reportData.gradeComparison.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#ec4899'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
};