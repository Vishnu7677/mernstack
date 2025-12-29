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

// Variables to handle multiple failing requests during refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // If login/signup, save the access token
    const isAuthEndpoint =
      response.config?.url?.includes('/login') ||
      response.config?.url?.includes('/signup');

    if (isAuthEndpoint) {
      const token = response.data?.token || response.data?.data?.token || response.data?.accessToken;
      if (token) setTokenInCookies(token);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not a login attempt
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
      
      if (isRefreshing) {
        // If refresh is already in progress, add this request to a queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // IMPORTANT: Call your specific refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/twgoldlogin/refresh-token`, {}, {
          withCredentials: true 
        });

        const newToken = response.data.token;

        if (newToken) {
          setTokenInCookies(newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          isRefreshing = false;
          
          // Retry original request
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearAuthData();
        
        // Only redirect if we are not already on the login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/twgl&articles/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- Cookie Management ---
export const getTokenFromCookies = () => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie =>
    cookie.trim().startsWith('token=') ||
    cookie.trim().startsWith('admin_token=') ||
    cookie.trim().startsWith('employee_token=')
  );
  return tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1]) : null;
};

export const setTokenInCookies = (token, options = {}) => {
  if (typeof document === 'undefined') return;
  const { name = 'token', expiresInDays = 7, sameSite = 'Lax', secure = isSecureContext } = options;
  const expires = new Date();
  expires.setDate(expires.getDate() + expiresInDays);
  let cookieString = `${name}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=${sameSite}`;
  if (secure) cookieString += '; Secure';
  document.cookie = cookieString;
};

export const clearAuthData = () => {
  const cookies = ['token', 'admin_token', 'employee_token', 'scholar_token', 'refreshToken'];
  cookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
};

// =========================================================
// AUTHENTICATION ENDPOINTS
// =========================================================
export const login = (data) => api.post('/twgoldlogin/login', data);
export const logout = () => api.post('/twgoldlogin/logout');
export const refreshToken = () => api.post('/twgoldlogin/refresh-token');

// =========================================================
// PROFILE ENDPOINTS
// =========================================================

export const getProfile = () => api.get('/twgoldlogin/profile');
export const updateProfile = (data) => api.put('/twgoldlogin/profile', data);
export const changePassword = (data) => api.put('/twgoldlogin/change-password', data);
// =========================================================
// AADHAAR VERIFICATION ENDPOINTS
// =========================================================

export const generateUserAadhaarOtp = (data) => api.post('/twgoldlogin/aadhaar/generate-otp', data);
export const verifyUserAadhaarOtp = (data) => api.post('/twgoldlogin/aadhaar/verify-otp', data);
export const createCustomerWithAadhaar = (data) => api.post('/twgoldlogin/customer/create-with-aadhaar', data);
export const createUserWithAadhaar = (data) => api.post('/twgoldlogin/user/create-with-aadhaar', data);
export const getVerifiedAadhaarDetails = (data) => api.post('/twgoldlogin/user/aadhaar/get-verified-details', data);
export const getAadhaarVerificationStatus = (aadhaarNumber) => api.get(`/twgoldlogin/user/aadhaar/status/${aadhaarNumber}`);
// =========================================================
// USER MANAGEMENT ENDPOINTS
// =========================================================

export const createUser = (data) => api.post('/twgoldlogin/user/create', data);
export const getAllAdmins = () => api.get('/twgoldlogin/admins');
export const getAllUsers = () => api.get('/twgoldlogin/users');
export const getUsersByRole = (role) => api.get(`/twgoldlogin/users/role/${role}`);
export const getUsersByBranch = (branch) => api.get(`/twgoldlogin/branch/${branch}/users`);
export const getUsersByDepartment = (department) => api.get(`/twgoldlogin/department/${department}/users`);
export const updateUserStatus = (id, data) => api.put(`/twgoldlogin/user/${id}/status`, data);
export const updateUserPermissions = (id, data) => api.put(`/twgoldlogin/user/${id}/permissions`, data);


// =========================================================
// BRANCH MANAGEMENT ENDPOINTS
// =========================================================

export const createBranch = (data) => api.post('/twgoldbranch/branches', data);
export const getAllBranches = () => api.get('/twgoldbranch/branches');
export const getBranchById = (id) => api.get(`/twgoldbranch/branches/${id}`);
export const updateBranch = (id, data) => api.put(`/twgoldbranch/branches/${id}`, data);
export const getBranchPerformance = () => api.get('/twgoldbranch/branches-performance');
export const addEmployeeToBranch = (branchId, employeeId) => api.post(`/twgoldbranch/branches/${branchId}/employees/${employeeId}`);

// =========================================================
// ACTIVITY LOG ENDPOINTS
// =========================================================

export const getRecentActivities = () => api.get('/twgoldbranch/activities/recent');
export const getActivitiesByDateRange = (params) => api.get('/twgoldbranch/activities/date-range', { params });
export const getUserActivities = (userId) => api.get(`/twgoldbranch/activities/user/${userId}`);


export default api;