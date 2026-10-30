import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('foodshare_theme') || 'dark');
  const [viewMode, setViewMode] = useState('responsive'); // 'responsive' | 'mobile_frame'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('foodshare_theme', theme);
  }, [theme]);

  // Restore session from stored JWT on page load — never auto-login
  useEffect(() => {
    async function initAuth() {
      try {
        const token = localStorage.getItem('foodshare_token');
        if (token) {
          try {
            const res = await authApi.getMe();
            setUser(res.user);
          } catch {
            // Token invalid or expired — clear it and show portal landing
            localStorage.removeItem('foodshare_token');
          }
        }
        // No auto-login: user must sign in explicitly
      } catch (err) {
        console.warn('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password, expectedRole) => {
    const res = await authApi.login(email, password);
    if (expectedRole && res.user.role !== expectedRole) {
      throw new Error(`This account belongs to the ${res.user.role} portal.`);
    }
    localStorage.setItem('foodshare_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    localStorage.setItem('foodshare_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('foodshare_token');
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'responsive' ? 'mobile_frame' : 'responsive'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        viewMode,
        login,
        register,
        logout,
        toggleTheme,
        toggleViewMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
