import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const individualSignup = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/aadharOtp/aadharotpsending`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Signup failed';
  }
};

export const verifyAadharOtp = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/aadharOtp/aadharotpverifying`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'OTP verification failed';
  }
};

export const schoolSignup = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/scholar/signup/school`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Signup failed';
  }
};
export const verifySchoolOtp = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/scholar/verify/school-otp`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'OTP verification failed';
  }
};