// contexts/TwgoldAuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api, getTokenFromCookies, setTokenInCookies, clearAuthData } from './axiosConfig';

const TwgoldAuthContext = createContext();

export const useTwgoldAuth = () => {
  const context = useContext(TwgoldAuthContext);
  if (!context) {
    throw new Error('useTwgoldAuth must be used within a TwgoldAuthProvider');
  }
  return context;
};

export const TwgoldAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wrap in useCallback so consumers can call it safely
  const checkAuthStatus = useCallback(async () => {
    const token = getTokenFromCookies();
    if (!token) {
      // No token → no network call
      setUser(null);
      setLoading(false);
      return { success: false, reason: 'NO_TOKEN' };
    }

    try {
      setLoading(true);
      const response = await api.get('/twgoldlogin/profile');

      if (response.data?.success) {
        setUser(response.data.data.user);
        return { success: true, user: response.data.data.user };
      } else {
        // Unexpected response structure
        setUser(null);
        return { success: false, reason: 'INVALID_RESPONSE' };
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        // token invalid/expired server-side
        clearAuthData();
        setUser(null);
      }
      console.error('Auth check failed:', error);
      return { success: false, reason: 'NETWORK_OR_401' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Only run checkAuthStatus on mount when token exists
  useEffect(() => {
    const token = getTokenFromCookies();
    if (token) {
      checkAuthStatus();
    } else {
      // No token → skip call but still mark loading as finished
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAuthStatus]);

  const twgold_login = async (email, password) => {
    try {
      const response = await api.post('/twgoldlogin/login', { email, password });
      const data = response.data;

      if (data.success) {
        if (data.token) {
          setTokenInCookies(data.token);
        }
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message, code: data.code };
      }
    } catch (error) {
      const errorData = error.response?.data;
      return {
        success: false,
        message: errorData?.message || 'Network error',
        code: errorData?.code || 'NETWORK_ERROR',
      };
    }
  };

  const twgold_logout = async () => {
    try {
      await api.post('/twgoldlogin/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    twgold_login,
    twgold_logout,
    isAuthenticated: !!user,
    checkAuthStatus, // expose so you can manually re-check after login/refresh
  };

  return (
    <TwgoldAuthContext.Provider value={value}>
      {children}
    </TwgoldAuthContext.Provider>
  );
};

export default TwgoldAuthContext;
