import React, { useEffect, useState } from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import '../AdminSidebar/AdminSidebar.css';
import './AdminDashboard.css';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1024);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
 
  const toggleSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileView && 
          isMobileSidebarOpen && 
          !event.target.closest('.admin_sidebar') && 
          !event.target.closest('.admin_breadcrumb__toggle')) {
        setIsMobileSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileView, isMobileSidebarOpen]);

  return (
    <div className="admin_layout">
      {isMobileView && isMobileSidebarOpen && (
        <div 
          className="admin_sidebar-overlay admin_sidebar-overlay--visible" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className={`admin_content ${isMobileSidebarOpen ? 'admin_content--mobile-expanded' : ''}`}>
        <div className="admin_header">
          {isMobileView && (
            <button 
              className="admin_breadcrumb__toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <i className="fas fa-bars"></i>
            </button>
          )}
          <h1 className="admin_title">Dashboard</h1>
          <nav className="admin_breadcrumb" aria-label="Breadcrumb">
            <ol className="admin_breadcrumb__list">
              <li className="admin_breadcrumb__item">
                <Link to="/admin/dashboard" className="admin_breadcrumb__link">Home</Link>
              </li>
              <li className="admin_breadcrumb__item">
                <span className="admin_breadcrumb__current" aria-current="page">Dashboard</span>
              </li>
            </ol>
          </nav>
        </div>
        
        <main className="admin_main">
          <div className="admin_stats">
            {/* Active Customers */}
            <div className="admin_stats__card admin_stats__card--primary">
              <div className="admin_stats__content">
                <h3 className="admin_stats__label">Active Customers</h3>
                <p className="admin_stats__value">634</p>
              </div>
              <div className="admin_stats__icon">
                <i className="fas fa-user"></i>
              </div>
            </div>
            
            {/* Blocked Customers */}
            <div className="admin_stats__card admin_stats__card--danger">
              <div className="admin_stats__content">
                <h3 className="admin_stats__label">Blocked Customers</h3>
                <p className="admin_stats__value">0</p>
              </div>
              <div className="admin_stats__icon">
                <i className="fas fa-user-slash"></i>
              </div>
            </div>
            
            {/* Total Blogs */}
            <div className="admin_stats__card admin_stats__card--success">
              <div className="admin_stats__content">
                <h3 className="admin_stats__label">Total Blogs</h3>
                <p className="admin_stats__value">3</p>
              </div>
              <div className="admin_stats__icon">
                <i className="fas fa-newspaper"></i>
              </div>
            </div>
            
            {/* Total Deposit Amount */}
            <div className="admin_stats__card admin_stats__card--info">
              <div className="admin_stats__content">
                <h3 className="admin_stats__label">Total Deposit Amount</h3>
                <p className="admin_stats__value">2.6111111111111E+85 INR</p>
              </div>
              <div className="admin_stats__icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
            </div>
            
            {/* Total Withdraw Amount */}
            <div className="admin_stats__card admin_stats__card--warning">
              <div className="admin_stats__content">
                <h3 className="admin_stats__label">Total Withdraw Amount</h3>
                <p className="admin_stats__value">5472460346107.5 INR</p>
              </div>
              <div className="admin_stats__icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;