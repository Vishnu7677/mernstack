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
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/twgoldlogin/profile');
      
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user);
        return { success: true, user: response.data.data.user };
      }
      return { success: false, reason: 'NO_USER_DATA' };
    } catch (error) {
      console.error("%c[PROFILE ERROR]", "color: red", error);
      return { success: false, reason: 'API_ERROR' };
    }
  }, []);

  // Check auth status on mount
  const checkAuthStatus = useCallback(async () => {
    const token = getTokenFromCookies();    
    if (!token) {
      setUser(null);
      return { success: false, reason: 'NO_TOKEN' };
    }

    try {
      const profileResult = await fetchUserProfile();
      if (profileResult.success) {
        return { success: true, user: profileResult.user };
      }
      
      // If profile fetch fails, clear token
      clearAuthData();
      return { success: false, reason: 'INVALID_TOKEN' };
    } catch (error) {
      console.error("%c[AUTH CHECK ERROR]", "color: red", error);
      return { success: false, reason: 'NETWORK_ERROR' };
    }
  }, [fetchUserProfile]);

  // Initialize on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error("Initial auth check failed:", error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [checkAuthStatus]);

  const twgold_login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await api.post('/twgoldlogin/login', { 
        email, 
        password 
      });

      const token = response.data?.token || 
                    response.data?.data?.token || 
                    response.data?.accessToken;
      
      if (token) {
        setTokenInCookies(token, { 
          expiresInDays: 7, 
          sameSite: 'Lax'
        });
      }

      // Try to get user data directly from login response
      let userData = response.data?.user || response.data?.data?.user;
      
      // If no user data in login response, fetch profile
      if (!userData) {
        const profileResult = await fetchUserProfile();
        
        if (profileResult.success) {
          userData = profileResult.user;
        } else {
          return { 
            success: false, 
            message: 'Login successful but could not fetch user profile' 
          };
        }
      }
      setUser(userData);   
      return { 
        success: true, 
        user: userData,
        message: response.data?.message || 'Login successful'
      };
    } catch (error) {
      
      return { 
        success: false, 
        message: error.response?.data?.message || 
                error.response?.data?.error ||
                'Login failed. Please check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const twgold_logout = async () => {
    try {
      await api.post('/twgoldlogin/logout');
    } catch (error) {
      console.warn("Logout API error (might be expected):", error);
    } finally {
      clearAuthData();
      setUser(null);
      window.location.href = '/twgl&articles/login';
    }
  };

  const value = {
    user,
    loading,
    isInitialized,
    twgold_login,
    twgold_logout,
    isAuthenticated: !!user,
    checkAuthStatus,
    fetchUserProfile
  };

  return (
    <TwgoldAuthContext.Provider value={value}>
      {children}
    </TwgoldAuthContext.Provider>
  );
};

export default TwgoldAuthContext;