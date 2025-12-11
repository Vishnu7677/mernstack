import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTwgoldAuth } from '../TWGLogin/TwgoldAuthContext';
import { 
  Home, 
  Building2, 
  Users, 
  Gem, 
  FileText, 
  Settings, 
  Shield,
  Activity,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import goldlogo from '../../../images/TWGoldLoansLogo.png'
import './adminstyles.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, twgold_logout } = useTwgoldAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    twgold_logout();
    navigate('/twgl&articles/login');
  };

  const navItems = [
    { path: '/twgl&articles/admin/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/twgl&articles/admin/branches', icon: Building2, label: 'Branches' },
    { path: '/twgl&articles/admin/employees', icon: Users, label: 'Employees' },
    { path: '/twgl&articles/admin/gold-rates', icon: Gem, label: 'Gold Rates' },
    { path: '/twgl&articles/admin/loans', icon: FileText, label: 'Loans' },
    { path: '/twgl&articles/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/twgl&articles/admin/audit', icon: Activity, label: 'Audit Log' },
    { path: '/twgl&articles/admin/compliance', icon: Shield, label: 'Compliance' },
  ];

  return (
    <>
      <nav className="admin_gold_navbar">
        <div className="admin_gold_navbar_container">
          <div className="admin_gold_navbar_brand">
            <img 
              src={goldlogo} 
              alt="Admin Portal" 
              className="admin_gold_navbar_logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span>Welcome, {user?.name || 'Admin'}</span>
          </div>

          <div className="admin_gold_navbar_desktop">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`admin_gold_nav_item ${isActive ? 'admin_gold_nav_item_active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="admin_gold_navbar_user">
            
            <button onClick={handleLogout} className="admin_gold_logout_btn">
              <LogOut size={18} />
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="admin_gold_mobile_toggle"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="admin_gold_mobile_menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin_gold_mobile_nav_item ${isActive ? 'admin_gold_mobile_nav_item_active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Navbar;