import React from 'react';
import LogoImg from '../../../images/TWGoldLoansLogo.png';

const TwgoldManagernavbar = ({ activeModule, setActiveModule }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'newloan', label: 'New Gold Loan' },
    { id: 'loans', label: 'Loan List' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'repayment', label: 'Repayments' },
    { id: 'customers', label: 'Customers' },
    { id: 'reports', label: 'Reports' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <nav className="twgold_manager_navbar">
      <div className="twgold_manager_nav_left">
        <img 
          src={LogoImg} 
          alt="TW Gold Logo" 
          className="twgold_manager_logo" 
        />
        <h1 className="twgold_manager_nav_title">Manager</h1>
      </div>
      
      <div className="twgold_manager_nav_links">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`twgold_manager_nav_btn ${activeModule === item.id ? 'active' : ''}`}
            onClick={() => setActiveModule(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button className="twgold_manager_nav_btn twgold_manager_logout">Logout</button>
      </div>
    </nav>
  );
};

export default TwgoldManagernavbar;