



import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Login } from './features/auth/Login';
import { AttendancePage } from './features/teacher/AttendancePage';
import { TeacherReportsPage } from './features/teacher/TeacherReportsPage';
import { CounselorReportsPage } from './features/counselor/CounselorReportsPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PrincipalReportsPage } from './features/principal/PrincipalReportsPage';
import { TeachersPage } from './features/admin/TeachersPage';
import { StudentsPage } from './features/admin/StudentsPage';
import { AcademicsPage } from './features/admin/AcademicsPage';
import { ReportsPage } from './features/admin/ReportsPage';
import { MailboxPage } from './features/admin/MailboxPage';
import { SettingsPage } from './features/admin/SettingsPage';
import { BackupPage } from './features/admin/BackupPage';
import { Role, ViewState } from './types';

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  // State-based router for Admin & Teachers
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  // Dashboard Access: Admin, Principal, Counselor
  const canViewDashboard = [Role.ADMIN, Role.PRINCIPAL, Role.COUNSELOR].includes(user?.role as Role);
  const isAdmin = user?.role === Role.ADMIN;
  const isTeacher = user?.role === Role.TEACHER;
  const isCounselor = user?.role === Role.COUNSELOR;
  const isPrincipal = user?.role === Role.PRINCIPAL;

  // Render logic based on Role and ViewState
  const renderContent = () => {
    // 1. ADMIN ROUTING
    if (isAdmin) {
        switch(currentView) {
          case 'dashboard': return <DashboardPage />;
          case 'teachers': return <TeachersPage />;
          case 'students': return <StudentsPage />;
          case 'academics': return <AcademicsPage />;
          case 'reports': return <ReportsPage />;
          case 'mailbox': return <MailboxPage />;
          case 'settings': return <SettingsPage />;
          case 'backup': return <BackupPage />;
          default: return <DashboardPage />;
        }
    }

    // 2. TEACHER ROUTING
    if (isTeacher) {
        switch(currentView) {
            case 'teacher-reports': return <TeacherReportsPage />;
            default: return <AttendancePage />; 
        }
    }

    // 3. COUNSELOR ROUTING
    if (isCounselor) {
        switch(currentView) {
            case 'counselor-reports': return <CounselorReportsPage />;
            default: return <DashboardPage />;
        }
    }

    // 4. PRINCIPAL ROUTING
    if (isPrincipal) {
        switch(currentView) {
            case 'reports': return <PrincipalReportsPage />; // Mapped to existing 'reports' ViewState or generic
            default: return <DashboardPage />;
        }
    }

    // Fallback
    return canViewDashboard ? <DashboardPage /> : <div className="p-8">Akses Terbatas</div>;
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;