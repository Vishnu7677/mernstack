import React, { useState } from 'react';
import TwgoldManagernavbar from './TwgoldManagernavbar';
import './TwgoldManager.css';

const TwgoldManagerDashboard = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="twgold_manager_cards_grid">
            <div className="twgold_manager_card">
              <h3>Total Active Loans</h3>
              <p>128</p>
            </div>
            <div className="twgold_manager_card">
              <h3>Total Gold (grams)</h3>
              <p>18,450</p>
            </div>
            <div className="twgold_manager_card">
              <h3>Today's Disbursement</h3>
              <p>₹ 12,40,000</p>
            </div>
            <div className="twgold_manager_card">
              <h3>Overdue Loans</h3>
              <p>9</p>
            </div>
          </div>
        );

      case 'newloan':
        return (
          <div className="twgold_manager_card">
            <div className="twgold_manager_header_row">
              <h3>New Loan Approval Queue</h3>
              <span className="twgold_manager_badge">3 Pending</span>
            </div>
            <table className="twgold_manager_table">
              <thead>
                <tr>
                  <th>Cust ID</th>
                  <th>Customer Name</th>
                  <th>Gold Weight</th>
                  <th>Req. Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CRN200311001</td>
                  <td>Amit Kumar</td>
                  <td>25.5g (22K)</td>
                  <td>₹ 1,10,000</td>
                  <td>
                    <button className="twgold_manager_action_btn approve">Review</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'loans':
        return (
          <div className="twgold_manager_card">
            <h3>Active Loan Ledger</h3>
            <table className="twgold_manager_table">
              <thead>
                <tr>
                  <th>Loan No</th>
                  <th>Customer</th>
                  <th>Principal</th>
                  <th>Next Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>GL25000142</td><td>Ramesh Verma</td><td>₹ 80,000</td><td>15 Jan 2026</td><td><span className="status_active">Active</span></td></tr>
                <tr><td>GL25000145</td><td>Sita Sharma</td><td>₹ 1,20,000</td><td>10 Dec 2025</td><td><span className="status_overdue">Overdue</span></td></tr>
              </tbody>
            </table>
          </div>
        );

      case 'inventory':
        return (
          <div className="twgold_manager_card">
            <h3>Strong Room Inventory</h3>
            <div className="twgold_manager_inventory_stats">
              <div className="inv_stat_item"><span>Total Packets:</span> <b>245</b></div>
              <div className="inv_stat_item"><span>Gross Weight:</span> <b>18.45 kg</b></div>
              <div className="inv_stat_item"><span>Last Audit:</span> <b>28 Dec 2025</b></div>
            </div>
            <button className="twgold_manager_button_secondary">Generate Audit Report</button>
          </div>
        );

      case 'repayment':
        return (
          <div className="twgold_manager_card">
            <h3>Record EMI / Foreclosure</h3>
            <div className="twgold_manager_form_row">
              <input type="text" className="twgold_manager_input" placeholder="Enter Loan Number (e.g. GL25...)" />
              <button className="twgold_manager_button">Fetch Details</button>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="twgold_manager_card">
            <h3>Customer Management</h3>
            <input type="text" className="twgold_manager_input" placeholder="Search by Name, Mobile or Aadhaar..." />
            <table className="twgold_manager_table">
              <thead>
                <tr><th>Name</th><th>Phone</th><th>KYC Status</th><th>History</th></tr>
              </thead>
              <tbody>
                <tr><td>Amit Kumar</td><td>9876543210</td><td>Verified</td><td><button className="twgold_manager_text_btn">View Loans</button></td></tr>
              </tbody>
            </table>
          </div>
        );

      case 'reports':
        return (
          <div className="twgold_manager_card">
            <h3>Operational Reports</h3>
            <div className="twgold_manager_button_group">
              <button className="twgold_manager_report_btn">Closing Stock Report</button>
              <button className="twgold_manager_report_btn">Daily Collection Report</button>
              <button className="twgold_manager_report_btn">NPA / Overdue List</button>
              <button className="twgold_manager_report_btn">Employee Performance</button>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="twgold_manager_card">
            <h3>Branch User Management</h3>
            <div className="twgold_manager_user_form">
              <input type="text" className="twgold_manager_input" placeholder="Employee ID" />
              <select className="twgold_manager_select">
                <option>Select Role</option>
                <option>Clerk</option>
                <option>Assistant Manager</option>
              </select>
              <button className="twgold_manager_button">Add User to Branch</button>
            </div>
          </div>
        );

      default:
        return <div>Module Not Found</div>;
    }
  };

  return (
    <div className="twgold_manager_container">
      <TwgoldManagernavbar activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="twgold_manager_content">
        <div className="twgold_manager_breadcrumb">
          Admin / {activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}
        </div>
        {renderModule()}
      </main>
    </div>
  );
};

export default TwgoldManagerDashboard;