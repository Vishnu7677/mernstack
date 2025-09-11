import React, { useState } from 'react';
import IndividualLogin from './IndividualLoginPage';
import SchoolLogin from './SchoolLoginPage';
import AuthSwitch from './AuthSwitch';
import './scholar-login.css';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('individual');

  return (
    <div className="scholar_login_container">
      <div className="scholar_login_header">
        <h2 className="scholar_login_title">
          Scholar Login Portal
        </h2>
      </div>

      <div className="scholar_login_card_container">
        <div className="scholar_login_card">
          <div className="scholar_login_tabs">
            <button
              className={`scholar_login_tab ${activeTab === 'individual' ? 'scholar_login_tab_active' : ''}`}
              onClick={() => setActiveTab('individual')}
            >
              Individual Login
            </button>
            <button
              className={`scholar_login_tab ${activeTab === 'school' ? 'scholar_login_tab_active' : ''}`}
              onClick={() => setActiveTab('school')}
            >
              School/College Login
            </button>
          </div>

          {activeTab === 'individual' ? <IndividualLogin /> : <SchoolLogin />}
          
          <AuthSwitch isLogin={true} userType={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;