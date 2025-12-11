import React from 'react';
import { useTwgoldAuth } from '../TWGLogin/TwgoldAuthContext';

const TwgoldGrivirenceDashboard = () => {
  const { user, twgold_logout } = useTwgoldAuth();

  return (
    <div className="twgold_dashboard">
      <div className="twgold_dashboard_header">
        <h1>Grievance Dashboard</h1>
        <button onClick={twgold_logout} className="twgold_logout_button">
          Logout
        </button>
      </div>
      <div className="twgold_dashboard_content">
        <p>Welcome, {user?.name}! Grievance officer access.</p>
        <div className="twgold_dashboard_grid">
          <div className="twgold_dashboard_card">Case Management</div>
          <div className="twgold_dashboard_card">Resolution Tracking</div>
          <div className="twgold_dashboard_card">Complaint Analysis</div>
          <div className="twgold_dashboard_card">Reports</div>
        </div>
      </div>
    </div>
  );
};

export default TwgoldGrivirenceDashboard;