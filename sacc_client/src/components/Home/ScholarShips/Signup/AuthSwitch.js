import React from 'react';
import { Link } from 'react-router-dom';
import './scholar-signup.css';

const AuthSwitch = ({ isLogin }) => {
  return (
    <div className="scholar_signup_auth_switch">
      <div className="scholar_signup_auth_divider">
        <div className="scholar_signup_auth_divider_line"></div>
      </div>
      <div className="scholar_signup_auth_text">
        <span className="scholar_signup_auth_text_span">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
        </span>
      </div>

      <div>
        <Link
          to={isLogin ? '/scholar/apply' : '/scholar/apply/self/login'}
          className="scholar_signup_auth_link"
        >
          {isLogin ? 'Sign up' : 'Login'}
        </Link>
      </div>
    </div>
  );
};

export default AuthSwitch;