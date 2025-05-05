// Popup.js
import React from 'react';
import './Popup.css'; // Ensure you have the styles for the popup

const Popup = ({ show, onClose, onConfirm, action }) => {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="popup-header">
          <h5 className="popup-title">Confirm Action</h5>
        </div>
        <div className="popup-body">
          Are you sure you want to {action} this membership request?
        </div>
        <div className="popup-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
