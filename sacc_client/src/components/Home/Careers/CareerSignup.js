import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../Services/api';
import './CareerPage.css';

const CareerSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/signup', formData);
      const { user, token } = response.data.data;
      
      login(user, token);
      navigate('/careers');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // This would integrate with your Google OAuth implementation
    console.log('Google signup clicked');
    // In a real implementation, this would redirect to Google OAuth
  };

  return (
    <div className="careerpage_auth-container">
      <div className="careerpage_auth-card">
        <h2 className="careerpage_auth-title">Create Your Account</h2>
        
        {error && <div className="careerpage_auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="careerpage_auth-form">
          <div className="careerpage_form-group">
            <label htmlFor="name" className="careerpage_form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="careerpage_form-input"
            />
          </div>
          
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
              minLength="6"
              className="careerpage_form-input"
            />
          </div>
          
          <div className="careerpage_form-group">
            <label htmlFor="confirmPassword" className="careerpage_form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              minLength="6"
              className="careerpage_form-input"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="careerpage_auth-btn"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="careerpage_auth-divider">
          <span>Or</span>
        </div>
        
        <button 
          onClick={handleGoogleSignup}
          className="careerpage_google-btn"
        >
          <span className="careerpage_google-icon">G</span>
          Sign up with Google
        </button>
        
        <div className="careerpage_auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="careerpage_auth-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerSignup;