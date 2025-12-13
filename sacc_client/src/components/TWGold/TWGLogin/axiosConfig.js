// utils/axiosConfig.js
import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://www.sacb.co.in/api'
    : 'http://localhost:5000/api');

const isSecureContext =
  typeof window !== 'undefined' && window.location.protocol === 'https:';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (IMPROVED)
api.interceptors.response.use(
  (response) => {
    // Only handle token from response if it's a login/signup endpoint
    const isAuthEndpoint =
      response.config?.url?.includes('/login') ||
      response.config?.url?.includes('/signup');

    if (isAuthEndpoint) {
      const token = response.data?.token ||
        response.data?.data?.token ||
        response.data?.accessToken;

      if (token) {
        // FIX: Remove hardcoded secure: false. Let the utility handle it.
        setTokenInCookies(token, {
          expiresInDays: 7,
          sameSite: 'Lax',
          // secure property is removed here
        });
      }
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401) {
      clearAuthData();

      const isTwgoldApiRequest =
        requestUrl.includes('/twgold') ||
        requestUrl.includes('/twgl');

      if (isTwgoldApiRequest) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
          window.location.href = '/twgl&articles/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Cookie management
export const getTokenFromCookies = () => {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie =>
    cookie.trim().startsWith('token=') ||
    cookie.trim().startsWith('admin_token=') ||
    cookie.trim().startsWith('employee_token=')
  );

  if (tokenCookie) {
    return decodeURIComponent(tokenCookie.split('=')[1]);
  }
  return null;
};

export const setTokenInCookies = (token, options = {}) => {
  if (typeof document === 'undefined') return;

  const {
    name = 'token',
    expiresInDays = 7,
    sameSite = 'Lax',
    secure = isSecureContext,
    domain
  } = options;

  const expires = new Date();
  expires.setDate(expires.getDate() + expiresInDays);

  let cookieString = `${name}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=${sameSite}`;
  if (secure) cookieString += '; Secure';
  if (domain) cookieString += `; domain=${domain}`;

  document.cookie = cookieString;
};

export const clearAuthData = () => {
  // Clear all auth-related cookies
  const cookies = ['token', 'admin_token', 'employee_token', 'scholar_token'];
  cookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
};

export default api;