import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, getScholarData, isRememberMeEnabled, logoutScholar } from '../Services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const userData = getScholarData();
    
    if (token && userData) {
      setCurrentUser(userData);
    }
    setLoading(false);
  }, []);

  const login = (userData, token, rememberMe = false) => {
    setCurrentUser(userData);
  };

  const logout = () => {
    logoutScholar();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isRememberMe: isRememberMeEnabled()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};