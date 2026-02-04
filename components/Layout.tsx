

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, ClipboardList, ShieldCheck, HeartHandshake, Briefcase, Menu, Search, Bell, Mail, Settings, ChevronDown, User, Users, GraduationCap, FileText, Inbox, Database, BookMarked } from 'lucide-react';
import { Role, ViewState } from '../types';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  currentView?: ViewState;
  onViewChange?: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- ADMIN LAYOUT (Sidebar Style based on Screenshot) ---
  if (user?.role === Role.ADMIN) {
    
    const handleNavClick = (view: ViewState) => {
      if (onViewChange) onViewChange(view);
    };

    return (
      <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={clsx(
            "bg-[#2A3F54] text-white flex-shrink-0 transition-all duration-300 flex flex-col",
            sidebarOpen ? "w-64" : "w-20"
          )}
        >
          {/* Logo Area */}
          <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-600/30 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <img 
              src="https://res.cloudinary.com/dt1nrarpq/image/upload/v1770105471/LOGO_SEKOLAH_ourgxr.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain"
            />
            {sidebarOpen && (
              <span className="font-bold text-lg tracking-wide whitespace-nowrap">SMK EL MOSTHOFA</span>
            )}
          </div>

          {/* User Profile in Sidebar */}
          {sidebarOpen && (
            <div className="p-6 flex items-center gap-3 border-b border-gray-600/30">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20">
                 <img src={user.avatar} alt="User" className="w-full h-full rounded-full" />
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-semibold truncate">Halo, {user.name.split(' ')[0]}</p>
                 <p className="text-xs text-green-400 flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
                 </p>
               </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            <button onClick={() => handleNavClick('dashboard')} className="w-full text-left">
              <NavItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} isOpen={sidebarOpen} />
            </button>
            <button onClick={() => handleNavClick('teachers')} className="w-full text-left">
              <NavItem icon={Users} label="Data Guru" active={currentView === 'teachers'} isOpen={sidebarOpen} />
            </button>
            <button onClick={() => handleNavClick('students')} className="w-full text-left">
              <NavItem icon={GraduationCap} label="Data Siswa" active={currentView === 'students'} isOpen={sidebarOpen} />
            </button>
            <button onClick={() => handleNavClick('academics')} className="w-full text-left">
              <NavItem icon={BookMarked} label="Data Akademik" active={currentView === 'academics'} isOpen={sidebarOpen} />
            </button>
            <button onClick={() => handleNavClick('reports')} className="w-full text-left">
              <NavItem icon={FileText} label="Laporan" active={currentView === 'reports'} isOpen={sidebarOpen} />
            </button>
            
            <div className="mt-8 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {sidebarOpen ? 'System' : '...'}
            </div>
            
            <button onClick={() => handleNavClick('mailbox')} className="w-full text-left">
              <NavItem icon={Inbox} label="Mailbox" active={currentView === 'mailbox'} isOpen={sidebarOpen} />
            </button>
            <button onClick={() => handleNavClick('backup')} className="w-full text-left">
              <NavItem icon={Database} label="Backup & Restore" active={currentView === 'backup'} isOpen={sidebarOpen} />
            </button>
            <button onClick={() => handleNavClick('settings')} className="w-full text-left">
              <NavItem icon={Settings} label="Pengaturan" active={currentView === 'settings'} isOpen={sidebarOpen} />
            </button>
          </nav>
        </aside>

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative hidden md:block">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-1.5 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-brand-500 w-64"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <button onClick={() => handleNavClick('mailbox')} className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Mail className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
              </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              <div className="h-8 w-px bg-gray-200 mx-1"></div>

              <div className="flex items-center gap-3 cursor-pointer group relative">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-400">Administrator</p>
                 </div>
                 <img src={user.avatar} alt="Profile" className="w-9 h-9 rounded-full border border-gray-200 group-hover:border-brand-500 transition-all" />
                 <ChevronDown className="w-4 h-4 text-gray-400" />

                 {/* Dropdown Logout */}
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform origin-top-right z-50">
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                       <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                 </div>
              </div>
            </div>
          </header>

          {/* Content Scroll Area */}
          <main className="flex-1 overflow-y-auto bg-[#f3f4f6] p-4 sm:p-6 lg:p-8">
             {children}
          </main>
        </div>
      </div>
    );
  }

  // --- STANDARD LAYOUT (Teachers, Counselors, Principals) ---
  const getRoleDisplay = () => {
    switch(user?.role) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://res.cloudinary.com/dt1nrarpq/image/upload/v1770105471/LOGO_SEKOLAH_ourgxr.png" 
                alt="Logo SMK" 
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Sistem Absensi</h1>
                <p className="text-sm text-gray-500 font-medium tracking-wide">SMK EL MOSTHOFA</p>
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
                    user?.role === Role.COUNSELOR ? 'Guru BK' : 'Kepala Sekolah'}
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
          &copy; {new Date().getFullYear()} SMK EL MOSTHOFA Pamekasan Madura.
        </div>
      </footer>
    </div>
  );
};

// Helper for Sidebar Nav Item
const NavItem = ({ icon: Icon, label, active, isOpen }: { icon: any, label: string, active?: boolean, isOpen: boolean }) => (
  <div className={clsx(
    "flex items-center px-4 py-3 rounded-r-full transition-all cursor-pointer group mb-1",
    active ? "bg-white/10 text-white border-l-4 border-brand-500" : "text-gray-400 hover:text-white hover:bg-white/5"
  )}>
    <Icon className={clsx("w-5 h-5 flex-shrink-0", active ? "text-brand-400" : "text-gray-500 group-hover:text-white")} />
    {isOpen && <span className="ml-3 text-sm font-medium tracking-wide">{label}</span>}
    {active && isOpen && <span className="ml-auto w-2 h-2 bg-brand-500 rounded-full"></span>}
  </div>
);