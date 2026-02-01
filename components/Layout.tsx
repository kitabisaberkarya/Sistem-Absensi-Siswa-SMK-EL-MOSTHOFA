import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, School, LayoutDashboard, ClipboardList, ShieldCheck, HeartHandshake, Briefcase } from 'lucide-react';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  const getRoleDisplay = () => {
    switch(user?.role) {
      case Role.ADMIN:
        return { title: 'Panel Administrator', icon: ShieldCheck, desc: 'Pengaturan sistem dan manajemen data.' };
      case Role.PRINCIPAL:
        return { title: 'Dashboard Eksekutif', icon: Briefcase, desc: 'Monitoring performa sekolah.' };
      case Role.COUNSELOR:
        return { title: 'Monitoring Konseling', icon: HeartHandshake, desc: 'Pantau kedisiplinan siswa.' };
      default: // TEACHER
        return { title: 'Input Absensi', icon: ClipboardList, desc: 'Silakan isi kehadiran siswa untuk mata pelajaran Anda.' };
    }
  };

  const display = getRoleDisplay();
  const Icon = display.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 p-2 rounded-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">Sistem Absensi</h1>
                <p className="text-xs text-gray-500">SMK EL MOSTHOFA Pamekasan Madura</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                   {user?.role === Role.TEACHER ? 'Guru Mapel' : 
                    user?.role === Role.COUNSELOR ? 'Guru BK' :
                    user?.role === Role.PRINCIPAL ? 'Kepala Sekolah' : 'Administrator'}
                  </div>
                </div>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                    {user?.name.charAt(0)}
                  </div>
                )}
              </div>
              <button 
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon className="text-brand-600" /> {display.title}
          </h2>
          <p className="text-gray-500 mt-1">
            {display.desc}
          </p>
        </div>
        
        {children}
      </main>
      
      <footer className="bg-white border-t py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} SMK EL MOSTHOFA Pamekasan Madura. Powered by Google Ecosystem.
        </div>
      </footer>
    </div>
  );
};