import React from 'react';
import { useTwgoldAuth } from '../TWGLogin/TwgoldAuthContext';
import LogoImg from '../../../images/TWGoldLoansLogo.png';
import '../Employee/TwgoldEmployeeNav.css'; // reuse same CSS

const TwgoldManagernavbar = ({ activeModule, setActiveModule }) => {
  const { user, twgold_logout } = useTwgoldAuth();

  const displayName = user?.name ? user.name.split(' ')[0] : 'Manager';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'newloan', label: 'NewLoan', icon: '💰' },
    { id: 'loans', label: 'Loans', icon: '📄' },
    { id: 'inventory', label: 'Inventory', icon: '🔒' },
    { id: 'repayment', label: 'Repayments', icon: '💳' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'users', label: 'Users', icon: '⚙️' }
  ];

  return (
    <nav className="twg_nav_wrapper">
      <div className="twg_nav_container">
        
        {/* Brand */}
        <div className="twg_nav_brand">
          <img src={LogoImg} alt="TWGold Logo" className="twg_nav_logo_img" />
        </div>

        {/* Menu */}
        <div className="twg_nav_menu">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`twg_nav_item ${
                activeModule === item.id ? 'is-active' : ''
              }`}
              type="button"
            >
              <span className="twg_nav_icon">{item.icon}</span>
              <span className="twg_nav_label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* User + Logout */}
        <div className="twg_nav_actions">
          <div className="twg_user_pill">
            <div className="twg_avatar">{displayName.charAt(0)}</div>
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

export default TwgoldManagernavbar;
