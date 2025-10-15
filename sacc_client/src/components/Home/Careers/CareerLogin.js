import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../Services/api';
import './CareerPage.css';

const CareerLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/careers';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      const { user, token } = response.data.data;
      
      login(user, token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // This would integrate with your Google OAuth implementation
    console.log('Google login clicked');
    // In a real implementation, this would redirect to Google OAuth
  };

  return (
    <div className="careerpage_auth-container">
      <div className="careerpage_auth-card">
        <h2 className="careerpage_auth-title">Login to Your Account</h2>
        
        {error && <div className="careerpage_auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="careerpage_auth-form">
          <div className="careerpage_form-group">
            <label htmlFor="email" className="careerpage_form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="careerpage_form-input"
            />
          </div>
          
          <div className="careerpage_form-group">
            <label htmlFor="password" className="careerpage_form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="careerpage_form-input"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="careerpage_auth-btn"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="careerpage_auth-divider">
          <span>Or</span>
        </div>
        
        <button 
          onClick={handleGoogleLogin}
          className="careerpage_google-btn"
        >
          <span className="careerpage_google-icon">G</span>
          Continue with Google
        </button>
        
        <div className="careerpage_auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="careerpage_auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerLogin;