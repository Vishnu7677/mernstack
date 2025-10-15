import { useState, useCallback } from 'react';
import paymentService from './paymentService';
import showToast from '../components/Toast';

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = useCallback(async (amount, applicationData, onSuccess, onFailure) => {
    try {
      setIsProcessing(true);
      setPaymentStatus('initiating');

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create order
      const orderResponse = await paymentService.createOrder(
        amount,
        'INR',
        `app_${applicationData.draftApplicationId || Date.now()}`,
        {
          applicationId: applicationData.draftApplicationId,
          type: 'scholarship_application'
        }
      );

      if (!orderResponse.success) {
        throw new Error(orderResponse.error?.description || 'Failed to create payment order');
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'Scholarship Portal',
        description: 'Scholarship Application Fee',
        order_id: orderResponse.order.id,
        handler: async (response) => {
          try {
            setPaymentStatus('verifying');
            
            // Verify payment
            const verifyResponse = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              setPaymentStatus('success');
              showToast('success', 'Payment successful!');
              await onSuccess(verifyResponse.payment);
            } else {
              setPaymentStatus('failed');
              showToast('error', 'Payment verification failed');
              await onFailure('Payment verification failed');
            }
          } catch (error) {
            setPaymentStatus('failed');
            console.error('Payment verification error:', error);
            showToast('error', 'Payment verification error');
            await onFailure('Payment verification error');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: applicationData.fullName,
          email: applicationData.email,
          contact: applicationData.mobileNumber
        },
        notes: {
          applicationId: applicationData.draftApplicationId,
          scholarshipType: 'individual'
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            // Use the current paymentStatus value directly
            if (paymentStatus !== 'success') {
              setPaymentStatus('cancelled');
              setIsProcessing(false);
              showToast('info', 'Payment cancelled');
              onFailure('Payment cancelled by user');
            }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response) => {
        setPaymentStatus('failed');
        setIsProcessing(false);
        console.error('Payment failed:', response.error);
        showToast('error', `Payment failed: ${response.error.description}`);
        onFailure(response.error.description);
      });

      rzp.open();
      setPaymentStatus('processing');

    } catch (error) {
      console.error('Payment initiation error:', error);
      setIsProcessing(false);
      setPaymentStatus('failed');
      showToast('error', error.message || 'Failed to initiate payment');
      onFailure(error.message || 'Payment initiation failed');
    }
  }, [paymentStatus]); // Added paymentStatus to dependencies

  const retryPayment = useCallback(async (amount, applicationData, onSuccess, onFailure) => {
    setPaymentStatus(null);
    await initiatePayment(amount, applicationData, onSuccess, onFailure);
  }, [initiatePayment]);

  return {
    initiatePayment,
    retryPayment,
    isProcessing,
    paymentStatus
    // Removed setPaymentStatus from return since it's not used externally
  };
};