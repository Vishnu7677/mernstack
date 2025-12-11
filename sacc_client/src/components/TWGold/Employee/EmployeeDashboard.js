import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTwgoldAuth } from '../TWGLogin/TwgoldAuthContext';
import AppraisalModal from './AppraisalModal';
import './employee_dashboard.css';
import { Link } from "react-router-dom";


const TwgoldEmployeeDashboard = () => {
  const { user, twgold_logout } = useTwgoldAuth();
  const [query, setQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showAppraisal, setShowAppraisal] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await axios.get('/api/loans');
      setLoans(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoading(false);
    }
  };

  const searchLoans = async (searchQuery) => {
    try {
      const response = await axios.get(`/api/loans/search?query=${searchQuery}`);
      setLoans(response.data);
    } catch (error) {
      console.error('Error searching loans:', error);
    }
  };

  const openLoan = (loan) => {
    setSelectedLoan(loan);
  };

  const openAppraisal = (loan) => {
    setSelectedLoan(loan);
    setShowAppraisal(true);
  };

  const saveAppraisal = async (changes) => {
    try {
      await axios.put(`/api/loans/${selectedLoan._id}`, changes);
      await fetchLoans(); // Refresh the list
      setShowAppraisal(false);
    } catch (error) {
      console.error('Error saving appraisal:', error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      searchLoans(value);
    } else {
      fetchLoans();
    }
  };

  const filteredLoans = loans.filter(loan =>
    loan.customerName?.toLowerCase().includes(query.toLowerCase()) ||
    loan.loanId?.toLowerCase().includes(query.toLowerCase()) ||
    loan.mobile?.includes(query)
  );

  if (loading) {
    return (
      <div className="twgold_dashboard">
        <div className="employee_dashboard_loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="twgold_dashboard">
      {/* Simple Header for TWGold */}
      <div className="twgold_dashboard_header">
        <h1>Employee Dashboard - Gold Loan Management</h1>
        <div className="twgold_user_info">
          <span>Welcome, {user?.name}!</span>
          <button onClick={twgold_logout} className="twgold_logout_button">
            Logout
          </button>
        </div>
      </div>

      {/* Detailed Employee Dashboard */}
      <div className="employee_dashboard_container">
        {/* Sidebar */}
        <aside className="employee_dashboard_sidebar">
          <div className="employee_dashboard_sidebar_header">
            <div className="employee_dashboard_company_name">SACC Finance</div>
            <div className="employee_dashboard_portal_name">Employee Portal</div>
          </div>
          <nav className="employee_dashboard_nav">
            <Link to="/employee/dashboard" className="employee_dashboard_nav_item employee_dashboard_nav_active">
  Dashboard
</Link>

<Link to="/employee/loan-queue" className="employee_dashboard_nav_item">
  Loan Queue
</Link>

<Link to="/employee/valuation" className="employee_dashboard_nav_item">
  Valuation
</Link>

<Link to="/employee/disbursal" className="employee_dashboard_nav_item">
  Disbursal
</Link>

<Link to="/employee/vault" className="employee_dashboard_nav_item">
  Vault
</Link>

<Link to="/employee/reports" className="employee_dashboard_nav_item">
  Reports
</Link>

<Link to="/employee/settings" className="employee_dashboard_nav_item">
  Settings
</Link>

          </nav>
          
          {/* TWGold User Info in Sidebar */}
          <div className="employee_dashboard_user_section">
            <div className="employee_dashboard_user_display">
              <div className="employee_dashboard_user_initial">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="employee_dashboard_user_details">
                <div className="employee_dashboard_user_role">{user?.role?.toUpperCase()}</div>
                <div className="employee_dashboard_user_name">{user?.name}</div>
                <div className="employee_dashboard_user_email">{user?.email}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="employee_dashboard_main">
          {/* Topbar */}
          <header className="employee_dashboard_header">
            <div className="employee_dashboard_header_left">
              <h1 className="employee_dashboard_title">Loan Queue</h1>
              <div className="employee_dashboard_subtitle">Manage incoming gold-loan applications</div>
            </div>

            <div className="employee_dashboard_header_right">
              <div className="employee_dashboard_search_container">
                <input
                  value={query}
                  onChange={handleSearch}
                  className="employee_dashboard_search_input"
                  placeholder="Search by customer, loan ID or mobile"
                />
              </div>
              <button className="employee_dashboard_primary_btn">New Loan</button>
              <div className="employee_dashboard_user_profile">
                <div className="employee_dashboard_user_info">
                  <div className="employee_dashboard_user_role">You</div>
                  <div className="employee_dashboard_user_name">{user?.name || 'Employee'}</div>
                </div>
                <div className="employee_dashboard_user_avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <div className="employee_dashboard_content">
            {/* Loan queue table */}
            <section className="employee_dashboard_loan_section">
              <div className="employee_dashboard_section_header">
                <h2 className="employee_dashboard_section_title">Pending Applications</h2>
                <div className="employee_dashboard_result_count">{filteredLoans.length} results</div>
              </div>

              <div className="employee_dashboard_table_container">
                <table className="employee_dashboard_table">
                  <thead>
                    <tr className="employee_dashboard_table_header">
                      <th>Loan ID</th>
                      <th>Customer</th>
                      <th>Valuation</th>
                      <th>Requested</th>
                      <th>LTV</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLoans.length > 0 ? (
                      filteredLoans.map((loan) => (
                        <tr key={loan._id} className="employee_dashboard_table_row">
                          <td className="employee_dashboard_loan_id">{loan.loanId}</td>
                          <td className="employee_dashboard_customer_cell">
                            <div className="employee_dashboard_customer_name">{loan.customerName}</div>
                            <div className="employee_dashboard_customer_mobile">{loan.mobile}</div>
                          </td>
                          <td className="employee_dashboard_valuation">₹{loan.valuation?.toLocaleString()}</td>
                          <td className="employee_dashboard_requested">₹{loan.requested?.toLocaleString()}</td>
                          <td className="employee_dashboard_ltv">{loan.ltv}%</td>
                          <td className="employee_dashboard_status_cell">
                            <span className={`employee_dashboard_status employee_dashboard_status_${loan.status?.toLowerCase()}`}>
                              {loan.status}
                            </span>
                          </td>
                          <td className="employee_dashboard_actions_cell">
                            <div className="employee_dashboard_action_buttons">
                              <button
                                onClick={() => openLoan(loan)}
                                className="employee_dashboard_secondary_btn"
                              >
                                View
                              </button>
                              <button
                                onClick={() => openAppraisal(loan)}
                                className="employee_dashboard_appraise_btn"
                              >
                                Appraise
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="employee_dashboard_no_data">
                          No loans found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Customer 360 panel */}
            <aside className="employee_dashboard_customer_panel">
              <div className="employee_dashboard_customer_header">
                <div className="employee_dashboard_customer_avatar">
                  {selectedLoan?.customerName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <div className="employee_dashboard_customer_panel_name">
                    {selectedLoan ? selectedLoan.customerName : "Select a customer"}
                  </div>
                  <div className="employee_dashboard_customer_panel_mobile">
                    {selectedLoan ? selectedLoan.mobile : "No customer selected"}
                  </div>
                </div>
              </div>

              {selectedLoan ? (
                <div className="employee_dashboard_customer_details">
                  <div className="employee_dashboard_detail_item">
                    <div className="employee_dashboard_detail_label">Loan ID</div>
                    <div className="employee_dashboard_detail_value">{selectedLoan.loanId}</div>
                  </div>
                  <div className="employee_dashboard_detail_item">
                    <div className="employee_dashboard_detail_label">Valuation</div>
                    <div className="employee_dashboard_detail_value">₹{selectedLoan.valuation?.toLocaleString()}</div>
                  </div>
                  <div className="employee_dashboard_detail_item">
                    <div className="employee_dashboard_detail_label">Pledge Weight</div>
                    <div className="employee_dashboard_detail_value">{selectedLoan.weight} g</div>
                  </div>
                  <div className="employee_dashboard_detail_item">
                    <div className="employee_dashboard_detail_label">Purity</div>
                    <div className="employee_dashboard_detail_value">{selectedLoan.purity}</div>
                  </div>

                  <div className="employee_dashboard_panel_actions">
                    <button
                      onClick={() => openAppraisal(selectedLoan)}
                      className="employee_dashboard_appraisal_btn"
                    >
                      Start Appraisal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="employee_dashboard_no_selection">
                  Select a loan from the queue to see customer details and actions.
                </div>
              )}
            </aside>
          </div>

          {/* Appraisal modal */}
          {showAppraisal && selectedLoan && (
            <AppraisalModal
              loan={selectedLoan}
              onSave={saveAppraisal}
              onClose={() => setShowAppraisal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TwgoldEmployeeDashboard;