// Api.js

import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Token types configuration
const TOKEN_TYPES = {
  SCHOLAR: 'scholar_token',
  ADMIN: 'admin_token',
  EMPLOYEE: 'employee_token',
  CAREER: 'career_token'
};

const USER_DATA_KEYS = {
  SCHOLAR: 'scholarData',
  ADMIN: 'adminData',
  EMPLOYEE: 'employeeData',
  CAREER: 'careerData'
};

const REMEMBER_ME_KEYS = {
  SCHOLAR: 'scholarRememberMe',
  ADMIN: 'adminRememberMe',
  EMPLOYEE: 'employeeRememberMe',
  CAREER: 'careerRememberMe'
};

// Login redirect paths
const LOGIN_PATHS = {
  SCHOLAR: '/scholar/apply/self/login',
  ADMIN: '/admin/login',
  EMPLOYEE: '/employee/login',
  CAREER: '/career/login'
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include appropriate auth token based on URL
api.interceptors.request.use(
  (config) => {
    // Determine token type based on URL path
    let tokenType = TOKEN_TYPES.SCHOLAR; // default
    
    if (config.url?.includes('/admin/')) {
      tokenType = TOKEN_TYPES.ADMIN;
    } else if (config.url?.includes('/employee/')) {
      tokenType = TOKEN_TYPES.EMPLOYEE;
    } else if (config.url?.includes('/career/')) {
      tokenType = TOKEN_TYPES.CAREER;
    } else if (config.url?.includes('/scholar/')) {
      tokenType = TOKEN_TYPES.SCHOLAR;
    }
    
    const token = Cookies.get(tokenType);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Add token type header for backend identification (optional)
      config.headers['X-Token-Type'] = tokenType.replace('_token', '');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 globally with proper redirects
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data);
    
    if (error.response?.status === 401) {
      // Determine user type based on URL or request context
      let userType = 'SCHOLAR'; // default
      
      if (error.config.url?.includes('/admin/')) {
        userType = 'ADMIN';
      } else if (error.config.url?.includes('/employee/')) {
        userType = 'EMPLOYEE';
      } else if (error.config.url?.includes('/career/')) {
        userType = 'CAREER';
      }
      
      // Logout the specific user type and redirect to appropriate login
      logoutUser(userType);
      window.location.href = LOGIN_PATHS[userType];
    }
    
    return Promise.reject(error);
  }
);

// ---------------------------
// Auth Helpers
// ---------------------------
const setAuthCookie = (name, value, rememberMe = false) => {
  const options = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: rememberMe ? 7 : 1 // 7 days if rememberMe, else 1 day
  };
  Cookies.set(name, value, options);
};

const removeAuthCookie = (name) => {
  Cookies.remove(name);
};

// Generic logout function for any user type
export const logoutUser = (userType = 'SCHOLAR') => {
  const tokenKey = TOKEN_TYPES[userType];
  const dataKey = USER_DATA_KEYS[userType];
  const rememberMeKey = REMEMBER_ME_KEYS[userType];
  
  removeAuthCookie(tokenKey);
  removeAuthCookie(dataKey);
  removeAuthCookie(rememberMeKey);
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(dataKey);
};

// Specific logout functions for convenience
export const logoutScholar = () => logoutUser('SCHOLAR');
export const logoutAdmin = () => logoutUser('ADMIN');
export const logoutEmployee = () => logoutUser('EMPLOYEE');
export const logoutCareer = () => logoutUser('CAREER');

// Logout all users (useful for complete session cleanup)
export const logoutAllUsers = () => {
  Object.keys(TOKEN_TYPES).forEach(userType => logoutUser(userType));
};

// Get auth token for specific user type
export const getAuthToken = (userType = 'SCHOLAR') => {
  return Cookies.get(TOKEN_TYPES[userType]);
};

// Get user data for specific user type
export const getUserData = (userType = 'SCHOLAR') => {
  const dataKey = USER_DATA_KEYS[userType];
  const data = Cookies.get(dataKey);
  return data ? JSON.parse(data) : null;
};

// Check if remember me is enabled for specific user type
export const isRememberMeEnabled = (userType = 'SCHOLAR') => {
  return Cookies.get(REMEMBER_ME_KEYS[userType]) === 'true';
};

// Check if any user is currently logged in
export const isAnyUserLoggedIn = () => {
  return Object.values(TOKEN_TYPES).some(tokenType => Cookies.get(tokenType));
};

// Check if specific user type is logged in
export const isUserLoggedIn = (userType = 'SCHOLAR') => {
  return !!Cookies.get(TOKEN_TYPES[userType]);
};

// Get current logged in user type
export const getCurrentUserType = () => {
  for (const [userType, tokenKey] of Object.entries(TOKEN_TYPES)) {
    if (Cookies.get(tokenKey)) {
      return userType;
    }
  }
  return null;
};

// Generic login function
export const loginUser = async (userType, loginData, rememberMe = false, loginEndpoint) => {
  const response = await api.post(loginEndpoint, loginData);
  const data = response.data;

  if (data.success && data.data) {
    const tokenKey = TOKEN_TYPES[userType];
    const dataKey = USER_DATA_KEYS[userType];
    const rememberMeKey = REMEMBER_ME_KEYS[userType];
    
    setAuthCookie(tokenKey, data.data.token, rememberMe);
    setAuthCookie(dataKey, JSON.stringify(data.data.user), rememberMe);
    setAuthCookie(rememberMeKey, rememberMe.toString(), rememberMe);
  }

  return data;
};

// ---------------------------
// Specific Login Functions
// ---------------------------

// Scholar Login (existing - maintained for backward compatibility)
export const loginScholar = async (loginData, rememberMe = false) => {
  return loginUser('SCHOLAR', loginData, rememberMe, '/scholar/individual/login');
};

// Admin Login
export const loginAdmin = async (loginData, rememberMe = false) => {
  return loginUser('ADMIN', loginData, rememberMe, '/admin/login');
};

// Employee Login
export const loginEmployee = async (loginData, rememberMe = false) => {
  return loginUser('EMPLOYEE', loginData, rememberMe, '/employee/login');
};

// Career Login
export const loginCareer = async (loginData, rememberMe = false) => {
  return loginUser('CAREER', loginData, rememberMe, '/career/login');
};

// ---------------------------
// Public APIs (no token required)
// ---------------------------

// Scholar Signup (existing)
export const SignupIndividual = async (data) => {
  const response = await api.post('/scholar/individual/signup', {
    fullName: data.fullName,
    email: data.email,
    mobileNumber: data.phone,
    aadharNumber: data.aadharNumber,
    password: data.password
  });
  return response.data;
};

// Aadhar OTP APIs (existing)
export const sendAadharOtp = async (data) => {
  const response = await api.post('/aadharOtp/aadharotpsending', data);
  return response.data;
};

export const verifyAadharOtp = async (data) => {
  const response = await api.post('/aadharOtp/aadharotpverifying', data);
  return response.data;
};

// School APIs (existing)
export const schoolSignup = async (formData) => {
  const response = await api.post('/scholar/signup/school', formData);
  return response.data;
};

export const verifySchoolOtp = async (data) => {
  const response = await api.post('/scholar/verify/school-otp', data);
  return response.data;
};


// -------------
// Payment APIs
// -------------

// Create order (calls your backend)
export const createPaymentOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  try {
    const response = await api.post('/payment/order', { amount, currency, receipt, notes });
    return response.data; // { success: true, order }
  } catch (error) {
    console.error('createPaymentOrder error', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: error.message };
  }
};

// Verify payment (sends rzp ids + additionalData like team & members)
export const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, additionalData = {} }) => {
  try {
    const response = await api.post('/payment/verify', { razorpay_order_id, razorpay_payment_id, razorpay_signature, additionalData });
    return response.data;
  } catch (error) {
    console.error('verifyPayment error', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: error.message };
  }
};


// ---------------------------
// Protected APIs (token required)
// ---------------------------

// Scholar Profile APIs (existing)
export const getProfile = async () => {
  try {
    const response = await api.get('/scholar/individual/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error.response?.data?.message || 'Failed to fetch profile';
  }
};

// Scholarship Application API functions (existing)
export const createOrUpdateApplication = async (formData, applicationId = null) => {
  try {
    const url = applicationId 
      ? `/scholar/individual/applications/${applicationId}`
      : '/scholar/individual/applications';
    
    const method = applicationId ? 'put' : 'post';
    
    const response = await api[method](url, formData);
    return response.data;
  } catch (error) {
    console.error('Error saving application:', error);
    throw error.response?.data?.message || 'Failed to save application';
  }
};

export const saveDraftApplication = async (formData, applicationId) => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required for saving draft');
    }
    
    const response = await api.put(`/scholar/individual/applications/${applicationId}/draft`, formData);
    return response.data;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error.response?.data?.message || 'Failed to save draft';
  }
};

export const submitApplication = async (applicationId) => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required for submission');
    }
    
    const response = await api.put(`/scholar/individual/application/${applicationId}/submit`);
    return response.data;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error.response?.data?.message || 'Failed to submit application';
  }
};

export const getDraftApplication = async () => {
  try {
    const response = await api.get('/scholar/individual/application/draft');
    return response.data;
  } catch (error) {
    console.error('Error fetching application:', error);
    throw error.response?.data?.message || 'Failed to fetch application';
  }
};

export const deleteDraftApplication = async (applicationId) => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required for deletion');
    }
    
    const response = await api.delete(`/scholar/individual/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error.response?.data?.message || 'Failed to delete application';
  }
};

export const uploadDocuments = async (applicationId, formData) => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required for document upload');
    }
    
    const response = await api.post(
      `/scholar/individual/application/${applicationId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response;
  } catch (error) {
    console.error('Error uploading documents:', error);
    throw error.response?.data?.message || 'Failed to upload documents';
  }
};

export const getUploadPresigned = async (filesMeta) => {
  try {
    const res = await api.post('/upload/presign', { files: filesMeta });
    return res.data;
  } catch (err) {
    console.error('getUploadPresigned', err);
    throw err.response?.data || err;
  }
};
// ---------------------------
// Admin APIs (example - add more as needed)
// ---------------------------
export const getAdminDashboard = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    throw error.response?.data?.message || 'Failed to fetch admin dashboard';
  }
};

// ---------------------------
// Employee APIs (example - add more as needed)
// ---------------------------
export const getEmployeeTasks = async () => {
  try {
    const response = await api.get('/employee/tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    throw error.response?.data?.message || 'Failed to fetch employee tasks';
  }
};

// ---------------------------
// Career APIs (example - add more as needed)
// ---------------------------
export const getCareerOpportunities = async () => {
  try {
    const response = await api.get('/career/opportunities');
    return response.data;
  } catch (error) {
    console.error('Error fetching career opportunities:', error);
    throw error.response?.data?.message || 'Failed to fetch career opportunities';
  }
};

export default api;

