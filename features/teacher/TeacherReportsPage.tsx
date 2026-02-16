
// ... existing imports ...
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { ReportService } from '../../services/ReportService';
import { TeacherHistoryLog, SemesterRecapEntry, ClassRoom } from '../../types';
// ... other imports

export const TeacherReportsPage = () => {
  // ... state ...
  const { user } = useAuth();
  const [historyLogs, setHistoryLogs] = useState<any[]>([]); // Use any to allow notesSample property
  const [activeTab, setActiveTab] = useState<'history'|'recap'>('history');
  
  // ... useEffect for history ...
  useEffect(() => {
    if (activeTab === 'history' && user?.id) {
        const fetch = async () => {
            const data = await ApiService.fetchTeacherHistory(user.id);
            setHistoryLogs(data);
        };
        fetch();
    }
  }, [activeTab, user]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ... Header ... */}
      
      {activeTab === 'history' && (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {historyLogs.map((log) => (
                        <div key={log.logId} className="p-5 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Date Box */}
                                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center border border-blue-100 flex-shrink-0">
                                    <span className="text-xs font-bold uppercase">{new Date(log.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                    <span className="text-xl font-bold leading-none">{new Date(log.date).getDate()}</span>
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <h4 className="font-bold text-gray-900 text-lg">{log.className}</h4>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{log.studentCount} Siswa</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2"><span className="font-medium text-brand-600">{log.subject}</span> • {log.topic}</p>
                                    
                                    {/* NOTES SECTION (New) */}
                                    {log.notesSample && log.notesSample.length > 0 && (
                                        <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-100 text-xs text-yellow-800">
                                            <strong>Catatan Khusus:</strong>
                                            <ul className="list-disc ml-4 mt-1">
                                                {log.notesSample.map((n: string, i: number) => <li key={i}>{n}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
      
      {/* ... Recap Tab Content ... */}
    </div>
  );
};
