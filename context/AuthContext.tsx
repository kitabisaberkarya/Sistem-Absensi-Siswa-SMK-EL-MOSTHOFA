
import React, { createContext, useContext, useState, ReactNode, PropsWithChildren, useEffect, useCallback } from 'react';
import { User } from '../types';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 jam
const LOGIN_TIME_KEY = 'auth_login_time';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem(LOGIN_TIME_KEY);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const loginTime = localStorage.getItem(LOGIN_TIME_KEY);

    if (storedUser && loginTime) {
      const elapsed = Date.now() - Number(loginTime);
      if (elapsed > SESSION_DURATION_MS) {
        logout();
        return;
      }
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id) setUser(parsed);
      } catch {
        logout();
      }
    }
  }, [logout]);

  // Cek sesi setiap menit, auto-logout bila habis
  useEffect(() => {
    const interval = setInterval(() => {
      const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
      if (loginTime && Date.now() - Number(loginTime) > SESSION_DURATION_MS) {
        logout();
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [logout]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem(LOGIN_TIME_KEY, String(Date.now()));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
