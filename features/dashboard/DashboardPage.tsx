import React, { useEffect, useState, useCallback } from 'react';
import { ApiService } from '../../services/api';
import { DashboardStats, Role } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PrincipalDashboard } from './PrincipalDashboard';
import { CounselorDashboard } from './CounselorDashboard';
import { AdminDashboard } from './AdminDashboard';
import { Loader2, RefreshCw } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await ApiService.fetchDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    // Auto-refresh setiap 2 menit agar dashboard selalu menampilkan data absensi terbaru
    const interval = setInterval(() => loadStats(), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadStats]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
      <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-4" />
      <p>Mengambil data analitik...</p>
    </div>
  );

  if (!stats) return <div className="p-8 text-center text-red-500">Gagal memuat data dashboard.</div>;

  const RefreshButton = (
    <button
      onClick={() => loadStats(true)}
      disabled={refreshing}
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
      {refreshing ? 'Memuat...' : 'Refresh'}
    </button>
  );

  // Render based on Role
  switch(user?.role) {
    case Role.PRINCIPAL:
      return <>{RefreshButton}<PrincipalDashboard stats={stats} /></>;
    case Role.COUNSELOR:
      return <>{RefreshButton}<CounselorDashboard stats={stats} /></>;
    case Role.ADMIN:
      return <>{RefreshButton}<AdminDashboard stats={stats} /></>;
    default:
      return <>{RefreshButton}<AdminDashboard stats={stats} /></>;
  }
};