import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create and export the service instance
const paymentService = {
  // Create Razorpay order
  createOrder: async (amount, currency = 'INR', receipt, notes = {}) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/create-order`, {
        amount,
        currency,
        receipt,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/verify-payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  // Capture payment
  capturePayment: async (paymentId, amount, currency = 'INR') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/capture/${paymentId}`, {
        amount,
        currency
      });
      return response.data;
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw error;
    }
  },

  // Check payment status
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }
};

export default paymentService;