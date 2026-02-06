

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './features/auth/Login';
import { AttendancePage } from './features/teacher/AttendancePage';
import { TeacherReportsPage } from './features/teacher/TeacherReportsPage'; // New Import
import { DashboardPage } from './features/dashboard/DashboardPage';
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
        // Teacher has 'dashboard' (attendance entry) and 'teacher-reports'
        switch(currentView) {
            case 'teacher-reports': return <TeacherReportsPage />;
            default: return <AttendancePage />; // Default to input attendance
        }
    }

    // 3. OTHER ROLES (Principal / Counselor)
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;