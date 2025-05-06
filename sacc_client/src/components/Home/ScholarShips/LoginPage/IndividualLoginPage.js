import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './scholar-login.css'; // We'll create this CSS file
import scholarLoginImage from '../../../../images/Scholarship-logo.jpg'; 

const IndividualLogin = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Simulate API call
      setTimeout(() => {
        if (activeTab === 'individual') {
          navigate('/individual/dashboard');
        } else {
          navigate('/school/dashboard');
        }
        setIsLoading(false);
      }, 1500);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="scholar_login_container">
      <div className="scholar_login_image_container">
        <img 
          src={scholarLoginImage} 
          alt="Scholar Login" 
          className="scholar_login_image"
        />
      </div>

      <div className="scholar_login_card_container">
        <div className="scholar_login_card">
          <div className="scholar_login_header">
            <h2 className="scholar_login_title">
              Welcome Back
            </h2>
            <p className="scholar_login_subtitle">
              Please login to continue to your account
            </p>
          </div>

          <div className="scholar_login_tabs">
            <button
              className={`scholar_login_tab ${activeTab === 'individual' ? 'scholar_login_tab_active' : ''}`}
              onClick={() => setActiveTab('individual')}
            >
              Individual Login
            </button>
            <button
              className={`scholar_login_tab ${activeTab === 'school' ? 'scholar_login_tab_active' : ''}`}
              onClick={() => setActiveTab('school')}
            >
              School/College Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="scholar_login_form">
            <div className="scholar_login_form_group">
              <label htmlFor="email" className="scholar_login_label">
                {activeTab === 'individual' ? 'Email' : 'Institution Email'}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="scholar_login_input"
                placeholder={activeTab === 'individual' ? 'Enter your email' : 'Enter institution email'}
              />
              {errors.email && <p className="scholar_login_error">{errors.email}</p>}
            </div>

            {activeTab === 'school' && (
              <div className="scholar_login_form_group">
                <label htmlFor="licenceNumber" className="scholar_login_label">
                  Licence Number
                </label>
                <input
                  type="text"
                  id="licenceNumber"
                  name="licenceNumber"
                  value={formData.licenceNumber || ''}
                  onChange={handleChange}
                  className="scholar_login_input"
                  placeholder="Enter institution licence number"
                />
                {errors.licenceNumber && <p className="scholar_login_error">{errors.licenceNumber}</p>}
              </div>
            )}

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
                className="scholar_login_input"
                placeholder="Enter your password"
              />
              {errors.password && <p className="scholar_login_error">{errors.password}</p>}
            </div>

            <div className="scholar_login_helpers">
              <div className="scholar_login_remember">
                <input
                  type="checkbox"
                  id="remember"
                  className="scholar_login_checkbox"
                />
                <label htmlFor="remember" className="scholar_login_remember_label">
                  Remember me
                </label>
              </div>
              <Link 
                to={activeTab === 'individual' ? '/forgot-password' : '/school/forgot-password'} 
                className="scholar_login_forgot"
              >
                Forgot password?
              </Link>
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

            <div className="scholar_login_auth_switch">
              <span className="scholar_login_auth_text">
                Don't have an account?
              </span>
              <Link
                to="/scholar/apply"
                className="scholar_login_auth_link"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IndividualLogin;
