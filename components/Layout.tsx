
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import {
  LogOut, LayoutDashboard, ClipboardList, HeartHandshake, Briefcase,
  Menu, Search, Mail, Settings, ChevronDown, KeyRound,
  Users, GraduationCap, FileText, Inbox, Database, BookMarked, Printer,
  Grid
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // --- HANDLERS ---
  const handleNavClick = (view: ViewState) => {
    if (onViewChange) onViewChange(view);
    setMobileMenuOpen(false); // Close mobile drawer if open
  };

  // --- MOBILE BOTTOM NAVIGATION COMPONENT ---
  const MobileBottomNav = () => {
    // Define menus based on Role
    let leftItems: { icon: any, label: string, view: ViewState }[] = [];
    let rightItems: { icon: any, label: string, view: ViewState | 'MORE' }[] = [];

    if (user?.role === Role.ADMIN) {
        leftItems = [
            { icon: LayoutDashboard, label: 'Dash', view: 'dashboard' },
            { icon: Users, label: 'Guru', view: 'teachers' },
        ];
        rightItems = [
            { icon: GraduationCap, label: 'Siswa', view: 'students' },
            { icon: Grid, label: 'Menu', view: 'MORE' }, // Triggers Drawer
        ];
    } else if (user?.role === Role.TEACHER) {
        leftItems = [
             { icon: ClipboardList, label: 'Input', view: 'dashboard' },
        ];
        rightItems = [
             { icon: FileText, label: 'Laporan', view: 'teacher-reports' },
        ];
        // Center alignment adjustment for fewer items
        if(leftItems.length === 1) {
            // Push simpler layout
        }
    } else if (user?.role === Role.COUNSELOR) {
        leftItems = [
             { icon: HeartHandshake, label: 'Mon', view: 'dashboard' },
        ];
        rightItems = [
             { icon: Printer, label: 'Surat', view: 'counselor-reports' },
        ];
    } else if (user?.role === Role.PRINCIPAL) {
         leftItems = [
             { icon: LayoutDashboard, label: 'Dash', view: 'dashboard' },
        ];
        rightItems = [
             { icon: FileText, label: 'Laporan', view: 'reports' },
        ];
    }

    return (
        <>
            {/* BOTTOM NAV BAR */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-20 px-4 flex justify-between items-end pb-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                
                {/* LEFT ITEMS */}
                <div className="flex-1 flex justify-around items-center h-12">
                    {leftItems.map((item) => (
                        <button 
                            key={item.view}
                            onClick={() => handleNavClick(item.view)}
                            className={clsx(
                                "flex flex-col items-center gap-1 transition-colors relative",
                                currentView === item.view ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <item.icon className={clsx("w-6 h-6", currentView === item.view && "fill-current opacity-20")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {currentView === item.view && (
                                <span className="absolute -top-2 w-1 h-1 bg-brand-600 rounded-full"></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* CENTER FLOATING LOGO */}
                <div className="relative w-20 flex justify-center -top-6">
                     <button 
                        onClick={() => handleNavClick('dashboard')}
                        className="relative z-50 transform transition-transform active:scale-95"
                     >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50"></div>
                        <img 
                            src="https://res.cloudinary.com/dt1nrarpq/image/upload/v1770105471/LOGO_SEKOLAH_ourgxr.png" 
                            alt="Home" 
                            className="w-16 h-16 object-contain drop-shadow-2xl relative z-10 filter"
                        />
                     </button>
                </div>

                {/* RIGHT ITEMS */}
                <div className="flex-1 flex justify-around items-center h-12">
                    {rightItems.map((item) => (
                        <button 
                            key={item.label}
                            onClick={() => item.view === 'MORE' ? setMobileMenuOpen(true) : handleNavClick(item.view as ViewState)}
                            className={clsx(
                                "flex flex-col items-center gap-1 transition-colors relative",
                                (currentView === item.view || (item.view === 'MORE' && mobileMenuOpen)) ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <item.icon className={clsx("w-6 h-6", currentView === item.view && "fill-current opacity-20")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                             {currentView === item.view && (
                                <span className="absolute -top-2 w-1 h-1 bg-brand-600 rounded-full"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* MOBILE DRAWER (FOR ADMIN "MORE" MENU) */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="bg-white w-full rounded-t-3xl p-6 pb-24 relative animate-in slide-in-from-bottom-10 shadow-2xl">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
                        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                            <Grid className="w-5 h-5 text-brand-600" /> Menu Lainnya
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <DrawerItem icon={BookMarked} label="Akademik" onClick={() => handleNavClick('academics')} active={currentView === 'academics'} />
                            <DrawerItem icon={FileText} label="Laporan" onClick={() => handleNavClick('reports')} active={currentView === 'reports'} />
                            <DrawerItem icon={Inbox} label="Mailbox" onClick={() => handleNavClick('mailbox')} active={currentView === 'mailbox'} />
                            <DrawerItem icon={Database} label="Backup" onClick={() => handleNavClick('backup')} active={currentView === 'backup'} />
                            <DrawerItem icon={Settings} label="Setting" onClick={() => handleNavClick('settings')} active={currentView === 'settings'} />
                            <div className="flex flex-col items-center gap-2 p-3 rounded-xl active:bg-red-50 text-red-600 transition-colors" onClick={logout}>
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
                                    <LogOut className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium text-center">Keluar</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
  };

  const DrawerItem = ({ icon: Icon, label, onClick, active }: any) => (
      <button 
        onClick={onClick}
        className={clsx(
            "flex flex-col items-center gap-2 p-3 rounded-xl transition-all border",
            active 
             ? "bg-brand-50 border-brand-200 text-brand-700" 
             : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200"
        )}
      >
          <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center shadow-sm", active ? "bg-white" : "bg-gray-50")}>
              <Icon className={clsx("w-6 h-6", active ? "text-brand-600" : "text-gray-500")} />
          </div>
          <span className="text-xs font-medium text-center">{label}</span>
      </button>
  );

  // --- ADMIN DESKTOP LAYOUT ---
  if (user?.role === Role.ADMIN) {
    return (
      <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
        {/* Sidebar (Desktop Only) */}
        <aside 
          className={clsx(
            "bg-[#2A3F54] text-white flex-shrink-0 transition-all duration-300 hidden md:flex flex-col",
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
                 <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
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

            <div className="pt-4 mt-4 border-t border-gray-600/30">
              <button 
                onClick={logout} 
                className="w-full flex items-center px-4 py-3 rounded-r-full transition-all cursor-pointer group text-red-400 hover:text-white hover:bg-red-500/20"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="ml-3 text-sm font-medium tracking-wide">Keluar Aplikasi</span>}
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          
          {/* Top Header (Desktop) & Mobile Minimal Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors hidden md:block"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Mobile Header Title */}
              <div className="md:hidden flex items-center gap-3">
                 <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200" alt="Profile" />
                 <div>
                    <h1 className="text-sm font-bold text-gray-800">Halo, {user.name.split(' ')[0]}</h1>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">Administrator</p>
                 </div>
              </div>

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
              <button onClick={() => handleNavClick('mailbox')} className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors hidden md:block">
                <Mail className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
              </button>
              
              {/* Desktop Profile Dropdown */}
              <div className="hidden md:flex items-center gap-3 cursor-pointer group relative">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-400">Administrator</p>
                 </div>
                 <img src={user.avatar} alt="Profile" className="w-9 h-9 rounded-full border border-gray-200 group-hover:border-brand-500 transition-all object-cover" />
                 <ChevronDown className="w-4 h-4 text-gray-400" />

                 <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform origin-top-right z-50">
                    <button onClick={() => setChangePasswordOpen(true)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                       <KeyRound className="w-4 h-4" /> Ubah Kata Sandi
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                       <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                 </div>
              </div>

              {/* Mobile Logout (Header) */}
              <button onClick={logout} className="md:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                  <LogOut className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </header>

          {/* Content Scroll Area */}
          <main className="flex-1 overflow-y-auto bg-[#f3f4f6] p-4 sm:p-6 lg:p-8 pb-32 md:pb-8">
             {children}
          </main>

          {/* Mobile Bottom Nav */}
          <MobileBottomNav />
        </div>
      </div>

      <ChangePasswordModal isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    );
  }

  // --- STANDARD LAYOUT (Teachers, Counselors, Principals) ---
  const getRoleDisplay = () => {
    switch(user?.role) {
      case Role.PRINCIPAL:
        if (currentView === 'reports') return { title: 'Laporan Resmi', icon: FileText, desc: 'Laporan bulanan standar kementrian.' };
        return { title: 'Dashboard Eksekutif', icon: Briefcase, desc: 'Monitoring performa sekolah.' };
      case Role.COUNSELOR:
        if (currentView === 'counselor-reports') return { title: 'Laporan Bimbingan', icon: FileText, desc: 'Administrasi kasus & pemanggilan.' };
        return { title: 'Monitoring Konseling', icon: HeartHandshake, desc: 'Pantau kedisiplinan siswa.' };
      case Role.TEACHER:
        if (currentView === 'teacher-reports') return { title: 'Laporan Guru', icon: FileText, desc: 'Rekap kehadiran & jurnal.' };
        return { title: 'Input Absensi', icon: ClipboardList, desc: 'Silakan isi kehadiran siswa.' };
      default:
        return { title: 'Panel Guru', icon: ClipboardList, desc: '' };
    }
  };

  const display = getRoleDisplay();
  const Icon = display.icon;

  const handleStandardNav = (view: ViewState) => {
      if (onViewChange) onViewChange(view);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar (Desktop Only) */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleStandardNav('dashboard')}>
              <img 
                src="https://res.cloudinary.com/dt1nrarpq/image/upload/v1770105471/LOGO_SEKOLAH_ourgxr.png" 
                alt="Logo SMK" 
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Sistem Absensi</h1>
                <p className="text-sm text-gray-500 font-medium tracking-wide">SMK EL MOSTHOFA</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Desktop Menu Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1 mr-4">
                  <button 
                    onClick={() => handleStandardNav('dashboard')}
                    className={clsx(
                        "px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                        (currentView === 'dashboard' || !currentView) ? "bg-white text-brand-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    {user?.role === Role.TEACHER ? <ClipboardList className="w-4 h-4"/> : <LayoutDashboard className="w-4 h-4"/>} 
                    {user?.role === Role.TEACHER ? "Input Absen" : "Dashboard"}
                  </button>
                  <button 
                    onClick={() => handleStandardNav(user?.role === Role.COUNSELOR ? 'counselor-reports' : user?.role === Role.PRINCIPAL ? 'reports' : 'teacher-reports')}
                    className={clsx(
                        "px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                        (currentView === 'teacher-reports' || currentView === 'counselor-reports' || currentView === 'reports') ? "bg-white text-brand-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    <FileText className="w-4 h-4" /> Laporan
                  </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                  <div className="text-xs text-gray-400 font-medium">
                   {user?.role === Role.TEACHER ? 'Guru Mapel' : user?.role === Role.COUNSELOR ? 'Guru BK' : 'Kepala Sekolah'}
                  </div>
                </div>
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} alt="Avatar" className="w-9 h-9 rounded-full border border-gray-200" />
              </div>
              <button onClick={() => setChangePasswordOpen(true)} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors" title="Ubah Kata Sandi">
                <KeyRound className="w-5 h-5" />
              </button>
              <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header (Minimal) */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
           <div className="flex items-center gap-3">
               <img src={user?.avatar} className="w-9 h-9 rounded-full border border-gray-100 object-cover" alt="Profile" />
               <div>
                   <h2 className="text-sm font-bold text-gray-800">{user?.name}</h2>
                   <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user?.role}</p>
               </div>
           </div>
           <button onClick={logout} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50">
               <LogOut className="w-4 h-4" />
           </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 md:pb-8">
        
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon className="text-brand-600" /> {display.title}
          </h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            {display.desc}
          </p>
        </div>
        
        {children}
      </main>

      <MobileBottomNav />

      <ChangePasswordModal isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />

      <footer className="bg-white border-t py-6 mt-auto hidden md:block">
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
