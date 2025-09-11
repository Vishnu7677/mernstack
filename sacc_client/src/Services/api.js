import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("scholar_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 globally
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data);
    if (error.response?.status === 401) {
      // Auto logout on unauthorized
      logoutScholar();
      window.location.href = "/scholar/apply/self/login"; // redirect to login page
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

export const logoutScholar = () => {
  removeAuthCookie('scholar_token');
  removeAuthCookie('scholarData');
  removeAuthCookie('rememberMe');
  localStorage.removeItem('scholar_token');
  localStorage.removeItem('scholarData');
};

export const getAuthToken = () => Cookies.get('scholar_token');

export const getScholarData = () => {
  const data = Cookies.get('scholarData');
  return data ? JSON.parse(data) : null;
};

export const isRememberMeEnabled = () =>
  Cookies.get('rememberMe') === 'true';

// ---------------------------
// Public APIs (no token required)
// ---------------------------
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

export const loginScholar = async (loginData, rememberMe = false) => {
  const response = await api.post('/scholar/individual/login', loginData);
  const data = response.data;

  if (data.success && data.data) {
    setAuthCookie('scholar_token', data.data.token, rememberMe);
    setAuthCookie('scholarData', JSON.stringify(data.data.user), rememberMe);
    setAuthCookie('rememberMe', rememberMe.toString(), rememberMe);
  }

  return data;
};

// Aadhar OTP APIs (if still needed)
export const sendAadharOtp = async (data) => {
  const response = await api.post('/aadharOtp/aadharotpsending', data);
  return response.data;
};

export const verifyAadharOtp = async (data) => {
  const response = await api.post('/aadharOtp/aadharotpverifying', data);
  return response.data;
};

// School APIs (if still needed)
export const schoolSignup = async (formData) => {
  const response = await api.post('/scholar/signup/school', formData);
  return response.data;
};

export const verifySchoolOtp = async (data) => {
  const response = await api.post('/scholar/verify/school-otp', data);
  return response.data;
};

// ---------------------------
// Protected APIs (token required)
// ---------------------------

// Profile APIs
export const getProfile = async () => {
  try {
    const response = await api.get('/scholar/individual/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error.response?.data?.message || 'Failed to fetch profile';
  }
};

// Scholarship Application API functions
export const createOrUpdateApplication = async (formData) => {
  try {
    const response = await api.post('/scholar/individual/application', formData);
    return response.data;
  } catch (error) {
    console.error('Error saving application:', error);
    throw error.response?.data?.message || 'Failed to save application';
  }
};

export const saveDraftApplication = async (formData) => {
  try {
    const response = await api.put('/scholar/individual/application/draft', formData);
    return response.data;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error.response?.data?.message || 'Failed to save draft';
  }
};

export const submitApplication = async () => {
  try {
    console.log("api response")
    const response = await api.put('/scholar/individual/application/submit');
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

export const deleteDraftApplication = async () => {
  try {
    const response = await api.delete('/scholar/individual/application/draft');
    return response.data;
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error.response?.data?.message || 'Failed to delete application';
  }
};

// In your API service file
export const uploadDocuments = async (applicationId, formData) => {
  try {
    const response = await api.post(
      `/scholar/individual/application/${applicationId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${Cookies.get('scholar_token')}`
        }
      }
    );
    return response;
  } catch (error) {
    console.error('Error uploading documents:', error);
    throw error.response?.data?.message || 'Failed to upload documents';
  }
};

export default api;