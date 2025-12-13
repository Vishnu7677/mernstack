import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwgoldAuth } from './TwgoldAuthContext';
import '../../../styles/TwgoldLogin.css';

const TwgoldLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { twgold_login, user, isAuthenticated } = useTwgoldAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const routes = {
        admin: '/twgl&articles/admin/dashboard',
        manager: '/twgl&articles/manager/dashboard',
        employee: '/twgl&articles/employee/dashboard',
        grivirence: '/twgl&articles/grivirence/dashboard',
        default: '/twgl&articles/home'
      };
      
      const redirectPath = routes[user.role] || routes.default;
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    const result = await twgold_login(email, password);
    
    if (result.success) {

      // Navigation will be handled by useEffect above
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="twgold_login_container">
      <div className="twgold_login_card">
        <div className="twgold_login_header">
          <h1 className="twgold_login_title">TW Gold Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="twgold_login_form">
          {error && (
            <div className="twgold_error_message">
              {error}
            </div>
          )}
          
          <div className="twgold_input_group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="twgold_input_field"
              placeholder=" "
              required
              disabled={loading}
            />
            <label htmlFor="email" className="twgold_input_label">
              Email Address
            </label>
            <span className="twgold_login_highlight"></span>
          </div>
          
          <div className="twgold_input_group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="twgold_input_field"
              placeholder=" "
              required
              disabled={loading}
            />
            <label htmlFor="password" className="twgold_input_label">
              Password
            </label>
            <span className="twgold_login_highlight"></span>
          </div>

          <button 
            type="submit" 
            className="twgold_login_button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="twgold_loading_spinner_small"></span>
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TwgoldLogin;
