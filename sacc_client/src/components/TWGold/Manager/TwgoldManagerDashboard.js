import React from 'react';
import { useTwgoldAuth } from '../TWGLogin/TwgoldAuthContext';

const TwgoldManagerDashboard = () => {
  const { user, twgold_logout } = useTwgoldAuth();

  return (
    <div className="twgold_dashboard">
      <div className="twgold_dashboard_header">
        <h1>Manager Dashboard</h1>
        <button onClick={twgold_logout} className="twgold_logout_button">
          Logout
        </button>
      </div>
      <div className="twgold_dashboard_content">
        <p>Welcome, {user?.name}! Manager access level.</p>
        <div className="twgold_dashboard_grid">
          <div className="twgold_dashboard_card">Team Management</div>
          <div className="twgold_dashboard_card">Performance Reports</div>
          <div className="twgold_dashboard_card">Approval Requests</div>
          <div className="twgold_dashboard_card">Schedule</div>
        </div>
      </div>
    </div>
  );
};

export default TwgoldManagerDashboard;