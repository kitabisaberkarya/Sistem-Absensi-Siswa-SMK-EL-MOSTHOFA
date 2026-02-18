
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { FileText, Calendar, BookOpen, Clock, Users } from 'lucide-react';
import clsx from 'clsx';

export const TeacherReportsPage = () => {
  const { user } = useAuth();
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'history'|'recap'>('history');
  
  useEffect(() => {
    if (activeTab === 'history' && user?.id) {
        setLoading(true);
        const fetch = async () => {
            try {
                const data = await ApiService.fetchTeacherHistory(user.id);
                setHistoryLogs(data);
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }
  }, [activeTab, user]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-brand-600" />
              Laporan & Jurnal Mengajar
          </h2>
          <p className="text-gray-500 text-sm mt-1">
              Rekapitulasi aktivitas mengajar dan catatan perilaku siswa.
          </p>
      </div>
      
      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('history')}
            className={clsx(
                "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                activeTab === 'history' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
             <Clock className="w-4 h-4" /> Riwayat Jurnal (Per Jam)
          </button>
          <button 
            onClick={() => setActiveTab('recap')}
            className={clsx(
                "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                activeTab === 'recap' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
             <Users className="w-4 h-4" /> Rekap Kehadiran Siswa
          </button>
      </div>

      {activeTab === 'history' && (
        <div className="space-y-6">
            {loading ? (
                <div className="text-center py-12 text-gray-400">Memuat jurnal...</div>
            ) : historyLogs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                    Belum ada riwayat mengajar.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {historyLogs.map((log) => (
                            <div key={log.logId} className="p-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex flex-col sm:flex-row gap-5">
                                    {/* Date Badge */}
                                    <div className="w-full sm:w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex flex-col items-center justify-center border border-blue-100 flex-shrink-0 shadow-sm">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(log.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                        <span className="text-2xl font-black leading-none">{new Date(log.date).getDate()}</span>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                    {log.className}
                                                    <span className="text-gray-300 font-normal text-sm">|</span>
                                                    <span className="text-brand-600 font-medium text-sm flex items-center gap-1">
                                                        <BookOpen className="w-3.5 h-3.5" /> {log.subject}
                                                    </span>
                                                </h4>
                                            </div>
                                            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                                                {log.studentCount} Siswa
                                            </span>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Materi / Topik Pembahasan</p>
                                            <p className="text-sm text-gray-700 leading-relaxed font-medium">{log.topic}</p>
                                        </div>
                                        
                                        {/* NOTES DISPLAY - Requested Feature */}
                                        {log.notesSample && log.notesSample.length > 0 && (
                                            <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800 animate-in slide-in-from-left-2">
                                                <div className="font-bold flex items-center gap-1.5 mb-1.5 text-yellow-900">
                                                    <FileText className="w-3.5 h-3.5" /> Catatan Kejadian / Siswa
                                                </div>
                                                <ul className="space-y-1 ml-1">
                                                    {log.notesSample.map((n: string, i: number) => (
                                                        <li key={i} className="pl-2 border-l-2 border-yellow-300">{n}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        <div className="mt-2 text-right">
                                            <span className="text-[10px] text-gray-400">
                                                Diinput pada: {new Date(log.timestamp).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}
      
      {activeTab === 'recap' && (
          <div className="p-12 text-center border border-dashed rounded-xl bg-gray-50 text-gray-500">
              <p>Fitur rekapitulasi siswa per semester sedang dikembangkan.</p>
              <p className="text-xs mt-1">Silakan gunakan menu Laporan di akun Admin/Kepala Sekolah untuk rekap global.</p>
          </div>
      )}
    </div>
  );
};
