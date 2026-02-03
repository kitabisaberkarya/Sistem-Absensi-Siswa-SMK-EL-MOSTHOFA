
import React, { useState } from 'react';
import { DashboardStats } from '../../types';
import { Server, Database, ShieldCheck, Activity, Terminal, UserPlus, Users, Settings, GraduationCap, FileUp } from 'lucide-react';
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 pb-20">
      
      {/* System Status Banner */}
      <div className="bg-gray-900 rounded-xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30 relative">
            <div className="w-3 h-3 bg-green-500 rounded-full absolute -top-1 -right-1 animate-pulse" />
            <Server className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h3 className="font-mono text-xl font-bold">SYSTEM_ONLINE</h3>
            <p className="text-gray-400 text-xs font-mono mt-1">Uptime: 99.9% | Latency: 45ms</p>
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-gray-800 p-4 rounded-lg flex-1 md:w-40 border border-gray-700">
             <div className="text-xs text-gray-500 font-mono mb-1">API REQUESTS</div>
             <div className="text-2xl font-bold font-mono text-blue-400">{stats.totalApiRequests.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex-1 md:w-40 border border-gray-700">
             <div className="text-xs text-gray-500 font-mono mb-1">ACTIVE USERS</div>
             <div className="text-2xl font-bold font-mono text-purple-400">{stats.activeUsers}</div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Guru Management */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-brand-300 transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-50 rounded-lg text-brand-600">
                    <UserPlus className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsImportModalOpen(true)}
                    className="p-2 h-auto text-brand-600 hover:bg-brand-50"
                    title="Import from CSV"
                  >
                    <FileUp className="w-5 h-5" />
                  </Button>
                  <Settings className="w-5 h-5 text-gray-300 group-hover:text-brand-400 cursor-pointer mt-2" />
                </div>
             </div>
             <h3 className="text-lg font-bold text-gray-900">Manajemen Guru</h3>
             <p className="text-gray-500 text-sm mt-1 mb-6">
                Tambah akun atau import massal dari CSV Jadwal.
             </p>
             <div className="flex gap-3">
               <Button 
                  onClick={() => setIsTeacherModalOpen(true)}
                  fullWidth
                  className="shadow-sm"
               >
                  Tambah Guru
               </Button>
             </div>
          </div>

          {/* Siswa Management */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-brand-300 transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                    <GraduationCap className="w-6 h-6" />
                </div>
                <Settings className="w-5 h-5 text-gray-300 group-hover:text-purple-400 cursor-pointer" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">Master Data Siswa</h3>
             <p className="text-gray-500 text-sm mt-1 mb-6">
                Input siswa baru, mutasi kelas, dan data induk.
             </p>
             <Button 
                variant="secondary"
                onClick={() => setIsStudentModalOpen(true)}
                fullWidth
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100"
             >
                Tambah Siswa
             </Button>
          </div>

          {/* Security Audit */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center items-center text-center">
             <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
                 <ShieldCheck className="w-6 h-6" />
             </div>
             <h4 className="font-bold text-gray-800">Security Audit</h4>
             <p className="text-xs text-gray-500 mt-1 mb-4">Terakhir diperiksa: 2 jam lalu</p>
             <Button variant="ghost" className="text-amber-600 hover:bg-amber-50 w-full text-xs">
                 Jalankan Scan Manual
             </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Terminal */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Recent Activity Logs
            </h3>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 font-mono">Live</span>
          </div>
          <div className="p-0 flex-1 bg-[#0d1117] overflow-y-auto max-h-[300px] min-h-[300px]">
            <table className="w-full text-xs font-mono">
              <tbody className="divide-y divide-gray-800">
                {stats.systemLogs.map((log) => (
                   <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                     <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                     <td className={clsx("px-4 py-3 font-semibold", 
                       log.status === 'Success' ? 'text-green-400' : 'text-red-400'
                     )}>
                       [{log.status.toUpperCase()}]
                     </td>
                     <td className="px-4 py-3 text-gray-300 w-full">
                        <span className="text-blue-400">{log.user}</span>: {log.action}
                     </td>
                   </tr>
                ))}
                <tr className="hover:bg-white/5"><td className="px-4 py-3 text-gray-500">06:29</td><td className="px-4 py-3 text-green-400">[SUCCESS]</td><td className="px-4 py-3 text-gray-300">System: Cache cleared</td></tr>
                <tr className="hover:bg-white/5"><td className="px-4 py-3 text-gray-500">06:28</td><td className="px-4 py-3 text-green-400">[SUCCESS]</td><td className="px-4 py-3 text-gray-300">System: Daily cron job executed</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Health & Config */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Database className="w-5 h-5 text-blue-600" />
               Google Sheets Storage Status
             </h3>
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-gray-600">Row Usage (Attendance_Log)</span>
                   <span className="font-semibold text-gray-900">4,521 / 100,000</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2">
                   <div className="bg-blue-600 h-2 rounded-full" style={{ width: '4.5%' }}></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-gray-600">API Quota (Read/Write)</span>
                   <span className="font-semibold text-gray-900">12% Used</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2">
                   <div className="bg-green-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-purple-600" />
               Security Overview
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                   <div className="text-2xl font-bold text-gray-800">0</div>
                   <div className="text-xs text-gray-500">Threats Detected</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                   <div className="text-2xl font-bold text-green-600">Active</div>
                   <div className="text-xs text-gray-500">Firewall Status</div>
                </div>
             </div>
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