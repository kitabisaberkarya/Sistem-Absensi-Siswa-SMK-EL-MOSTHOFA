
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './features/auth/Login';
import { AttendancePage } from './features/teacher/AttendancePage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TeachersPage } from './features/admin/TeachersPage';
import { StudentsPage } from './features/admin/StudentsPage';
import { ReportsPage } from './features/admin/ReportsPage';
import { MailboxPage } from './features/admin/MailboxPage';
import { SettingsPage } from './features/admin/SettingsPage';
import { Role, ViewState } from './types';

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  // State-based router for Admin Panel
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  // Dashboard Access: Admin, Principal, Counselor
  const canViewDashboard = [Role.ADMIN, Role.PRINCIPAL, Role.COUNSELOR].includes(user?.role as Role);
  const isAdmin = user?.role === Role.ADMIN;

  // Render logic based on Role and ViewState
  const renderContent = () => {
    if (!isAdmin) {
       // Non-Admin logic remains simple (Dashboard or Attendance)
       return canViewDashboard ? <DashboardPage /> : <AttendancePage />;
    }

    // Admin Routing
    switch(currentView) {
      case 'dashboard': return <DashboardPage />;
      case 'teachers': return <TeachersPage />;
      case 'students': return <StudentsPage />;
      case 'reports': return <ReportsPage />;
      case 'mailbox': return <MailboxPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
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