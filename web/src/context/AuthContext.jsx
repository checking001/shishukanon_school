import React, { createContext, useContext, useState, useCallback } from 'react';
import { api, getToken, setToken, clearToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const username = localStorage.getItem('sk_username');
    const photo = localStorage.getItem('sk_admin_photo') || '';
    return getToken() && username ? { username, photo } : null;
  });

  const login = useCallback(async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    setToken(data.token);
    localStorage.setItem('sk_username', data.username);
    localStorage.setItem('sk_admin_photo', data.photo || '');
    setAdmin({ username: data.username, photo: data.photo || '' });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem('sk_username');
    localStorage.removeItem('sk_admin_photo');
    setAdmin(null);
  }, []);

  const register = useCallback(async (username, password, photo) => {
    const data = await api.post('/auth/register', { username, password, photo });
    // Registering while logged out (first-run bootstrap) does not log you in —
    // matches the original app, which still required the login step after.
    if (admin) {
      localStorage.setItem('sk_username', data.username);
      localStorage.setItem('sk_admin_photo', data.photo || '');
      setAdmin({ username: data.username, photo: data.photo || '' });
    }
    return data;
  }, [admin]);

  return (
    <AuthContext.Provider value={{ admin, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
