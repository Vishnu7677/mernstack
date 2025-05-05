import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { individualSignup, verifyAadharOtp } from '../../../../Services/api';
import './scholar-signup.css';

const IndividualSignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    aadharNumber: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Valid 10-digit phone number is required';
    if (!/^\d{12}$/.test(formData.aadharNumber)) newErrors.aadharNumber = 'Valid 12-digit Aadhar number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await individualSignup(formData);
      setOtpSent(true);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyAadharOtp({ aadhaarNumber: formData.aadharNumber, otp });
      navigate('/scholar/apply/self/login');
    } catch (error) {
      setErrors({ otp: 'Invalid OTP' });
      navigate('/scholar/apply');
    }
  };

  if (otpSent) {
    return (
      <form onSubmit={handleOtpSubmit}>
        <div className="form-group">
          <label>
            Enter OTP sent to your Aadhar registered mobile
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`form-control ${errors.otp ? 'is-invalid' : ''}`}
            required
          />
          {errors.otp && <div className="invalid-feedback">{errors.otp}</div>}
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block mt-4"
        >
          Verify OTP
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
    <div className="scholar_signup_form_group">
      <label htmlFor="fullName" className="scholar_signup_label">
        Full Name
      </label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        className="scholar_signup_input"
      />
      {errors.fullName && <p className="scholar_signup_error">{errors.fullName}</p>}
    </div>

    {/* Repeat similar structure for other fields */}
    {/* Email field */}
    <div className="scholar_signup_form_group">
      <label htmlFor="email" className="scholar_signup_label">
        Email
      </label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="scholar_signup_input"
      />
      {errors.email && <p className="scholar_signup_error">{errors.email}</p>}
    </div>

    {/* Phone field */}
    <div className="scholar_signup_form_group">
      <label htmlFor="phone" className="scholar_signup_label">
        Phone Number
      </label>
      <input
        type="tel"
        id="phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        className="scholar_signup_input"
      />
      {errors.phone && <p className="scholar_signup_error">{errors.phone}</p>}
    </div>

    {/* Aadhar field */}
    <div className="scholar_signup_form_group">
      <label htmlFor="aadharNumber" className="scholar_signup_label">
        Aadhar Number
      </label>
      <input
        type="text"
        id="aadharNumber"
        name="aadharNumber"
        value={formData.aadharNumber}
        onChange={handleChange}
        className="scholar_signup_input"
      />
      {errors.aadharNumber && <p className="scholar_signup_error">{errors.aadharNumber}</p>}
    </div>

    {errors.submit && <p className="scholar_signup_error">{errors.submit}</p>}

    <button
      type="submit"
      className="scholar_signup_button"
    >
      Sign Up
    </button>
  </form>
  );
};

export default IndividualSignup;