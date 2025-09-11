import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './scholar-login.css';
import schoolLoginImage from '../../../../images/Scholarship-logo.jpg';

const SchoolLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    licenceNumber: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Institution email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.licenceNumber) newErrors.licenceNumber = 'Licence number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/school/dashboard');
    } catch (error) {
      setApiError(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="scholar_login_form_container">
      <div className="scholar_login_image_container">
        <img 
          src={schoolLoginImage} 
          alt="School Login" 
          className="scholar_login_image"
        />
      </div>

      <div className="scholar_login_form_content">
        <div className="scholar_login_form_header">
          <h3 className="scholar_login_form_title scholar_login_form_title_school">
            School Portal Login
          </h3>
          <p className="scholar_login_form_subtitle">
            Access your institution's dashboard
          </p>
        </div>

        {apiError && (
          <div className="scholar_login_api_error">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="scholar_login_form">
          <div className="scholar_login_form_group">
            <label htmlFor="email" className="scholar_login_label">
              Institution Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`scholar_login_input ${errors.email ? 'scholar_login_input_error' : ''}`}
              placeholder="Enter institution email"
              disabled={isLoading}
            />
            {errors.email && <p className="scholar_login_error">{errors.email}</p>}
          </div>

          <div className="scholar_login_form_group">
            <label htmlFor="licenceNumber" className="scholar_login_label">
              Licence Number
            </label>
            <input
              type="text"
              id="licenceNumber"
              name="licenceNumber"
              value={formData.licenceNumber}
              onChange={handleChange}
              className={`scholar_login_input ${errors.licenceNumber ? 'scholar_login_input_error' : ''}`}
              placeholder="Enter institution licence number"
              disabled={isLoading}
            />
            {errors.licenceNumber && <p className="scholar_login_error">{errors.licenceNumber}</p>}
          </div>

          <div className="scholar_login_form_group">
            <label htmlFor="password" className="scholar_login_label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`scholar_login_input ${errors.password ? 'scholar_login_input_error' : ''}`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && <p className="scholar_login_error">{errors.password}</p>}
          </div>

          <div className="scholar_login_helpers">
            <div className="scholar_login_remember">
              <input
                type="checkbox"
                id="remember"
                className="scholar_login_checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                disabled={isLoading}
              />
              <label htmlFor="remember" className="scholar_login_remember_label">
                Remember this device
              </label>
            </div>
            <a href="/school/forgot-password" className="scholar_login_forgot">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="scholar_login_button scholar_login_button_school"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="scholar_login_spinner"></span>
                Logging in...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SchoolLogin;