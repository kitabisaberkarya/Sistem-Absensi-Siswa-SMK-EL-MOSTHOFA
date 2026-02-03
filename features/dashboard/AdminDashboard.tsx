import React, { useState } from 'react';
import { DashboardStats } from '../../types';
import { UserPlus, Settings, FileUp, MoreVertical, Search, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import clsx from 'clsx';
import { Button } from '../../components/Button';
import { AddTeacherModal } from '../../components/AddTeacherModal';
import { AddStudentModal } from '../../components/AddStudentModal';
import { BulkImportModal } from '../../components/BulkImportModal';

interface Props {
  stats: DashboardStats;
}

export const AdminDashboard: React.FC<Props> = ({ stats }) => {
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Mock data for charts to match visual if stats are empty/basic
  const chartData = stats.weeklyData.length > 0 ? stats.weeklyData : [
    { day: 'Mon', present: 65, absent: 20 },
    { day: 'Tue', present: 59, absent: 10 },
    { day: 'Wed', present: 80, absent: 5 },
    { day: 'Thu', present: 81, absent: 15 },
    { day: 'Fri', present: 56, absent: 25 },
    { day: 'Sat', present: 55, absent: 30 },
    { day: 'Sun', present: 40, absent: 10 },
  ];

  const pieData = [
     { name: 'Hadir', value: 70, color: '#3b82f6' }, // Blue
     { name: 'Sakit', value: 15, color: '#f59e0b' }, // Orange
     { name: 'Alpha', value: 15, color: '#64748b' }, // Gray
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* 1. TOP WIDGETS (Colored Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Blue - Sales/Students */}
        <div className="bg-[#6f42c1] rounded-sm shadow-sm p-6 text-white relative overflow-hidden group">
           <div className="relative z-10">
              <h4 className="text-purple-200 text-sm font-medium uppercase tracking-wider">Total Siswa</h4>
              <div className="flex justify-between items-end mt-2">
                 <h2 className="text-4xl font-bold">{stats.totalStudents}</h2>
                 <span className="text-xs bg-white/20 px-2 py-1 rounded">+12% New</span>
              </div>
           </div>
           {/* Decorative Circle */}
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
        </div>

        {/* Card 2: Dark Gray - Visitors/Guru */}
        <div className="bg-[#343a40] rounded-sm shadow-sm p-6 text-white relative overflow-hidden group">
           <div className="relative z-10">
              <h4 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Guru Aktif</h4>
              <div className="flex justify-between items-end mt-2">
                 <h2 className="text-4xl font-bold">{stats.activeUsers}</h2>
                 <span className="text-xs bg-white/10 px-2 py-1 rounded text-green-400">Online</span>
              </div>
           </div>
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full group-hover:scale-110 transition-transform"></div>
        </div>

        {/* Card 3: Orange - Orders/Kehadiran */}
        <div className="bg-[#fd7e14] rounded-sm shadow-sm p-6 text-white relative overflow-hidden group">
           <div className="relative z-10">
              <h4 className="text-orange-100 text-sm font-medium uppercase tracking-wider">Absensi Hari Ini</h4>
              <div className="flex justify-between items-end mt-2">
                 <h2 className="text-4xl font-bold">{stats.attendanceRate}%</h2>
                 <span className="text-xs bg-white/20 px-2 py-1 rounded">Rate</span>
              </div>
           </div>
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
        </div>
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart (Sales/Attendance) */}
        <div className="lg:col-span-2 bg-white rounded-sm shadow-sm p-6 border border-gray-100">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <h3 className="text-gray-700 font-bold uppercase text-sm tracking-wide">Statistik Kehadiran Mingguan</h3>
                 <p className="text-gray-400 text-xs mt-1">Comparasi data kehadiran 7 hari terakhir</p>
              </div>
              <div className="flex gap-2">
                 <button className="text-xs font-semibold text-gray-400 hover:text-brand-500">WEEK</button>
                 <button className="text-xs font-semibold text-gray-400 hover:text-brand-500">MONTH</button>
              </div>
           </div>
           
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="present" fill="#6f42c1" radius={[4, 4, 0, 0]} name="Hadir" />
                  <Bar dataKey="absent" fill="#ced4da" radius={[4, 4, 0, 0]} name="Absen" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Pie Chart (Pie Chart Example) */}
        <div className="bg-white rounded-sm shadow-sm p-6 border border-gray-100">
           <h3 className="text-gray-700 font-bold uppercase text-sm tracking-wide mb-6">Komposisi Siswa</h3>
           <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={pieData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-gray-700">95%</span>
                  <span className="text-xs text-gray-400">Rata-rata</span>
              </div>
           </div>
           <div className="mt-4 flex justify-center gap-4 text-xs">
              {pieData.map(p => (
                 <div key={p.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></span>
                    <span className="text-gray-500">{p.name}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* 3. LISTS / TABLES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* "Browser Stats" equivalent -> Class Performance */}
         <div className="bg-white rounded-sm shadow-sm border border-gray-100">
             <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 uppercase text-sm">Performa Kelas</h3>
                <MoreVertical className="w-4 h-4 text-gray-400 cursor-pointer" />
             </div>
             <div className="p-5 space-y-5">
                {[
                  { name: '12 IPA 1', val: 85, color: 'bg-green-500' },
                  { name: '11 IPS 2', val: 35, color: 'bg-orange-400' },
                  { name: '10 IPA 3', val: 78, color: 'bg-red-500' },
                  { name: '12 BAHASA', val: 50, color: 'bg-blue-500' },
                  { name: '11 AGAMA', val: 80, color: 'bg-[#6f42c1]' }
                ].map((item) => (
                   <div key={item.name}>
                      <div className="flex justify-between text-xs mb-1 font-medium text-gray-600">
                         <span>{item.name}</span>
                         <span>{item.val}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                         <div className={`h-1.5 rounded-full ${item.color}`} style={{width: `${item.val}%`}}></div>
                      </div>
                   </div>
                ))}
             </div>
         </div>

         {/* "Product Status" equivalent -> Quick Actions / Management */}
         <div className="bg-white rounded-sm shadow-sm border border-gray-100 flex flex-col">
             <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 uppercase text-sm">Manajemen Data</h3>
                <div className="flex gap-2">
                   <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Active</span>
                </div>
             </div>
             
             <div className="flex-1 p-0 overflow-auto">
                <table className="w-full text-sm text-left">
                   <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                      <tr>
                         <th className="px-5 py-3 font-medium">No</th>
                         <th className="px-5 py-3 font-medium">Aksi</th>
                         <th className="px-5 py-3 font-medium text-center">Status</th>
                         <th className="px-5 py-3 font-medium text-right">Progress</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {/* Row 1: Add Teacher */}
                      <tr className="hover:bg-gray-50 transition-colors group">
                         <td className="px-5 py-4 text-gray-500">1</td>
                         <td className="px-5 py-4">
                            <div className="font-semibold text-gray-700">Tambah Guru Baru</div>
                            <div className="text-xs text-gray-400">Input manual satu per satu</div>
                         </td>
                         <td className="px-5 py-4 text-center">
                            <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded">READY</span>
                         </td>
                         <td className="px-5 py-4 text-right">
                            <button 
                              onClick={() => setIsTeacherModalOpen(true)}
                              className="text-brand-600 hover:text-brand-800 text-xs font-bold flex items-center justify-end gap-1 ml-auto"
                            >
                               EKSEKUSI <ArrowUpRight className="w-3 h-3" />
                            </button>
                         </td>
                      </tr>

                       {/* Row 2: Add Student */}
                       <tr className="hover:bg-gray-50 transition-colors group">
                         <td className="px-5 py-4 text-gray-500">2</td>
                         <td className="px-5 py-4">
                            <div className="font-semibold text-gray-700">Master Data Siswa</div>
                            <div className="text-xs text-gray-400">Registrasi peserta didik</div>
                         </td>
                         <td className="px-5 py-4 text-center">
                            <span className="px-2 py-1 bg-orange-400 text-white text-[10px] font-bold rounded">NEW</span>
                         </td>
                         <td className="px-5 py-4 text-right">
                             <button 
                              onClick={() => setIsStudentModalOpen(true)}
                              className="text-brand-600 hover:text-brand-800 text-xs font-bold flex items-center justify-end gap-1 ml-auto"
                            >
                               EKSEKUSI <ArrowUpRight className="w-3 h-3" />
                            </button>
                         </td>
                      </tr>

                      {/* Row 3: Import */}
                      <tr className="hover:bg-gray-50 transition-colors group">
                         <td className="px-5 py-4 text-gray-500">3</td>
                         <td className="px-5 py-4">
                            <div className="font-semibold text-gray-700">Import Jadwal (CSV)</div>
                            <div className="text-xs text-gray-400">Upload bulk data guru/jadwal</div>
                         </td>
                         <td className="px-5 py-4 text-center">
                            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded">SYS</span>
                         </td>
                         <td className="px-5 py-4 text-right">
                             <button 
                              onClick={() => setIsImportModalOpen(true)}
                              className="text-brand-600 hover:text-brand-800 text-xs font-bold flex items-center justify-end gap-1 ml-auto"
                            >
                               EKSEKUSI <ArrowUpRight className="w-3 h-3" />
                            </button>
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
         </div>
      </div>

      {/* Modals */}
      <AddTeacherModal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} />
      <AddStudentModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} />
      <BulkImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </div>
  );
};
