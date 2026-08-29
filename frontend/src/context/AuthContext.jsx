import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexus_token') || null);
  const [loading, setLoading] = useState(true);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        clearAuth();
      }
    } catch (err) {
      // Don't log expected 401s as unhandled errors
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (e) {
      console.warn('GSI autoSelect disable note:', e);
    }
  };

  const login = async ({ email, password, captchaToken, captchaAnswer, mfaCode }) => {
    const res = await authService.login({ email, password, captchaToken, captchaAnswer, mfaCode });
    if (res.data.success && !res.data.requiresMfa) {
      if (res.data.token) {
        localStorage.setItem('nexus_token', res.data.token);
        setToken(res.data.token);
      }
      setUser(res.data.user);
    }
    return res.data;
  };

  const handleAuthSuccess = (userData, authToken) => {
    if (authToken) {
      localStorage.setItem('nexus_token', authToken);
      setToken(authToken);
    }
    if (userData) {
      setUser(userData);
    }
  };

  const loginWithGoogle = async (googlePayload) => {
    const res = await authService.googleAuth(googlePayload);
    if (res.data.success && res.data.user) {
      handleAuthSuccess(res.data.user, res.data.token);
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    if (res.data.success && res.data.user) {
      handleAuthSuccess(res.data.user, res.data.token);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn('Backend logout note:', e);
    } finally {
      clearAuth();
    }
  };

  const deleteAccount = async (mfaCode) => {
    const res = await authService.deleteAccount({ mfaCode });
    if (res.data.success) {
      clearAuth();
    }
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      deleteAccount,
      handleAuthSuccess,
      refreshUser: fetchUser,
      isSecurityModalOpen,
      setIsSecurityModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
