import React, { useState } from 'react';
import './TwgoldGrivirenceDashboard.css';

const TwgoldGrivirenceDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const sections = {
    dashboard: {
      title: 'Head Office Dashboard',
      content: (
        <div>
          <div className="grievance_portal_card-row">
            <div className="grievance_portal_card">
              <h3>Total Branches</h3>
              <p>18</p>
            </div>
            <div className="grievance_portal_card">
              <h3>Customer Complaints</h3>
              <p>126</p>
            </div>
            <div className="grievance_portal_card">
              <h3>Employee Complaints</h3>
              <p>14</p>
            </div>
            <div className="grievance_portal_card">
              <h3>Audit Reports</h3>
              <p>42</p>
            </div>
            <div className="grievance_portal_card">
              <h3>Open Issues</h3>
              <p>9</p>
            </div>
          </div>
        </div>
      )
    },
    customer: {
      title: 'Customer Complaint Registration',
      content: (
        <iframe 
          src="customer-complaint.html" 
          title="Customer Complaint"
          className="grievance_portal_iframe"
        ></iframe>
      )
    },
    employee: {
      title: 'Employee Complaint Registration',
      content: (
        <form className="grievance_portal_form">
          <label>Employee Name</label>
          <input type="text" className="grievance_portal_input" />
          
          <label>Employee ID</label>
          <input type="text" className="grievance_portal_input" />
          
          <label>Branch</label>
          <select className="grievance_portal_select">
            <option>Hyderabad</option>
            <option>Kavali</option>
            <option>Rajampet</option>
            <option>Rayachoti</option>
          </select>
          
          <label>Complaint Type</label>
          <select className="grievance_portal_select">
            <option>Workplace Issue</option>
            <option>Salary / HR</option>
            <option>Harassment</option>
            <option>Policy Violation</option>
          </select>
          
          <label>Complaint Details</label>
          <textarea className="grievance_portal_textarea"></textarea>
          
          <button 
            type="button" 
            className="grievance_portal_button grievance_portal_button-primary"
          >
            Submit Complaint
          </button>
        </form>
      )
    },
    audit: {
      title: 'Branch Audit Reports',
      content: (
        <iframe 
          src="branch-audit.html" 
          title="Branch Audit"
          className="grievance_portal_iframe"
        ></iframe>
      )
    },
    daily: {
      title: 'Daily Branch Report (Branch Login Only)',
      content: (
        <form className="grievance_portal_form">
          <label>Select Branch</label>
          <select className="grievance_portal_select">
            <option>Hyderabad</option>
            <option>Kavali</option>
            <option>Rajampet</option>
            <option>Rayachoti</option>
          </select>
          
          <label>Report Summary</label>
          <textarea className="grievance_portal_textarea"></textarea>
          
          <p className="grievance_portal_note">
            * Report will be stored automatically and visible to Head Office only.
          </p>
          
          <button 
            type="button" 
            className="grievance_portal_button grievance_portal_button-success"
          >
            Submit Daily Report
          </button>
        </form>
      )
    },
    branches: {
      title: 'Branches Information (Auto Connected to H.O)',
      content: (
        <table className="grievance_portal_table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Manager</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hyderabad</td>
              <td>R. Venkatesh</td>
              <td>9876543210</td>
              <td>Active</td>
            </tr>
            <tr>
              <td>Kavali</td>
              <td>S. Prasad</td>
              <td>9123456780</td>
              <td>Active</td>
            </tr>
          </tbody>
        </table>
      )
    }
  };

  return (
    <div className="grievance_portal_container">
      {/* SIDEBAR */}
      <div className="grievance_portal_sidebar">
        <h2>SACC GRIEVANCE PORTAL</h2>
        <button 
          className={`grievance_portal_sidebar-button ${activeSection === 'dashboard' ? 'grievance_portal_active' : ''}`}
          onClick={() => setActiveSection('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`grievance_portal_sidebar-button ${activeSection === 'customer' ? 'grievance_portal_active' : ''}`}
          onClick={() => setActiveSection('customer')}
        >
          Customer Complaint
        </button>
        <button 
          className={`grievance_portal_sidebar-button ${activeSection === 'employee' ? 'grievance_portal_active' : ''}`}
          onClick={() => setActiveSection('employee')}
        >
          Employee Complaint
        </button>
        <button 
          className={`grievance_portal_sidebar-button ${activeSection === 'audit' ? 'grievance_portal_active' : ''}`}
          onClick={() => setActiveSection('audit')}
        >
          Branch Audit
        </button>
        <button 
          className={`grievance_portal_sidebar-button ${activeSection === 'daily' ? 'grievance_portal_active' : ''}`}
          onClick={() => setActiveSection('daily')}
        >
          Daily Branch Report
        </button>
        <button 
          className={`grievance_portal_sidebar-button ${activeSection === 'branches' ? 'grievance_portal_active' : ''}`}
          onClick={() => setActiveSection('branches')}
        >
          Branches Info
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="grievance_portal_main">
        <div id={activeSection} className="grievance_portal_section">
          <h2>{sections[activeSection].title}</h2>
          {sections[activeSection].content}
        </div>

        <footer className="grievance_portal_footer">
          © SACC Finance Banking Limited – Grievance & Audit Management System
        </footer>
      </div>
    </div>
  );
};

export default TwgoldGrivirenceDashboard;