import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import './AdminLogin.css';
import apiList from '../../../lib/apiList';
import Cookies from 'js-cookie';
import showToast from '../../Toast';
import { ToastContainer } from 'react-toastify';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const onSubmitForm = async (e) => {
        e.preventDefault();
        const url = apiList.AdminLogin;
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminEmail, adminPassword }),
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();

            if (response.ok) {
                const { token, expiresIn, tokenType } = data.data;
                Cookies.set('admin_token', token, { expires: expiresIn / (60 * 60 * 24) });
                Cookies.set('token_type', tokenType, { expires: expiresIn / (60 * 60 * 24) });
                showToast('success', 'Login Successful!');
                setTimeout(() => navigate('/admin/dashboard'), 1500);
            } else {
                showToast('error', data.message || 'Login Failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            showToast('error', 'An unexpected error occurred. Please try again.');
        }
        setAdminEmail("");
        setAdminPassword("");
    };

    return (
        <div className="admin_login_container">
            <ToastContainer />
            <div className="admin_login_card">
                <div className="admin_login_header">
                    <h2>Admin Portal</h2>
                    <p>Access your admin dashboard</p>
                </div>
                <form onSubmit={onSubmitForm} className="admin_login_form">
                    <div className="admin_login_input_group">
                        <input
                            type="email"
                            placeholder=" "
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            className="admin_login_input"
                        />
                        <label className="admin_login_label">Email</label>
                        <span className="admin_login_highlight"></span>
                    </div>
                    <div className="admin_login_input_group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder=" "
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="admin_login_input"
                        />
                        <label className="admin_login_label">Password</label>
                        <span className="admin_login_highlight"></span>
                    </div>
                    <div className="admin_login_show_password">
                        <input
                            type="checkbox"
                            id="adminShowPassword"
                            checked={showPassword}
                            onChange={() => setShowPassword((prev) => !prev)}
                        />
                        <label htmlFor="adminShowPassword">Show Password</label>
                    </div>
                    <button type="submit" className="admin_login_button">
                        <span>Login</span>
                        <svg width="34" height="34" viewBox="0 0 74 74" fill="none">
                            <circle cx="37" cy="37" r="35.5" stroke="white" strokeWidth="3"></circle>
                            <path d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z" fill="white"></path>
                        </svg>
                    </button>
                </form>
                <div className="admin_login_footer">
                    <p>Secure access to admin controls</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;