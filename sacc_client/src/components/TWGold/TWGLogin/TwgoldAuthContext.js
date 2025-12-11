// contexts/TwgoldAuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api, setTokenInCookies, clearAuthData } from './axiosConfig';

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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/twgoldlogin/profile');
      
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't clear user here as it might be a temporary network issue
    } finally {
      setLoading(false);
    }
  };

  const twgold_login = async (email, password) => {
    try {
      const response = await api.post('/twgoldlogin/login', { 
        email, 
        password 
      });

      const data = response.data;

      if (data.success) {
        // Store token from response in cookies
        if (data.token) {
          setTokenInCookies(data.token);
        }
        
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { 
          success: false, 
          message: data.message,
          code: data.code 
        };
      }
    } catch (error) {
      const errorData = error.response?.data;
      return { 
        success: false, 
        message: errorData?.message || 'Network error',
        code: errorData?.code || 'NETWORK_ERROR'
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
    checkAuthStatus // Export if needed for manual refresh
  };

  return (
    <TwgoldAuthContext.Provider value={value}>
      {children}
    </TwgoldAuthContext.Provider>
  );
};

export default TwgoldAuthContext;