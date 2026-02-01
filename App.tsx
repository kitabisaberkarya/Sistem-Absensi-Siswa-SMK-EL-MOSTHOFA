import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './features/auth/Login';
import { AttendancePage } from './features/teacher/AttendancePage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { Role } from './types';

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  // Dashboard Access: Admin, Principal, Counselor
  const canViewDashboard = [Role.ADMIN, Role.PRINCIPAL, Role.COUNSELOR].includes(user?.role as Role);

  return (
    <Layout>
      {canViewDashboard ? (
        <DashboardPage />
      ) : (
        <AttendancePage />
      )}
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