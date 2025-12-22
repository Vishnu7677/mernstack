import React, { useState } from 'react';
import './Twgoldemployeeloan.css';
import TwgoldEmployeeNav from './TwgoldEmployeeNav';
import TodaySummary from './components/TodaySummary';
import LoanCreation from './components/LoanCreation';
import EMICollection from './components/EMICollection';
import KYCUpdate from './components/KYCUpdate';
import MyLoans from './components/MyLoans';

const Twgoldemployeeloan = () => {
  const [activeTab, setActiveTab] = useState('today-summary');
  
  // Define tab components mapping
  const tabComponents = {
    'today-summary': <TodaySummary />,
    'loan-creation': <LoanCreation />,
    'emi-collection': <EMICollection />,
    'kyc-update': <KYCUpdate />,
    'my-loans': <MyLoans />
  };
  
  // Navigation items (updated to match your gold loan sections)
  const navItems = [
    { id: 'today-summary', label: 'Today Summary', icon: '📊' },
    { id: 'loan-creation', label: 'Loan Creation', icon: '➕' },
    { id: 'emi-collection', label: 'EMI Collection', icon: '💰' },
    { id: 'kyc-update', label: 'KYC Update', icon: '📋' },
    { id: 'my-loans', label: 'My Loans', icon: '📋' },
  ];

  return (
    <>
      <TwgoldEmployeeNav />
      <div className="twgold_gold_loan_container">
        
        {/* Navigation */}
        <nav className="twgold_gold_loan_nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`twgold_gold_loan_tab-btn ${activeTab === item.id ? 'twgold_gold_loan_active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        
        {/* Main Content */}
        <div className="twgold_gold_loan_main-container">
          {tabComponents[activeTab]}
        </div>
      </div>
    </>
  );
};

export default Twgoldemployeeloan;