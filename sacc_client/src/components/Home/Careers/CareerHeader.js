import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './CareerPage.css';

const CareerHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="careerpage_header">
      <div className="careerpage_header-container">
        <Link to="/" className="careerpage_logo">
          CareerPortal
        </Link>
        <nav className="careerpage_nav">
          <Link to="/careers" className="careerpage_nav-link">
            Jobs
          </Link>
          {user ? (
            <div className="careerpage_user-menu">
              <span className="careerpage_user-greeting">Hello, {user.name}</span>
              <button onClick={handleLogout} className="careerpage_logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="careerpage_auth-links">
              <Link to="/login" className="careerpage_nav-link">
                Login
              </Link>
              <Link to="/signup" className="careerpage_nav-link careerpage_signup-link">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default CareerHeader;