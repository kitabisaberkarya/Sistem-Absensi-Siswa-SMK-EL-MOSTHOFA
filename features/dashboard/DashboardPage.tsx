import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { DashboardStats, Role } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PrincipalDashboard } from './PrincipalDashboard';
import { CounselorDashboard } from './CounselorDashboard';
import { AdminDashboard } from './AdminDashboard';
import { Loader2 } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await ApiService.fetchDashboardStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
      <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-4" />
      <p>Mengambil data analitik...</p>
    </div>
  );
  
  if (!stats) return <div className="p-8 text-center text-red-500">Gagal memuat data dashboard.</div>;

  // Render based on Role
  switch(user?.role) {
    case Role.PRINCIPAL:
      return <PrincipalDashboard stats={stats} />;
    case Role.COUNSELOR:
      return <CounselorDashboard stats={stats} />;
    case Role.ADMIN:
      return <AdminDashboard stats={stats} />;
    default:
      // Fallback for Admin or unknown roles who have access
      return <AdminDashboard stats={stats} />;
  }
};