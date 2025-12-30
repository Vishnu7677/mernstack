import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTwgoldAuth } from '../../TWGLogin/TwgoldAuthContext';
import LogoImg from '../../../../images/TWGoldLoansLogo.png';
import '../../Employee/TwgoldEmployeeNav.css'; // reuse same CSS

const TwgoldManagerNav = () => {
  const { user, twgold_logout } = useTwgoldAuth();
  const location = useLocation();

  const displayName = user?.name ? user.name.split(' ')[0] : 'Manager';

  const navItems = [
    { path: '/twgl&articles/manager/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/twgl&articles/manager/new-loan', label: 'New Loan', icon: '💰' },
    { path: '/twgl&articles/manager/loans', label: 'Loans', icon: '📄' },
    { path: '/twgl&articles/manager/inventory', label: 'Inventory', icon: '🔒' },
    { path: '/twgl&articles/manager/repayments', label: 'Repayments', icon: '💳' },
    { path: '/twgl&articles/manager/customers', label: 'Customers', icon: '👥' },
    { path: '/twgl&articles/manager/reports', label: 'Reports', icon: '📈' },
    { path: '/twgl&articles/manager/users', label: 'Users', icon: '⚙️' }
  ];

  return (
    <nav className="twg_nav_wrapper">
      <div className="twg_nav_container">

        {/* Brand */}
        <div className="twg_nav_brand">
          <img
            src={LogoImg}
            alt="TWGold Logo"
            className="twg_nav_logo_img"
          />
        </div>

        {/* Navigation */}
        <div className="twg_nav_menu">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`twg_nav_item ${
                location.pathname.startsWith(item.path)
                  ? 'is-active'
                  : ''
              }`}
            >
              <span className="twg_nav_icon">{item.icon}</span>
              <span className="twg_nav_label">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User + Logout */}
        <div className="twg_nav_actions">
          <div className="twg_user_pill">
            <div className="twg_avatar">
              {displayName.charAt(0)}
            </div>
            <div className="twg_user_meta">
              <span className="twg_user_name">{displayName}</span>
              <span className="twg_user_role">Manager</span>
            </div>
          </div>

          <button
            onClick={twgold_logout}
            className="twg_logout_btn"
            title="Logout"
          >
            <span className="twg_logout_icon">➔</span>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default TwgoldManagerNav;
