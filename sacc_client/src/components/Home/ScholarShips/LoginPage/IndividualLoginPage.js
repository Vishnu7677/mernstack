import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './scholar-login.css';
import scholarLoginImage from '../../../../images/Scholarship-logo.jpg';
import { loginScholar } from '../../../../Services/api';
import Cookies from 'js-cookie';

const IndividualLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
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
      const loginData = {
        email: formData.email,
        password: formData.password
      };
  
      console.log('Attempting login...');
      const response = await loginScholar(loginData, rememberMe);
      
      if (response.success) {
        console.log('Login successful, checking token...');
        const token = Cookies.get('scholar_token');
        console.log('Token after login:', token ? 'Present' : 'Missing');
        
        // Small delay to ensure token is set
        setTimeout(() => {
          navigate('/scholar/apply/individualscholarship');
        }, 100);
      } else {
        setApiError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="scholar_login_form_container">
      <div className="scholar_login_image_container">
        <img 
          src={scholarLoginImage} 
          alt="Scholar Login" 
          className="scholar_login_image"
        />
      </div>

      <div className="scholar_login_form_content">
        <div className="scholar_login_form_header">
          <h5 className="scholar_login_form_subtitle">
            Sign in to your individual account
          </h5>
        </div>

        {apiError && (
          <div className="scholar_login_api_error">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="scholar_login_form">
          <div className="scholar_login_form_group">
            <label htmlFor="email" className="scholar_login_label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`scholar_login_input ${errors.email ? 'scholar_login_input_error' : ''}`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && <p className="scholar_login_error">{errors.email}</p>}
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
                Remember me for 7 days
              </label>
            </div>
            <a href="/forgot-password" className="scholar_login_forgot">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="scholar_login_button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="scholar_login_spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IndividualLogin;