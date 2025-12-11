// utils/axiosConfig.js
import axios from 'axios';
import { PUBLIC_PATHS } from '../../../config/routes';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://www.sacb.co.in/api'   // production fallback
    : 'http://localhost:5000/api');  // dev fallback


// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor to attach token from cookies
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// utils/axiosConfig.js

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.token) {
      setTokenInCookies(response.data.token);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || error.request?.responseURL || '';

    if (status === 401) {
      clearAuthData();

      const isBrowser = typeof window !== 'undefined';
      const currentPath = isBrowser ? window.location.pathname : '';

      // TWGold-only detection
      const isTwgoldFrontendPath = isBrowser && currentPath.startsWith('/twgl&articles');
      const isTwgoldApiRequest =
        requestUrl.includes('/twgoldlogin') ||
        requestUrl.includes('/twgl&articles') ||
        requestUrl.includes('/twgold');

      // Treat certain frontend TWGold routes as public (do not redirect away from them)
      const isCurrentPathPublic = PUBLIC_PATHS.includes(currentPath);

      // -----------------------------
      // CASE 1: TWGOLD AREA → redirect (unless current path is public)
      // -----------------------------
      if ((isTwgoldFrontendPath || isTwgoldApiRequest) && !isCurrentPathPublic) {
        if (currentPath !== '/twgl&articles/login') {
          window.location.href = '/twgl&articles/login';
        }
      }

      // -------------------------------------------------------
      // CASE 2: NON-TWGOLD AREAS → DO NOT REDIRECT IMMEDIATELY
      // -------------------------------------------------------
      else {
        console.warn('401 (Non-TWGold or public TWGold path):', requestUrl, 'currentPath:', currentPath);

        // No redirect here — AuthGuard/Auth providers will handle navigation.
        // Optionally uncomment to auto-redirect module specific paths:
        // if (currentPath.startsWith('/admin')) window.location.href = '/admin/login';
        // if (currentPath.startsWith('/employee')) window.location.href = '/employee/login';
        // if (currentPath.startsWith('/scholar')) window.location.href = '/scholar/apply/self/login';
      }
    }

    return Promise.reject(error);
  }
);


// Cookie management functions
export const getTokenFromCookies = () => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  return tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1]) : null;
};

export const setTokenInCookies = (token, expiresInDays = 7) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + expiresInDays);
  
  const cookieString = `token=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; samesite=strict`;
  
  document.cookie = cookieString;
};

export const clearAuthData = () => {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export default api;