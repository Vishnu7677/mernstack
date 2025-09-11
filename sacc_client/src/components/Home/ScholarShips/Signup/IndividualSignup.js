import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupIndividual } from '../../../../Services/api';
import './scholar-signup.css';

const IndividualSignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    aadharNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Valid 10-digit phone number is required';
    if (!/^\d{12}$/.test(formData.aadharNumber)) newErrors.aadharNumber = 'Valid 12-digit Aadhar number is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      
      // Remove confirmPassword from the data we send to the API
      const { confirmPassword, ...signupData } = formData;
      console.log(formData)
      const response = await SignupIndividual(signupData);
      
      if (response.success) {
        setReferenceNumber(response.data.referenceNumber);
        setSignupSuccess(true);
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (signupSuccess) {
    return (

        <div className="scholar_signup_success_container">
          <div className="scholar_signup_success_card">
            <h2 className="scholar_signup_success_title">Signup Successful!</h2>
            <p className="scholar_signup_success_message">
              Thank you for registering. Your reference number is:
            </p>
            <div className="scholar_signup_reference_number">
              {referenceNumber}
            </div>
            <p className="scholar_signup_success_instructions">
              Please keep this reference number for future correspondence.
            </p>
            <button 
              className="scholar_signup_button"
              onClick={() => navigate('/scholar/apply/self/login')}
            >
              Proceed to Login
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="scholar_signup_container">
        <div className="scholar_signup_header">
          <h2 className="scholar_signup_title">Create Account</h2>
          <p>Sign up to apply for scholarships</p>
        </div>

        <div className="scholar_signup_card_container">
          <div className="scholar_signup_card">
            <form onSubmit={handleSubmit}>
              <div className="scholar_signup_form_group">
                <label htmlFor="fullName" className="scholar_signup_label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`scholar_signup_input ${errors.fullName ? 'scholar_signup_input_error' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="scholar_signup_error">{errors.fullName}</p>}
              </div>

              <div className="scholar_signup_form_group">
                <label htmlFor="email" className="scholar_signup_label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`scholar_signup_input ${errors.email ? 'scholar_signup_input_error' : ''}`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="scholar_signup_error">{errors.email}</p>}
              </div>

              <div className="scholar_signup_form_group">
                <label htmlFor="phone" className="scholar_signup_label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`scholar_signup_input ${errors.phone ? 'scholar_signup_input_error' : ''}`}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
                {errors.phone && <p className="scholar_signup_error">{errors.phone}</p>}
              </div>

              <div className="scholar_signup_form_group">
                <label htmlFor="aadharNumber" className="scholar_signup_label">
                  Aadhar Number *
                </label>
                <input
                  type="text"
                  id="aadharNumber"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  className={`scholar_signup_input ${errors.aadharNumber ? 'scholar_signup_input_error' : ''}`}
                  placeholder="Enter 12-digit Aadhar number"
                  maxLength="12"
                />
                {errors.aadharNumber && <p className="scholar_signup_error">{errors.aadharNumber}</p>}
              </div>

              <div className="scholar_signup_form_group">
                <label htmlFor="password" className="scholar_signup_label">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`scholar_signup_input ${errors.password ? 'scholar_signup_input_error' : ''}`}
                  placeholder="Create a password (min. 8 characters)"
                />
                {errors.password && <p className="scholar_signup_error">{errors.password}</p>}
              </div>

              <div className="scholar_signup_form_group">
                <label htmlFor="confirmPassword" className="scholar_signup_label">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`scholar_signup_input ${errors.confirmPassword ? 'scholar_signup_input_error' : ''}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="scholar_signup_error">{errors.confirmPassword}</p>}
              </div>

              {errors.submit && <p className="scholar_signup_error">{errors.submit}</p>}

              <button
                type="submit"
                className="scholar_signup_button"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};

export default IndividualSignup;