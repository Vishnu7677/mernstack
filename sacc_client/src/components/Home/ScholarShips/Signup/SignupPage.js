import React, { useState } from 'react';
import SchoolSignup from './SchoolSignup';
import AuthSwitch from './AuthSwitch';
import IndividualSignup from './IndividualSignup';
import './scholar-signup.css';

const SignupPage = () => {
  const [activeTab, setActiveTab] = useState('individual');

  return (
    <div className="scholar_signup_container">
      <div className="scholar_signup_header">
        <h2 className="scholar_signup_title">
          Scholar Application
        </h2>
      </div>

      <div className="scholar_signup_card_container">
        <div className="scholar_signup_card">
          <div className="scholar_signup_tabs">
            <button
              className={`scholar_signup_tab ${activeTab === 'individual' ? 'scholar_signup_tab_active' : ''}`}
              onClick={() => setActiveTab('individual')}
            >
              Individual Signup
            </button>
            <button
              className={`scholar_signup_tab ${activeTab === 'school' ? 'scholar_signup_tab_active' : ''}`}
              onClick={() => setActiveTab('school')}
            >
              School/College Signup
            </button>
          </div>

          {activeTab === 'individual' ? <IndividualSignup /> : <SchoolSignup />}
          
          <AuthSwitch isLogin={false} />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;