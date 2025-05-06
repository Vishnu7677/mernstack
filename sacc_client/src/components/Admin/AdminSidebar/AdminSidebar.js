import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './AdminSidebar.css';
import banklogo from '../../../images/banklogo.jpg';
import Cookies from "js-cookie";
import apiList from "../../../lib/apiList";
import axios from "axios";
import { FaSpinner } from 'react-icons/fa';

function AdminSidebar() {
  const [menuStates, setMenuStates] = useState({
    adminMenu: false,
    customerMenu: false,
    employeeMenu: false,
    loanMenu: false,
    moneyTransferMenu: false,
    requestMoney: false,
    blog: false,
    generalSettings: false,
  });
  const [adminDetails, setAdminDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = Cookies.get('admin_token');

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiList.GetAdminDetails, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAdminDetails(response.data.data.data || {});
      } catch (error) {
        console.error("Error fetching admin details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDetails();
  }, [token]);

  const handleLogout = (e) => {
    e.preventDefault();
    Cookies.remove('admin_token');
    navigate('/admin/login');
  };

  const toggleMenu = (menu) => {
    // Check if it's mobile view (screen width ≤ 768px)
    const isMobileView = window.innerWidth <= 768;
    
    // If mobile view, open the menu (don't toggle)
    if (isMobileView && !menuStates[menu]) {
      setMenuStates(prev => ({ ...prev, [menu]: true }));
    } else {
      // For desktop or if closing in mobile view, toggle normally
      setMenuStates(prev => ({ ...prev, [menu]: !prev[menu] }));
    }
  };



  if (loading) {
    return (
      <div className="admin-sidebar-loading">
        <div className="admin-sidebar-loading-content">
          <FaSpinner className="admin-sidebar-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
       {/* Mobile Topbar - Only showing admin profile */}
       <div className="admin-mobile-topbar">
        
        <div className="admin-mobile-topbar__profile">
        <img
            src={adminDetails.admin_photo || '/default-avatar.png'}
            alt="Admin Profile"
            className="admin-mobile-topbar__profile-img"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/default-avatar.png'
            }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`admin_sidebar ${mobileMenuOpen ? 'admin_sidebar--mobile-open' : ''}`}>
        {/* Brand Logo and Name */}
        <div className="admin_sidebar__brand">
          <Link to="/admin/dashboard" className="admin_sidebar__logo-link">
            <img src={banklogo} alt="Logo" className="admin_sidebar__logo" />
            <h3 className="admin_sidebar__title">SAC Bank</h3>
          </Link>
        </div>
        
        {/* Admin Profile Info */}
        <div className="admin_sidebar__profile-info">
          <img
            src={adminDetails.admin_photo || '/default-avatar.png'}
            alt="Admin Profile"
            className="admin_sidebar__profile-img"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/default-avatar.png'
            }}
          />
          <div className="admin_sidebar__profile-details">
            <h4>{adminDetails.admin_name || 'Admin'}</h4>
            <p>Administrator</p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="admin_sidebar__nav">
          <ul className="admin_sidebar__menu">
            <li className="admin_sidebar__item">
              <Link 
                to="/admin/dashboard" 
                className="admin_sidebar__link" 
                title="Dashboard"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="fas fa-fw fa-tachometer-alt admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">Dashboard</span>
              </Link>
            </li>

            {/* Admin Profile Section */}
            <li className="admin_sidebar__item admin_sidebar__item--has-submenu">
              <button 
                onClick={() => toggleMenu('adminMenu')}
                className={`admin_sidebar__link ${menuStates.adminMenu ? 'admin_sidebar__link--active' : ''}`}
                title="Admin Profile"
              >
                <i className="fas fa-user-shield admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">Admin</span>
                <i className={`fas fa-chevron-${menuStates.adminMenu ? 'up' : 'down'} admin_sidebar__chevron`}></i>
              </button>
              <div className={`admin_sidebar__submenu ${menuStates.adminMenu ? 'admin_sidebar__submenu--open' : ''}`}>
                <Link 
                  to="/admin/profile" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-user admin_sidebar__submenu-icon"></i>
                  Profile
                </Link>
                <Link 
                  to="/admin/password" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-key admin_sidebar__submenu-icon"></i>
                  Change Password
                </Link>
                <a 
                  href="/" 
                  className="admin_sidebar__submenu-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-globe admin_sidebar__submenu-icon"></i>
                  Visit Website
                </a>
              </div>
            </li>


            {/* Manage Customers */}
            <li className="admin_sidebar__item admin_sidebar__item--has-submenu">
              <button 
                onClick={() => toggleMenu('customerMenu')}
                className={`admin_sidebar__link ${menuStates.customerMenu ? 'admin_sidebar__link--active' : ''}`}
                title="Manage Customers"
              >
                <i className="fa-solid fa-circle-user admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">Manage Customers</span>
                <i className={`fas fa-chevron-${menuStates.customerMenu ? 'up' : 'down'} admin_sidebar__chevron`}></i>
              </button>
              <div className={`admin_sidebar__submenu ${menuStates.customerMenu ? 'admin_sidebar__submenu--open' : ''}`}>
                <Link 
                  to='/admin/userlist' 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  User List
                </Link>
                <Link 
                  to="/admin/membershiprequest" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Membership Request
                </Link>
                <Link 
                  to="/admin/users/kyc" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  User KYC Info
                </Link>
                <Link 
                  to="/admin/withdraw-request" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Withdraw Request
                </Link>
              </div>
            </li>

            {/* Manage Employees */}
            <li className="admin_sidebar__item admin_sidebar__item--has-submenu">
              <button 
                onClick={() => toggleMenu('employeeMenu')}
                className={`admin_sidebar__link ${menuStates.employeeMenu ? 'admin_sidebar__link--active' : ''}`}
                title="Manage Employees"
              >
                <i className="fas fa-user admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">Manage Employees</span>
                <i className={`fas fa-chevron-${menuStates.employeeMenu ? 'up' : 'down'} admin_sidebar__chevron`}></i>
              </button>
              <div className={`admin_sidebar__submenu ${menuStates.employeeMenu ? 'admin_sidebar__submenu--open' : ''}`}>
                <Link 
                  to="/admin/createemployee" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Employee
                </Link>
                <Link 
                  to="/admin/employees" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Employees
                </Link>
              </div>
            </li>

            {/* Loan Management */}
            <li className="admin_sidebar__item admin_sidebar__item--has-submenu">
              <button 
                onClick={() => toggleMenu('loanMenu')}
                className={`admin_sidebar__link ${menuStates.loanMenu ? 'admin_sidebar__link--active' : ''}`}
                title="Loan Management"
              >
                <i className="fas fa-cash-register admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">Loan Management</span>
                <i className={`fas fa-chevron-${menuStates.loanMenu ? 'up' : 'down'} admin_sidebar__chevron`}></i>
              </button>
              <div className={`admin_sidebar__submenu ${menuStates.loanMenu ? 'admin_sidebar__submenu--open' : ''}`}>
                <Link 
                  to="/admin/loanplans" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Loan Plans
                </Link>
                <Link 
                  to="/admin/all-loans" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Loans
                </Link>
                <Link 
                  to="/admin/pending-loan" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pending Loan
                </Link>
              </div>
            </li>

            {/* Money Transfer */}
            <li className="admin_sidebar__item admin_sidebar__item--has-submenu">
              <button 
                onClick={() => toggleMenu('moneyTransferMenu')}
                className={`admin_sidebar__link ${menuStates.moneyTransferMenu ? 'admin_sidebar__link--active' : ''}`}
                title="Money Transfer"
              >
                <i className="fas fa-exchange-alt admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">Money Transfer</span>
                <i className={`fas fa-chevron-${menuStates.moneyTransferMenu ? 'up' : 'down'} admin_sidebar__chevron`}></i>
              </button>
              <div className={`admin_sidebar__submenu ${menuStates.moneyTransferMenu ? 'admin_sidebar__submenu--open' : ''}`}>
                <Link 
                  to="/admin/own-banks/transfer" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Own Bank Transfer
                </Link>
                <Link 
                  to="/admin/other-banks/transfer" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Other Bank Transfer
                </Link>
              </div>
            </li>

            {/* Request Money */}
            <li className="admin_sidebar__item admin_sidebar__item--has-submenu">
              <button 
                onClick={() => toggleMenu('requestMoney')}
                className={`admin_sidebar__link ${menuStates.requestMoney ? 'admin_sidebar__link--active' : ''}`}
                title="Request Money"
              >
                <i className="fas fa-donate admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">Request Money</span>
                <i className={`fas fa-chevron-${menuStates.requestMoney ? 'up' : 'down'} admin_sidebar__chevron`}></i>
              </button>
              <div className={`admin_sidebar__submenu ${menuStates.requestMoney ? 'admin_sidebar__submenu--open' : ''}`}>
                <Link 
                  to="/admin/request-money" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Money Request
                </Link>
              </div>
            </li>

            {/* Transactions */}
            <li className="admin_sidebar__item">
              <Link
                to="/admin/transactions"
                className="admin_sidebar__link"
                title="Transactions"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="fas fa-chart-line admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">Transactions</span>
              </Link>
            </li>

            {/* Deposits */}
            <li className="admin_sidebar__item">
              <Link
                to="/admin/deposits"
                className="admin_sidebar__link"
                title="Deposits"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="fas fa-piggy-bank admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">Deposits</span>
              </Link>
            </li>

            {/* Manage Blog */}
            <li className="admin_sidebar__item admin_sidebar__item--has-submenu">
              <button 
                onClick={() => toggleMenu('blog')}
                className={`admin_sidebar__link ${menuStates.blog ? 'admin_sidebar__link--active' : ''}`}
                title="Manage Blog"
              >
                <i className="fas fa-fw fa-newspaper admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">Manage Blog</span>
                <i className={`fas fa-chevron-${menuStates.blog ? 'up' : 'down'} admin_sidebar__chevron`}></i>
              </button>
              <div className={`admin_sidebar__submenu ${menuStates.blog ? 'admin_sidebar__submenu--open' : ''}`}>
                <Link 
                  to="/admin/blog/category" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link 
                  to="/admin/blog" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Posts
                </Link>
              </div>
            </li>

            {/* General Settings */}
            <li className="admin_sidebar__item admin_sidebar__item--has-submenu">
              <button 
                onClick={() => toggleMenu('generalSettings')}
                className={`admin_sidebar__link ${menuStates.generalSettings ? 'admin_sidebar__link--active' : ''}`}
                title="General Settings"
              >
                <i className="fas fa-fw fa-cogs admin_sidebar__icon"></i>
                <span className="admin_sidebar__text">General Settings</span>
                <i className={`fas fa-chevron-${menuStates.generalSettings ? 'up' : 'down'} admin_sidebar__chevron`}></i>
              </button>
              <div className={`admin_sidebar__submenu ${menuStates.generalSettings ? 'admin_sidebar__submenu--open' : ''}`}>
                <Link 
                  to="/admin/general-settings/logo" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Logo
                </Link>
                <Link 
                  to="/admin/general-settings/website-contents" 
                  className="admin_sidebar__submenu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Website Contents
                </Link>
              </div>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="admin_sidebar__footer">
          <button 
            onClick={(e) => {
              handleLogout(e);
              setMobileMenuOpen(false);
            }} 
            className="admin_sidebar__logout-btn"
          >
            <i className="fas fa-sign-out-alt admin_sidebar__icon"></i>
            <span className="admin_sidebar__text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="admin-sidebar-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

export default AdminSidebar;