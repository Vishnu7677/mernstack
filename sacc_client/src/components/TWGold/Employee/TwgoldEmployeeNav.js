import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTwgoldAuth } from '../TWGLogin/TwgoldAuthContext';
import './TwgoldEmployeeNav.css';
import LogoImg from '../../../images/TWGoldLoansLogo.png';

const TwgoldEmployeeNav = () => {
  const { user, twgold_logout } = useTwgoldAuth();
  const location = useLocation();

  // Logic to shorten name to the first space
  const displayName = user?.name ? user.name.split(' ')[0] : 'User';

  // Updated navigation items for Gold Loan Clerk Panel
  const navItems = [
    { path: '/twgl&articles/employee/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/twgl&articles/employee/goldloan', label: 'Gold Loan', icon: '💰' },
    { path: '/twgl&articles/employee/valuation', label: 'Valuation', icon: '⚖️' },
    { path: '/twgl&articles/employee/vault', label: 'Vault', icon: '🔒' },
    { path: '/twgl&articles/employee/reports', label: 'Reports', icon: '📈' },
    { path: '/twgl&articles/employee/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="twg_nav_wrapper">
      <div className="twg_nav_container">
        {/* Brand Section */}
        <div className="twg_nav_brand">
          <img src={LogoImg} alt="TWGold Logo" className="twg_nav_logo_img" />
        </div>

        {/* Navigation Links */}
        <div className="twg_nav_menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`twg_nav_item ${
                location.pathname === item.path ? 'is-active' : ''
              }`}
            >
              <span className="twg_nav_icon">{item.icon}</span>
              <span className="twg_nav_label">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Utilities */}
        <div className="twg_nav_actions">
          <div className="twg_user_pill">
            <div className="twg_avatar">{displayName.charAt(0)}</div>
            <div className="twg_user_meta">
              <span className="twg_user_name">{displayName}</span>
              <span className="twg_user_role">{user?.role || 'Clerk'}</span>
            </div>
          </div>
          
          <button onClick={twgold_logout} className="twg_logout_btn" title="Logout">
            <span className="twg_logout_icon">➔</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TwgoldEmployeeNav;