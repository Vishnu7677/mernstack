import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppraisalModal from './AppraisalModal';
import TwgoldEmployeeNav from './TwgoldEmployeeNav';
import './employee_dashboard.css';

const TwgoldEmployeeDashboard = () => {
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
      <div className="twgold_employee_dash_loading">
        <div className="twgold_employee_dash_loading_spinner"></div>
        <div className="twgold_employee_dash_loading_text">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="twgold_employee_dash">
      {/* Navigation */}
      <TwgoldEmployeeNav />

      {/* Main Dashboard Content */}
      <main className="twgold_employee_dash_main">
        {/* Dashboard Header */}
        <header className="twgold_employee_dash_header">
          <div className="twgold_employee_dash_header_left">
            <h1 className="twgold_employee_dash_title">Loan Queue Management</h1>
            <p className="twgold_employee_dash_subtitle">
              Review and process incoming gold loan applications
            </p>
          </div>
          
          <div className="twgold_employee_dash_header_actions">
            <div className="twgold_employee_dash_search">
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Search loans by customer, ID, or mobile..."
                className="twgold_employee_dash_search_input"
              />
              <span className="twgold_employee_dash_search_icon">🔍</span>
            </div>
            
            <div className="twgold_employee_dash_stats">
              <div className="twgold_employee_dash_stat">
                <span className="twgold_employee_dash_stat_label">Total</span>
                <span className="twgold_employee_dash_stat_value">{loans.length}</span>
              </div>
              <div className="twgold_employee_dash_stat">
                <span className="twgold_employee_dash_stat_label">Pending</span>
                <span className="twgold_employee_dash_stat_value">
                  {loans.filter(l => l.status === 'Pending').length}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="twgold_employee_dash_content">
          {/* Loans Table Section */}
          <section className="twgold_employee_dash_section">
            <div className="twgold_employee_dash_section_header">
              <h2 className="twgold_employee_dash_section_title">
                Pending Applications ({filteredLoans.length})
              </h2>
              <button className="twgold_employee_dash_refresh_btn" onClick={fetchLoans}>
                🔄 Refresh
              </button>
            </div>

            <div className="twgold_employee_dash_table_container">
              <table className="twgold_employee_dash_table">
                <thead>
                  <tr>
                    <th className="twgold_employee_dash_table_header">Loan ID</th>
                    <th className="twgold_employee_dash_table_header">Customer Details</th>
                    <th className="twgold_employee_dash_table_header">Requested Amount</th>
                    <th className="twgold_employee_dash_table_header">Gold Details</th>
                    <th className="twgold_employee_dash_table_header">Status</th>
                    <th className="twgold_employee_dash_table_header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                      <tr key={loan._id} className="twgold_employee_dash_table_row">
                        <td className="twgold_employee_dash_table_cell">
                          <div className="twgold_employee_dash_loan_id">{loan.loanId}</div>
                          <div className="twgold_employee_dash_loan_date">
                            {new Date(loan.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="twgold_employee_dash_table_cell">
                          <div className="twgold_employee_dash_customer_info">
                            <div className="twgold_employee_dash_customer_name">
                              {loan.customerName}
                            </div>
                            <div className="twgold_employee_dash_customer_mobile">
                              📱 {loan.mobile}
                            </div>
                            <div className="twgold_employee_dash_customer_aadhar">
                              🪪 {loan.aadharNumber || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="twgold_employee_dash_table_cell">
                          <div className="twgold_employee_dash_amount">
                            ₹{loan.requestedAmount?.toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td className="twgold_employee_dash_table_cell">
                          <div className="twgold_employee_dash_gold_info">
                            <div className="twgold_employee_dash_gold_weight">
                              ⚖️ {loan.weight} g
                            </div>
                            <div className="twgold_employee_dash_gold_purity">
                              🏅 {loan.purity}
                            </div>
                          </div>
                        </td>
                        <td className="twgold_employee_dash_table_cell">
                          <span className={`twgold_employee_dash_status twgold_employee_dash_status_${loan.status?.toLowerCase()}`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="twgold_employee_dash_table_cell">
                          <div className="twgold_employee_dash_actions">
                            <button
                              onClick={() => openLoan(loan)}
                              className="twgold_employee_dash_action_btn twgold_employee_dash_view_btn"
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => openAppraisal(loan)}
                              className="twgold_employee_dash_action_btn twgold_employee_dash_appraise_btn"
                              disabled={loan.status === 'Appraised'}
                            >
                              ⚖️ {loan.status === 'Appraised' ? 'Appraised' : 'Appraise'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="twgold_employee_dash_empty_row">
                      <td colSpan="6" className="twgold_employee_dash_empty_cell">
                        <div className="twgold_employee_dash_empty_state">
                          <div className="twgold_employee_dash_empty_icon">📋</div>
                          <div className="twgold_employee_dash_empty_text">
                            No loans found. Try adjusting your search.
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Customer Details Panel */}
          <aside className="twgold_employee_dash_sidebar">
            <div className="twgold_employee_dash_sidebar_header">
              <h3 className="twgold_employee_dash_sidebar_title">
                {selectedLoan ? 'Customer Details' : 'Select a Loan'}
              </h3>
            </div>

            {selectedLoan ? (
              <div className="twgold_employee_dash_customer_details">
                <div className="twgold_employee_dash_customer_summary">
                  <div className="twgold_employee_dash_customer_avatar">
                    {selectedLoan.customerName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="twgold_employee_dash_customer_info_panel">
                    <h4 className="twgold_employee_dash_customer_name_panel">
                      {selectedLoan.customerName}
                    </h4>
                    <div className="twgold_employee_dash_customer_contact">
                      <div>📱 {selectedLoan.mobile}</div>
                      <div>📧 {selectedLoan.email || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="twgold_employee_dash_loan_details">
                  <div className="twgold_employee_dash_detail_card">
                    <div className="twgold_employee_dash_detail_label">Loan Information</div>
                    <div className="twgold_employee_dash_detail_grid">
                      <div className="twgold_employee_dash_detail_item">
                        <span className="twgold_employee_dash_detail_key">Loan ID:</span>
                        <span className="twgold_employee_dash_detail_value">{selectedLoan.loanId}</span>
                      </div>
                      <div className="twgold_employee_dash_detail_item">
                        <span className="twgold_employee_dash_detail_key">Requested:</span>
                        <span className="twgold_employee_dash_detail_value">
                          ₹{selectedLoan.requestedAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="twgold_employee_dash_detail_item">
                        <span className="twgold_employee_dash_detail_key">Status:</span>
                        <span className={`twgold_employee_dash_detail_status twgold_employee_dash_status_${selectedLoan.status?.toLowerCase()}`}>
                          {selectedLoan.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="twgold_employee_dash_detail_card">
                    <div className="twgold_employee_dash_detail_label">Gold Details</div>
                    <div className="twgold_employee_dash_detail_grid">
                      <div className="twgold_employee_dash_detail_item">
                        <span className="twgold_employee_dash_detail_key">Weight:</span>
                        <span className="twgold_employee_dash_detail_value">
                          {selectedLoan.weight} g
                        </span>
                      </div>
                      <div className="twgold_employee_dash_detail_item">
                        <span className="twgold_employee_dash_detail_key">Purity:</span>
                        <span className="twgold_employee_dash_detail_value">
                          {selectedLoan.purity}
                        </span>
                      </div>
                      <div className="twgold_employee_dash_detail_item">
                        <span className="twgold_employee_dash_detail_key">Type:</span>
                        <span className="twgold_employee_dash_detail_value">
                          {selectedLoan.goldType || 'Ornament'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="twgold_employee_dash_action_panel">
                  <button
                    onClick={() => openAppraisal(selectedLoan)}
                    className="twgold_employee_dash_primary_action"
                    disabled={selectedLoan.status === 'Appraised'}
                  >
                    ⚖️ {selectedLoan.status === 'Appraised' ? 'Already Appraised' : 'Start Appraisal'}
                  </button>
                  <button className="twgold_employee_dash_secondary_action">
                    📄 View Documents
                  </button>
                </div>
              </div>
            ) : (
              <div className="twgold_employee_dash_no_selection">
                <div className="twgold_employee_dash_no_selection_icon">👈</div>
                <div className="twgold_employee_dash_no_selection_text">
                  Select a loan from the table to view customer details and take actions.
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Appraisal Modal */}
        {showAppraisal && selectedLoan && (
          <AppraisalModal
            loan={selectedLoan}
            onSave={saveAppraisal}
            onClose={() => setShowAppraisal(false)}
          />
        )}
      </main>
    </div>
  );
};

export default TwgoldEmployeeDashboard;