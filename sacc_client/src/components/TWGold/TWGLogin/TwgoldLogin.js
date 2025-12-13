import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';
import { useTwgoldAuth } from './TwgoldAuthContext';
import '../../../styles/TwgoldLogin.css';

const TwgoldLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { twgold_login, user } = useTwgoldAuth();
  const navigate = useNavigate();

  // Moved redirectToDashboard inside useCallback to make it stable
  const redirectToDashboard = useCallback((role) => {
    const routes = {
      admin: '/twgl&articles/admin/dashboard',
      manager: '/twgl&articles/manager/dashboard',
      employee: '/twgl&articles/employee/dashboard',
      grivirence: '/twgl&articles/grivirence/dashboard'
    };
    navigate(routes[role] || '/twgl&articles/login');
  }, [navigate]); // Added navigate as dependency

  useEffect(() => {
    if (user) {
      redirectToDashboard(user.role);
    }
  }, [user, redirectToDashboard]); // Added redirectToDashboard to dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
console.log(email,password)

    const result = await twgold_login(email, password);
    
    if (result.success) {
      redirectToDashboard(result.user.role);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="twgold_login_container">
      <div className="twgold_login_card">
        <div className="twgold_login_header">
          <h1 className="twgold_login_title">TW Gold Login </h1>
        </div>

        <form onSubmit={handleSubmit} className="twgold_login_form">
          {error && <div className="twgold_error_message">{error}</div>}
          
          <div className="twgold_input_group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="twgold_input_field"
              placeholder=" " // Important: use space for placeholder
              required
            />
            <label htmlFor="email" className="twgold_input_label">Email Address</label>
            <span className="twgold_login_highlight"></span>
          </div>
          <div className="twgold_input_group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="twgold_input_field"
              placeholder=" " // Important: use space for placeholder
              required
            />
            <label htmlFor="password" className="twgold_input_label">Password</label>
            <span className="twgold_login_highlight"></span>
          </div>

          <button 
            type="submit" 
            className="twgold_login_button"
            disabled={loading}
          >
            {loading ? (
              <span className="twgold_loading_text">Authenticating...</span>
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
