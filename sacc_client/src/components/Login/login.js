import { useState } from "react";
import { useNavigate } from "react-router";
import './login.css';
import apiList from "../../lib/apiList";
import showToast from '../Toast';
import Cookies from "js-cookie";
import { ToastContainer } from 'react-toastify';

function parseExpiresIn(expiresIn) {
    const match = expiresIn.match(/(\d+)([h|m|s|d])/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case 'h':
          return value / 24;
        case 'm':
          return value / 1440;
        case 's':
          return value / 86400;
        case 'd':
          return value;
        default:
          throw new Error(`Invalid unit: ${unit}`);
      }
    } else {
      throw new Error(`Invalid expiresIn value: ${expiresIn}`);
    }
}

const Login = () => {
    let navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const onSubmitForm = async (e) => {
        e.preventDefault();
        const url = apiList.EmployeeLogin;
        const options = {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify({ email, password }),
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (response.ok) {
                const { token, expiresIn, tokenType } = data.data;
                const expiresInDays = parseExpiresIn(expiresIn);
                Cookies.set('employee_token', token, { expires: expiresInDays });
                Cookies.set('token_type', tokenType, { expires: expiresInDays });                
                showToast('success', 'Login Successful!');
                setTimeout(() => navigate('/employee/dashboard'), 1500);
            } else {
                showToast('error', data.message || 'Login Failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            showToast('error', 'An unexpected error occurred. Please try again.');
        }

        setEmail("");
        setPassword("");
    };

    return (
        <div className="employee_login_container">
            <ToastContainer />
            <div className="employee_login_card">
                <div className="employee_login_header">
                    <h2>Employee Portal</h2>
                    <p>Access your work dashboard</p>
                </div>
                <form onSubmit={onSubmitForm} className="employee_login_form">
                    <div className="employee_login_input_group">
                        <input
                            type="email"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="employee_login_input"
                        />
                        <label className="employee_login_label">Email</label>
                        <span className="employee_login_highlight"></span>
                    </div>
                    <div className="employee_login_input_group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="employee_login_input"
                        />
                        <label className="employee_login_label">Password</label>
                        <span className="employee_login_highlight"></span>
                    </div>
                    <div className="employee_login_show_password">
                        <input
                            type="checkbox"
                            id="employeeShowPassword"
                            checked={showPassword}
                            onChange={() => setShowPassword((prev) => !prev)}
                        />
                        <label htmlFor="employeeShowPassword">Show Password</label>
                    </div>
                    <button type="submit" className="employee_login_button">
                        <span>Login</span>
                        <svg width="34" height="34" viewBox="0 0 74 74" fill="none">
                            <circle cx="37" cy="37" r="35.5" stroke="white" strokeWidth="3"></circle>
                            <path d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z" fill="white"></path>
                        </svg>
                    </button>
                </form>
                <div className="employee_login_footer">
                    <p>Secure employee access</p>
                </div>
            </div>
        </div>
    )
}

export default Login;