import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const loginWithTokens = useCallback((data) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const demoLogin = useCallback(async (role) => {
    setLoading(true);
    try {
      const res = await authAPI.demoLogin(role);
      loginWithTokens(res.data);
      addToast(`Logged in as demo ${role}!`);
      return res.data;
    } catch (err) {
      addToast(err.response?.data?.error || 'Login failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loginWithTokens, addToast]);

  const githubLogin = useCallback(async (code) => {
    setLoading(true);
    try {
      const res = await authAPI.githubLogin(code);
      loginWithTokens(res.data);
      addToast('Logged in with GitHub!');
      return res.data;
    } catch (err) {
      addToast(err.response?.data?.error || 'GitHub login failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loginWithTokens, addToast]);

  const googleLogin = useCallback(async (code, redirectUri) => {
    setLoading(true);
    try {
      const res = await authAPI.googleLogin(code, redirectUri);
      loginWithTokens(res.data);
      addToast('Logged in with Google!');
      return res.data;
    } catch (err) {
      addToast(err.response?.data?.error || 'Google login failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loginWithTokens, addToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    addToast('Logged out successfully');
  }, [addToast]);

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await authAPI.updateProfile(data);
      const updatedUser = res.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      addToast('Profile updated!');
      return updatedUser;
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error');
      throw err;
    }
  }, [addToast]);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authAPI.getProfile();
      const updatedUser = res.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch {
      // Token expired
    }
  }, []);

  // Refresh profile on mount if logged in
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    user,
    loading,
    toasts,
    demoLogin,
    githubLogin,
    googleLogin,
    logout,
    updateProfile,
    addToast,
    isAuthenticated: !!user,
    isCreator: user?.role === 'creator',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
