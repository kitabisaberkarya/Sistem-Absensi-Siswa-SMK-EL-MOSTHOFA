import React from 'react';
import { DashboardStats } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, CheckCircle2, Award } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  stats: DashboardStats;
}

export const PrincipalDashboard: React.FC<Props> = ({ stats }) => {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* 1. Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Tingkat Kehadiran</p>
              <h3 className="text-3xl font-bold mt-1">{stats.attendanceRate}%</h3>
            </div>
            <TrendingUp className="text-indigo-300 w-6 h-6" />
          </div>
          <div className="mt-4 text-xs text-indigo-300 flex items-center gap-1">
             <span className="bg-white/10 px-1.5 py-0.5 rounded text-white">+0.5%</span>
             <span>dari minggu lalu</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
           <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Siswa</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</h3>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
               <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
           <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Laporan Guru</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.teacherSubmissionRate}%</h3>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-green-600">
               <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Sudah submit hari ini</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
           <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Kelas Terbaik</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                 {stats.classRankings.find(c => c.label === 'Best')?.className}
              </h3>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600">
               <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Minggu ini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Analisis Tren Mingguan</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Area 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPresent)" 
                  name="Siswa Hadir"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Class Rankings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Ranking Performa Kelas</h3>
          <div className="space-y-5">
            {stats.classRankings.map((rank, idx) => (
              <div key={rank.className} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-gray-300 font-mono text-xs">#{idx + 1}</span>
                    {rank.className}
                  </span>
                  <span className={clsx("font-bold", 
                    rank.label === 'Best' ? "text-green-600" : 
                    rank.label === 'Warning' ? "text-red-600" : "text-gray-600"
                  )}>
                    {rank.attendanceRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={clsx("h-full rounded-full transition-all duration-1000", 
                      rank.label === 'Best' ? "bg-green-500" : 
                      rank.label === 'Warning' ? "bg-red-500" : "bg-blue-500"
                    )}
                    style={{ width: `${rank.attendanceRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Rekomendasi Tindakan</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Kelas <strong>11-IPS-1</strong> memiliki tingkat ketidakhadiran di atas rata-rata sekolah. Disarankan untuk berkoordinasi dengan Wali Kelas terkait.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};