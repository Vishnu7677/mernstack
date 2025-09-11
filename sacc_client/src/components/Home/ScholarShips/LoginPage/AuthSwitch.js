import React from 'react';
import { Link } from 'react-router-dom';
import './scholar-login.css';

const AuthSwitch = ({ isLogin, userType = 'individual' }) => {
  return (
    <div className="scholar_auth_switch">
      <div className="scholar_auth_divider">
        <div className="scholar_auth_divider_line"></div>
      </div>
      <div className="scholar_auth_text">
        <span className="scholar_auth_text_span">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
        </span>
      </div>

      <div>
        <Link
          to={
            isLogin 
              ? '/scholar/apply' // Always go to signup page
              : '/scholar/apply/self/login' // Always go to login page
          }
          className="scholar_auth_link"
        >
          {isLogin ? 'Sign up' : 'Login'}
        </Link>
      </div>
    </div>
  );
};

export default AuthSwitch;