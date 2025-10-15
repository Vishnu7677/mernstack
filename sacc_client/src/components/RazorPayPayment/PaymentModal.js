import React from 'react';
import './PaymentModal.css';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onProceed, 
  isProcessing, 
  paymentStatus, 
  onRetry, 
  applicationFee 
}) => {
  if (!isOpen) return null;

  const getStatusContent = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <div className="payment-status processing">
            <div className="status-spinner"></div>
            <h3>Processing Payment</h3>
            <p>Please wait while we process your payment...</p>
          </div>
        );
      
      case 'verifying':
        return (
          <div className="payment-status verifying">
            <div className="status-spinner"></div>
            <h3>Verifying Payment</h3>
            <p>Please wait while we verify your payment...</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="payment-status success">
            <div className="status-icon">✓</div>
            <h3>Payment Successful!</h3>
            <p>Your payment has been processed successfully.</p>
          </div>
        );
      
      case 'failed':
        return (
          <div className="payment-status failed">
            <div className="status-icon">✕</div>
            <h3>Payment Failed</h3>
            <p>There was an issue processing your payment.</p>
            <button 
              onClick={onRetry}
              className="retry-button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Retry Payment'}
            </button>
          </div>
        );
      
      case 'cancelled':
        return (
          <div className="payment-status cancelled">
            <div className="status-icon">⚠</div>
            <h3>Payment Cancelled</h3>
            <p>You cancelled the payment process.</p>
            <button 
              onClick={onRetry}
              className="retry-button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Try Again'}
            </button>
          </div>
        );
      
      default:
        return (
          <div className="payment-initial">
            <div className="payment-header">
              <h3>Application Fee Payment</h3>
              <p>Complete your scholarship application by paying the application fee</p>
            </div>
            
            <div className="payment-details">
              <div className="fee-amount">
                <span className="amount">₹{applicationFee}</span>
                <span className="label">Application Fee</span>
              </div>
              
              <div className="payment-features">
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Secure payment processing</span>
                </div>
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Multiple payment methods</span>
                </div>
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Instant application submission</span>
                </div>
              </div>
            </div>
            
            <div className="payment-actions">
              <button 
                onClick={onClose}
                className="payment-button secondary"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={onProceed}
                className="payment-button primary"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${applicationFee}`}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button className="modal-close" onClick={onClose}>×</button>
        {getStatusContent()}
      </div>
    </div>
  );
};

export default PaymentModal;