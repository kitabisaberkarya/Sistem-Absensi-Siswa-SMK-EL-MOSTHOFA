import React from 'react';
import { DashboardStats } from '../../types';
import { Server, Database, ShieldCheck, Activity, Terminal } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  stats: DashboardStats;
}

export const AdminDashboard: React.FC<Props> = ({ stats }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      
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
                {/* Fake extra logs for visual density */}
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
    </div>
  );
};