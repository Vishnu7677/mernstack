import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './scholar-login.css';
import schoolLoginImage from '../../../../images/Scholarship-logo.jpg'; 


const SchoolLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    licenceNumber: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Institution email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.licenceNumber) newErrors.licenceNumber = 'Licence number is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/school/dashboard');
      } catch (error) {
        setErrors({ submit: error.message });
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="scholar_login_container">
      <div className="scholar_login_image_container">
        <img 
          src={schoolLoginImage} 
          alt="School Login" 
          className="scholar_login_image"
        />
      </div>

      <div className="scholar_login_card_container">
        <div className="scholar_login_card">
          <div className="scholar_login_header">
            <h2 className="scholar_login_title scholar_login_title_school">
              School Portal Login
            </h2>
            <p className="scholar_login_subtitle">
              Access your institution's dashboard
            </p>
          </div>

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
                className="scholar_login_input"
                placeholder="Enter institution email"
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
                className="scholar_login_input"
                placeholder="Enter institution licence number"
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
                  Remember this device
                </label>
              </div>
              <Link to="/school/forgot-password" className="scholar_login_forgot">
                Forgot password?
              </Link>
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

            {errors.submit && (
              <p className="scholar_login_error scholar_login_submit_error">
                {errors.submit}
              </p>
            )}

            <div className="scholar_login_auth_switch">
              <span className="scholar_login_auth_text">
                Not a school administrator?
              </span>
              <Link
                to="/login/individual"
                className="scholar_login_auth_link"
              >
                Individual login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolLoginPage;