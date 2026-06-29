import React, { useState } from 'react';
import { DashboardStats, AtRiskStudent } from '../../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, UserMinus, Activity, ClipboardList, Printer } from 'lucide-react';
import { ReportService } from '../../services/ReportService';
import { useToast } from '../../context/ToastContext';
import clsx from 'clsx';

interface Props {
  stats: DashboardStats;
}

export const CounselorDashboard: React.FC<Props> = ({ stats }) => {
  const { showToast } = useToast();
  const [callingId, setCallingId] = useState<string | null>(null);

  const handlePanggil = (student: AtRiskStudent) => {
    setCallingId(student.id);
    try {
      ReportService.generateCounselingLetter({
        studentName: student.name,
        className: student.className,
        nis: student.id,
        violationCount: student.alphaCount,
        letterType: student.alphaCount >= 5 ? 'SP2' : 'SP1',
        date: new Date().toISOString().split('T')[0]
      });
      showToast('success', 'Surat Pemanggilan Dibuat', `${student.name} — SP${student.alphaCount >= 5 ? '2' : '1'}`);
    } catch {
      showToast('error', 'Gagal membuat surat pemanggilan');
    } finally {
      setCallingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* 1. Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-red-600 font-semibold text-sm uppercase tracking-wider">Siswa Alpha Hari Ini</p>
            <h3 className="text-4xl font-bold text-red-700 mt-1">
              {stats.absenteeComposition.find(x => x.name === 'Alpha')?.value || 0}
            </h3>
            <p className="text-red-400 text-xs mt-2 font-medium">Perlu dikonfirmasi</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <UserMinus className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-yellow-700 font-semibold text-sm uppercase tracking-wider">Total Sakit</p>
            <h3 className="text-4xl font-bold text-yellow-800 mt-1">
              {stats.absenteeComposition.find(x => x.name === 'Sakit')?.value || 0}
            </h3>
            <p className="text-yellow-600 text-xs mt-2 font-medium">Pantau kesehatan</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <Activity className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Watchlist Siswa</p>
            <h3 className="text-4xl font-bold text-gray-800 mt-1">{stats.atRiskStudents.length}</h3>
            <p className="text-gray-400 text-xs mt-2 font-medium">Alpha &gt; 3x</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Risk Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gray-500" />
              Daftar Siswa Dalam Pantauan
            </h3>
            <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-md">High Priority</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4 text-center">Alpha</th>
                  <th className="px-6 py-4 text-center">Sakit</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.atRiskStudents.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Tidak ada siswa dalam pantauan.</td></tr>
                ) : stats.atRiskStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className={clsx(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        student.className === 'Unknown' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700'
                      )}>
                        {student.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                        student.alphaCount >= 5 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {student.alphaCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{student.sickCount}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePanggil(student)}
                        disabled={callingId === student.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        {callingId === student.id ? 'Memproses...' : `Panggil (SP${student.alphaCount >= 5 ? '2' : '1'})`}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6">Komposisi Ketidakhadiran</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.absenteeComposition}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value"
                >
                  {stats.absenteeComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-800">{stats.absentToday}</span>
              <span className="text-xs text-gray-400">Total Siswa</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {stats.absenteeComposition.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value} Siswa</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
